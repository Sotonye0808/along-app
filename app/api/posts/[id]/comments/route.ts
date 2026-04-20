import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticateRequest, requireAuth } from '@/lib/utils/auth-server';
import { rateLimitByUser, rateLimitByIP } from '@/lib/utils/rateLimiter';

// GET /api/posts/[id]/comments - Get comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
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
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
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
  const { id } = await params;

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

    const body = await request.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }

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
        text: text.trim()
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
    }).catch(err => console.error('Failed to track activity:', err));

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
