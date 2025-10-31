import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data/database';

// POST /api/posts/[id]/like - Toggle like/dislike on a post
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();
    const { userId, type } = body; // type: 'like' | 'dislike'

    if (!userId || !type) {
        return NextResponse.json(
            { error: 'Missing userId or type' },
            { status: 400 }
        );
    }

    // Check if user already liked/disliked this post
    const existingLike = await db.getLike(id, userId);

    if (existingLike) {
        if (existingLike.type === type) {
            // Remove like/dislike if same type
            await db.deleteLike(id, userId);
            return NextResponse.json(
                { message: 'Like removed', action: 'removed' },
                { status: 200 }
            );
        } else {
            // Switch between like and dislike
            await db.createLike({ postId: id, userId, type });
            return NextResponse.json(
                { message: 'Like updated', action: 'updated' },
                { status: 200 }
            );
        }
    } else {
        // Create new like/dislike
        await db.createLike({ postId: id, userId, type });
        return NextResponse.json(
            { message: 'Like created', action: 'created' },
            { status: 201 }
        );
    }
}

// DELETE /api/posts/[id]/like - Remove like/dislike
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing userId' },
                { status: 400 }
            );
        }

        const success = await db.deleteLike(id, userId);

        if (!success) {
            return NextResponse.json(
                { error: 'Like not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Like removed successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error removing like:', error);
        return NextResponse.json(
            { error: 'Failed to remove like' },
            { status: 500 }
        );
    }
}
