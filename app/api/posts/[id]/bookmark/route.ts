import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data/database';

// GET /api/posts/[id]/bookmark - Check if user has bookmarked this post
export async function GET(
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

        const bookmark = await db.getBookmark(id, userId);

        return NextResponse.json(
            { data: bookmark },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error checking bookmark:', error);
        return NextResponse.json(
            { error: 'Failed to check bookmark' },
            { status: 500 }
        );
    }
}

// POST /api/posts/[id]/bookmark - Toggle bookmark on a post
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing userId' },
                { status: 400 }
            );
        }

        // Check if bookmark already exists
        const existingBookmark = await db.getBookmark(id, userId);

        if (existingBookmark) {
            // Remove bookmark
            await db.deleteBookmark(id, userId);
            return NextResponse.json(
                { message: 'Bookmark removed', action: 'removed' },
                { status: 200 }
            );
        } else {
            // Create bookmark
            await db.createBookmark({ postId: id, userId });
            return NextResponse.json(
                { message: 'Bookmark created', action: 'created' },
                { status: 201 }
            );
        }
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        return NextResponse.json(
            { error: 'Failed to toggle bookmark' },
            { status: 500 }
        );
    }
}
