import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/utils/auth-server';
import { rateLimitByUser } from '@/lib/utils/rateLimiter';

// GET /api/posts/[id]/bookmark - Check if user has bookmarked this post
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = await requireAuth(request);

        const bookmark = await prisma.bookmark.findUnique({
            where: {
                postId_userId: {
                    postId: id,
                    userId
                }
            },
            select: {
                id: true,
                createdAt: true
            }
        });

        return NextResponse.json(
            { data: bookmark },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }
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
        const userId = await requireAuth(request);

        // Rate limit check (100 bookmarks per hour per user)
        const rateLimit = await rateLimitByUser(userId, { maxRequests: 100, windowSeconds: 3600 });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many bookmark actions. Please try again later.' },
                {
                    status: 429,
                    headers: { 'Retry-After': String(rateLimit.reset) }
                }
            );
        }

        // Verify post exists
        const post = await prisma.post.findUnique({
            where: { id },
            select: { id: true }
        });

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        // Check if bookmark already exists
        const existingBookmark = await prisma.bookmark.findUnique({
            where: {
                postId_userId: {
                    postId: id,
                    userId
                }
            }
        });

        if (existingBookmark) {
            // Remove bookmark
            await prisma.bookmark.delete({
                where: {
                    postId_userId: {
                        postId: id,
                        userId
                    }
                }
            });
            return NextResponse.json(
                { message: 'Bookmark removed', action: 'removed' },
                { status: 200 }
            );
        } else {
            // Add bookmark
            await prisma.bookmark.create({
                data: {
                    postId: id,
                    userId
                }
            });

            // Track user activity
            await prisma.userActivity.create({
                data: {
                    userId,
                    type: 'BOOKMARK',
                    postId: id,
                    score: 3
                }
            }).catch(err => console.error('Failed to track activity:', err));

            return NextResponse.json(
                { message: 'Bookmark added', action: 'added' },
                { status: 201 }
            );
        }
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }
        console.error('Error toggling bookmark:', error);
        return NextResponse.json(
            { error: 'Failed to toggle bookmark' },
            { status: 500 }
        );
    }
}
