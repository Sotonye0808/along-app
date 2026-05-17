import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { rateLimitByIP } from '@/lib/utils/rateLimiter';
import { handlePrismaError } from '@/lib/utils/prismaErrors';

const commentParamsSchema = z.object({
  id: z.string().cuid('Invalid post ID'),
  commentId: z.string().cuid('Invalid comment ID'),
});

// POST /api/posts/[id]/comments/[commentId]/like - Like a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const rawParams = await params;
  const parsedParams = commentParamsSchema.safeParse(rawParams);

  if (!parsedParams.success) {
    return NextResponse.json(
      { error: parsedParams.error.issues[0]?.message || 'Invalid route parameters' },
      { status: 400 }
    );
  }

  const { id, commentId } = parsedParams.data;

  try {
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = await rateLimitByIP(clientIP, { maxRequests: 200, windowSeconds: 3600 });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many reaction actions. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.reset) },
        }
      );
    }

    const existingComment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        postId: id,
      },
      select: {
        id: true,
      },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        likes: {
          increment: 1,
        },
      },
      select: {
        id: true,
        postId: true,
        likes: true,
        dislikes: true,
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(comment, { status: 200 });
  } catch (error) {
    const prismaError = handlePrismaError(error, 'Comment');
    if (prismaError) {
      return prismaError;
    }

    console.error('Error liking comment:', error);
    return NextResponse.json(
      { error: 'Failed to like comment' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id]/comments/[commentId]/like - Unlike a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const rawParams = await params;
  const parsedParams = commentParamsSchema.safeParse(rawParams);

  if (!parsedParams.success) {
    return NextResponse.json(
      { error: parsedParams.error.issues[0]?.message || 'Invalid route parameters' },
      { status: 400 }
    );
  }

  const { id, commentId } = parsedParams.data;

  try {
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = await rateLimitByIP(clientIP, { maxRequests: 200, windowSeconds: 3600 });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many reaction actions. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.reset) },
        }
      );
    }

    const existingComment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        postId: id,
      },
      select: {
        id: true,
        likes: true,
      },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        likes: {
          decrement: existingComment.likes > 0 ? 1 : 0,
        },
      },
      select: {
        id: true,
        postId: true,
        likes: true,
        dislikes: true,
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(comment, { status: 200 });
  } catch (error) {
    const prismaError = handlePrismaError(error, 'Comment');
    if (prismaError) {
      return prismaError;
    }

    console.error('Error unliking comment:', error);
    return NextResponse.json(
      { error: 'Failed to unlike comment' },
      { status: 500 }
    );
  }
}
