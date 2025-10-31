import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data/database';

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

// GET /api/posts/[id]/bookmark - Get bookmarks for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing userId' },
                { status: 400 }
            );
        }

        const bookmarks = await db.getBookmarksByUserId(userId);
        return NextResponse.json(bookmarks, { status: 200 });
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bookmarks' },
            { status: 500 }
        );
    }
}
