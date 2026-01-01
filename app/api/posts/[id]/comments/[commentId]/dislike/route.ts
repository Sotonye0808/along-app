import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data/database';

// POST /api/posts/[id]/comments/[commentId]/dislike - Dislike a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { commentId } = await params;
  try {
    const comment = await db.dislikeComment(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(comment, { status: 200 });
  } catch (error) {
    console.error('Error disliking comment:', error);
    return NextResponse.json(
      { error: 'Failed to dislike comment' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id]/comments/[commentId]/dislike - Remove dislike from a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { commentId } = await params;
  try {
    const comment = await db.undislikeComment(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(comment, { status: 200 });
  } catch (error) {
    console.error('Error removing dislike from comment:', error);
    return NextResponse.json(
      { error: 'Failed to remove dislike from comment' },
      { status: 500 }
    );
  }
}
