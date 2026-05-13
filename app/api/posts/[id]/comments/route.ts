import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticateRequest, requireAuth } from '@/lib/utils/auth-server';
import { rateLimitByUser, rateLimitByIP } from '@/lib/utils/rateLimiter';
import { z } from 'zod';
import { handlePrismaError } from '@/lib/utils/prismaErrors';
import { cache, CACHE_TTL } from '@/lib/cache/redis';

const commentsParamsSchema = z.object({
  id: z.string().min(1, 'Post id is required'),
});

const createCommentSchema = z.object({
  text: z.string().trim().min(1, 'Comment text is required').max(2000, 'Comment is too long'),
});

const commentsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  cursor: z.string().cuid('Invalid comment cursor').optional().nullable(),
});

// GET /api/posts/[id]/comments - Get comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const parsedParams = commentsParamsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json(
      { error: parsedParams.error.issues[0]?.message || 'Invalid post id' },
      { status: 400 }
    );
  }

  const { id } = parsedParams.data;

  try {
    const searchParams = request.nextUrl.searchParams;
    const parsedQuery = commentsQuerySchema.safeParse({
      limit: searchParams.get('limit') ?? undefined,
      cursor: searchParams.get('cursor'),
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: parsedQuery.error.issues[0]?.message || 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const { limit, cursor } = parsedQuery.data;

    // Rate limit check for unauthenticated requests
    const authenticatedUserId = await authenticateRequest(request);

    if (!authenticatedUserId) {
      const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const rateLimit = await rateLimitByIP(clientIP, { maxRequests: 100, windowSeconds: 60 });

      if (!rateLimit.success) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          {
            status: 429,
            headers: { 'Retry-After': String(rateLimit.reset) }
          }
        );
      }
    }

    const cacheKey = `comments:${id}:${cursor || 'initial'}:${limit}`;
    const cached = await cache.get<string>(cacheKey);
    if (cached) {
      const parsedCache = JSON.parse(cached) as { comments: unknown[]; nextCursor: string | null };
      const cachedResponse = NextResponse.json(parsedCache.comments, { status: 200 });
      if (parsedCache.nextCursor) {
        cachedResponse.headers.set('x-next-cursor', parsedCache.nextCursor);
      }
      return cachedResponse;
    }

    const comments = await prisma.comment.findMany({
      where: { postId: id },
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            firstName: true,
            lastName: true,
            avatar: true,
            verified: true
          }
        }
      },
      orderBy: { id: 'desc' },
      take: limit + 1,
      ...(cursor
        ? {
          cursor: { id: cursor },
          skip: 1,
        }
        : {}),
    });

    const hasNextPage = comments.length > limit;
    const pageComments = hasNextPage ? comments.slice(0, limit) : comments;
    const nextCursor = hasNextPage ? pageComments[pageComments.length - 1]?.id ?? null : null;

    await cache.set(
      cacheKey,
      JSON.stringify({ comments: pageComments, nextCursor }),
      CACHE_TTL.search
    );

    const response = NextResponse.json(pageComments, { status: 200 });
    if (nextCursor) {
      response.headers.set('x-next-cursor', nextCursor);
    }

    return response;
  } catch (error) {
    const prismaError = handlePrismaError(error, 'Comment');
    if (prismaError) {
      return prismaError;
    }

    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/posts/[id]/comments - Create a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const parsedParams = commentsParamsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json(
      { error: parsedParams.error.issues[0]?.message || 'Invalid post id' },
      { status: 400 }
    );
  }

  const { id } = parsedParams.data;

  try {
    const userId = await requireAuth(request);

    // Rate limit check (50 comments per hour per user)
    const rateLimit = await rateLimitByUser(userId, { maxRequests: 50, windowSeconds: 3600 });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many comments. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.reset) }
        }
      );
    }

    const parsedBody = createCommentSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.issues[0]?.message || 'Invalid comment payload' },
        { status: 400 }
      );
    }

    const { text } = parsedBody.data;

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, userId: true }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Create comment
    const newComment = await prisma.comment.create({
      data: {
        postId: id,
        userId,
        text
      },
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            firstName: true,
            lastName: true,
            avatar: true,
            verified: true
          }
        }
      }
    });

    // Track user activity
    await prisma.userActivity.create({
      data: {
        userId,
        type: 'COMMENT',
        postId: id,
        score: 3
      }
    }).catch((err: any) => console.error('Failed to track activity:', err));

    await cache.delPattern(`comments:${id}:*`);

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const prismaError = handlePrismaError(error, 'Comment');
    if (prismaError) {
      return prismaError;
    }

    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
