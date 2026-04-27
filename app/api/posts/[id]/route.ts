import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis';
import { authenticateRequest, requireAuth } from '@/lib/utils/auth-server';
import { rateLimitByIP } from '@/lib/utils/rateLimiter';
import { uploadImage, deleteImage, validateImageFile } from '@/lib/utils/cloudinary';
import { Prisma } from '@/app/generated/prisma/client';
import { z } from 'zod';
import { handlePrismaError } from '@/lib/utils/prismaErrors';

const postParamsSchema = z.object({
    id: z.string().min(1, 'Post id is required'),
});

const updatePostSchema = z.object({
    title: z.string().trim().min(1).max(280).optional(),
    routes: z.unknown().optional(),
    images: z.array(z.string().min(1)).optional(),
    tags: z.array(z.string().min(1)).optional(),
});

// GET /api/posts/[id] - Get post by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const parsedParams = postParamsSchema.safeParse(await params);
    if (!parsedParams.success) {
        return NextResponse.json(
            { error: parsedParams.error.issues[0]?.message || 'Invalid post id' },
            { status: 400 }
        );
    }

    const { id } = parsedParams.data;

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

        // Check cache first
        const cacheKey = CACHE_KEYS.post(id);
        const cached = await cache.get<string>(cacheKey);

        if (cached) {
            return NextResponse.json(JSON.parse(cached), { status: 200 });
        }

        // Fetch from database
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        userName: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        verified: true,
                        location: true
                    }
                },
                _count: {
                    select: {
                        postComments: true,
                        postLikes: true,
                        postBookmarks: true
                    }
                }
            }
        });

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        // Track view activity for authenticated users
        if (authenticatedUserId) {
            await prisma.userActivity.create({
                data: {
                    userId: authenticatedUserId,
                    type: 'VIEW',
                    postId: id,
                    score: 1
                }
            }).catch(err => console.error('Failed to track view:', err));
        }

        // Transform response
        const transformedPost = {
            ...post,
            routes: post.routes as unknown as Route[],
            comments: post._count.postComments,
            bookmarks: post._count.postBookmarks
        };

        // Cache the result (15 minute TTL)
        await cache.set(cacheKey, JSON.stringify(transformedPost), CACHE_TTL.post);

        return NextResponse.json(transformedPost, { status: 200 });
    } catch (error) {
        const prismaError = handlePrismaError(error, 'Post');
        if (prismaError) {
            return prismaError;
        }

        console.error('Error fetching post:', error);
        return NextResponse.json(
            { error: 'Failed to fetch post' },
            { status: 500 }
        );
    }
}

// PUT /api/posts/[id] - Update post
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const parsedParams = postParamsSchema.safeParse(await params);
    if (!parsedParams.success) {
        return NextResponse.json(
            { error: parsedParams.error.issues[0]?.message || 'Invalid post id' },
            { status: 400 }
        );
    }

    const { id } = parsedParams.data;

    try {
        // Require authentication
        const userId = await requireAuth(request);

        // Verify ownership
        const existingPost = await prisma.post.findUnique({
            where: { id },
            select: { userId: true, images: true }
        });

        if (!existingPost) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        if (existingPost.userId !== userId) {
            return NextResponse.json(
                { error: 'Unauthorized to update this post' },
                { status: 403 }
            );
        }

        const parsedBody = updatePostSchema.safeParse(await request.json());
        if (!parsedBody.success) {
            return NextResponse.json(
                { error: parsedBody.error.issues[0]?.message || 'Invalid post update payload' },
                { status: 400 }
            );
        }

        const { title, routes, images, tags } = parsedBody.data;

        // Handle image updates
        let finalImageUrls = existingPost.images;

        if (images) {
            // Delete old images from Cloudinary
            for (const oldImageUrl of existingPost.images) {
                try {
                    await deleteImage(oldImageUrl);
                } catch (err) {
                    console.error('Failed to delete old image:', err);
                }
            }

            // Upload new images
            const newImageUrls: string[] = [];
            for (const imageBase64 of images) {
                const validation = validateImageFile({ size: imageBase64.length * 0.75 } as File);
                if (!validation.valid) {
                    return NextResponse.json(
                        { error: validation.error },
                        { status: 400 }
                    );
                }

                try {
                    const result = await uploadImage(imageBase64, 'postImage');
                    newImageUrls.push(result.url);
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                    return NextResponse.json(
                        { error: 'Failed to upload images' },
                        { status: 500 }
                    );
                }
            }
            finalImageUrls = newImageUrls;
        }

        // Update post
        const updatedPost = await prisma.post.update({
            where: { id },
            data: {
                ...(title ? { title } : {}),
                ...(routes !== undefined ? { routes: routes as Prisma.InputJsonValue } : {}),
                ...(images ? { images: finalImageUrls } : {}),
                ...(tags ? { tags } : {})
            },
            include: {
                user: {
                    select: {
                        id: true,
                        userName: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        verified: true,
                        location: true
                    }
                },
                _count: {
                    select: {
                        postComments: true,
                        postLikes: true,
                        postBookmarks: true
                    }
                }
            }
        });

        // Invalidate caches
        await cache.del(CACHE_KEYS.post(id));
        await cache.del(CACHE_KEYS.userFeed(userId));

        // Transform response
        const transformedPost = {
            ...updatedPost,
            routes: updatedPost.routes as unknown as Route[],
            comments: updatedPost._count.postComments,
            bookmarks: updatedPost._count.postBookmarks
        };

        return NextResponse.json(transformedPost, { status: 200 });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const prismaError = handlePrismaError(error, 'Post');
        if (prismaError) {
            return prismaError;
        }

        console.error('Error updating post:', error);
        return NextResponse.json(
            { error: 'Failed to update post' },
            { status: 500 }
        );
    }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const parsedParams = postParamsSchema.safeParse(await params);
    if (!parsedParams.success) {
        return NextResponse.json(
            { error: parsedParams.error.issues[0]?.message || 'Invalid post id' },
            { status: 400 }
        );
    }

    const { id } = parsedParams.data;

    try {
        // Require authentication
        const userId = await requireAuth(request);

        // Verify ownership and get post data
        const existingPost = await prisma.post.findUnique({
            where: { id },
            select: { userId: true, images: true }
        });

        if (!existingPost) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        if (existingPost.userId !== userId) {
            return NextResponse.json(
                { error: 'Unauthorized to delete this post' },
                { status: 403 }
            );
        }

        // Delete images from Cloudinary
        for (const imageUrl of existingPost.images) {
            try {
                await deleteImage(imageUrl);
            } catch (err) {
                console.error('Failed to delete image from Cloudinary:', err);
            }
        }

        // Delete post (cascade deletes comments, likes, bookmarks, activities)
        await prisma.post.delete({
            where: { id }
        });

        // Invalidate caches
        await cache.del(CACHE_KEYS.post(id));
        await cache.del(CACHE_KEYS.userFeed(userId));

        return NextResponse.json(
            { message: 'Post deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const prismaError = handlePrismaError(error, 'Post');
        if (prismaError) {
            return prismaError;
        }

        console.error('Error deleting post:', error);
        return NextResponse.json(
            { error: 'Failed to delete post' },
            { status: 500 }
        );
    }
}
