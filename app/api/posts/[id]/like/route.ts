import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/utils/auth-server';
import { rateLimitByUser } from '@/lib/utils/rateLimiter';
import { z } from 'zod';
import { handlePrismaError } from '@/lib/utils/prismaErrors';

const likeParamsSchema = z.object({
    id: z.string().min(1, 'Post id is required'),
});

const likeBodySchema = z.object({
    type: z.enum(['LIKE', 'DISLIKE']),
});

// GET /api/posts/[id]/like - Check if user has liked/disliked this post
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const parsedParams = likeParamsSchema.safeParse(await params);
        if (!parsedParams.success) {
            return NextResponse.json(
                { error: parsedParams.error.issues[0]?.message || 'Invalid post id' },
                { status: 400 }
            );
        }

        const { id } = parsedParams.data;
        const userId = await requireAuth(request);

        const like = await prisma.like.findUnique({
            where: {
                postId_userId: {
                    postId: id,
                    userId
                }
            },
            select: {
                type: true
            }
        });

        return NextResponse.json(
            { data: like },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const prismaError = handlePrismaError(error, 'Like');
        if (prismaError) {
            return prismaError;
        }

        console.error('Error checking like status:', error);
        return NextResponse.json(
            { error: 'Failed to check like status' },
            { status: 500 }
        );
    }
}

// POST /api/posts/[id]/like - Toggle like/dislike on a post
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const parsedParams = likeParamsSchema.safeParse(await params);
    if (!parsedParams.success) {
        return NextResponse.json(
            { error: parsedParams.error.issues[0]?.message || 'Invalid post id' },
            { status: 400 }
        );
    }

    const { id } = parsedParams.data;

    try {
        const userId = await requireAuth(request);

        // Rate limit check (200 likes per hour per user)
        const rateLimit = await rateLimitByUser(userId, { maxRequests: 200, windowSeconds: 3600 });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many like actions. Please try again later.' },
                {
                    status: 429,
                    headers: { 'Retry-After': String(rateLimit.reset) }
                }
            );
        }

        const parsedBody = likeBodySchema.safeParse(await request.json());
        if (!parsedBody.success) {
            return NextResponse.json(
                { error: parsedBody.error.issues[0]?.message || 'Invalid type. Must be LIKE or DISLIKE' },
                { status: 400 }
            );
        }

        const { type } = parsedBody.data;

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

        // Check if user already liked/disliked this post
        const existingLike = await prisma.like.findUnique({
            where: {
                postId_userId: {
                    postId: id,
                    userId
                }
            }
        });

        if (existingLike) {
            if (existingLike.type === type) {
                // Remove like/dislike if same type
                await prisma.like.delete({
                    where: {
                        postId_userId: {
                            postId: id,
                            userId
                        }
                    }
                });
                return NextResponse.json(
                    { message: 'Like removed', action: 'removed' },
                    { status: 200 }
                );
            } else {
                // Update to different type (like to dislike or vice versa)
                await prisma.like.update({
                    where: {
                        postId_userId: {
                            postId: id,
                            userId
                        }
                    },
                    data: { type }
                });
                return NextResponse.json(
                    { message: 'Like updated', action: 'updated', type },
                    { status: 200 }
                );
            }
        } else {
            // Create new like
            await prisma.like.create({
                data: {
                    postId: id,
                    userId,
                    type
                }
            });

            // Track user activity
            await prisma.userActivity.create({
                data: {
                    userId,
                    type: 'LIKE',
                    postId: id,
                    score: type === 'LIKE' ? 2 : 1
                }
            }).catch((err: any) => console.error('Failed to track activity:', err));

            return NextResponse.json(
                { message: 'Like added', action: 'added', type },
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

        const prismaError = handlePrismaError(error, 'Like');
        if (prismaError) {
            return prismaError;
        }

        console.error('Error toggling like:', error);
        return NextResponse.json(
            { error: 'Failed to toggle like' },
            { status: 500 }
        );
    }
}

// DELETE /api/posts/[id]/like - Remove like/dislike
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const parsedParams = likeParamsSchema.safeParse(await params);
        if (!parsedParams.success) {
            return NextResponse.json(
                { error: parsedParams.error.issues[0]?.message || 'Invalid post id' },
                { status: 400 }
            );
        }

        const { id } = parsedParams.data;
        const userId = await requireAuth(request);

        // Check if like exists
        const existingLike = await prisma.like.findUnique({
            where: {
                postId_userId: {
                    postId: id,
                    userId
                }
            }
        });

        if (!existingLike) {
            return NextResponse.json(
                { error: 'Like not found' },
                { status: 404 }
            );
        }

        // Delete the like
        await prisma.like.delete({
            where: {
                postId_userId: {
                    postId: id,
                    userId
                }
            }
        });

        return NextResponse.json(
            { message: 'Like removed successfully' },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const prismaError = handlePrismaError(error, 'Like');
        if (prismaError) {
            return prismaError;
        }

        console.error('Error removing like:', error);
        return NextResponse.json(
            { error: 'Failed to remove like' },
            { status: 500 }
        );
    }
}
