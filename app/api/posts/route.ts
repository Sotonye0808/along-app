import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis';
import { authenticateRequest, requireAuth } from '@/lib/utils/auth-server';
import { rateLimitByUser, rateLimitByIP } from '@/lib/utils/rateLimiter';
import { getPersonalizedFeed } from '@/lib/services/feedService';
import { uploadImage, validateImageFile } from '@/lib/utils/cloudinary';

// GET /api/posts - Get personalized feed
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const cursor = searchParams.get('cursor');
        const limit = parseInt(searchParams.get('limit') || '20');
        const userId = searchParams.get('userId'); // For user-specific posts

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

        // If requesting specific user's posts
        if (userId) {
            const posts = await prisma.post.findMany({
                where: { userId },
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
                },
                orderBy: { createdAt: 'desc' },
                take: limit
            });

            // Transform to match frontend interface
            const transformedPosts = (posts || []).map(post => ({
                id: post.id,
                userId: post.userId,
                title: post.title,
                routes: post.routes as unknown as Route[],
                images: post.images,
                tags: post.tags,
                likes: post.likes,
                dislikes: post.dislikes,
                comments: post._count.postComments,
                bookmarks: post._count.postBookmarks,
                views: post.views,
                createdAt: post.createdAt.toISOString(),
                updatedAt: post.updatedAt.toISOString(),
            }));

            return NextResponse.json(transformedPosts, { status: 200 });
        }

        // Use personalized feed for authenticated users
        if (authenticatedUserId) {
            const cacheKey = `${CACHE_KEYS.userFeed(authenticatedUserId)}:${cursor || 'initial'}`;

            // Check cache first
            const cached = await cache.get<string>(cacheKey);
            if (cached) {
                const parsedCache = JSON.parse(cached);
                // Return only the data array, not the wrapped object
                return NextResponse.json(parsedCache.data || parsedCache, { status: 200 });
            }

            // Get personalized feed from algorithm
            const feed = await getPersonalizedFeed(authenticatedUserId, cursor || undefined, limit);

            // Cache the result (5 minute TTL)
            await cache.set(cacheKey, JSON.stringify(feed), CACHE_TTL.feed);

            // Return only the data array, not the wrapped object
            return NextResponse.json(feed.data || [], { status: 200 });
        }

        // For guests, return recent posts
        const posts = await prisma.post.findMany({
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
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            cursor: cursor ? { id: cursor } : undefined,
            skip: cursor ? 1 : 0
        });

        // Transform to match frontend interface
        const transformedPosts = (posts || []).map(post => ({
            id: post.id,
            userId: post.userId,
            title: post.title,
            routes: post.routes as unknown as Route[],
            images: post.images,
            tags: post.tags,
            likes: post.likes,
            dislikes: post.dislikes,
            comments: post._count.postComments,
            bookmarks: post._count.postBookmarks,
            views: post.views,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
        }));

        const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null;

        return NextResponse.json(transformedPosts, { status: 200 });

    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch posts' },
            { status: 500 }
        );
    }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
    try {
        // Require authentication
        const userId = await requireAuth(request);

        // Rate limit check (10 posts per hour per user)
        const rateLimit = await rateLimitByUser(userId, { maxRequests: 10, windowSeconds: 3600 });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many posts created. Please try again later.' },
                {
                    status: 429,
                    headers: { 'Retry-After': String(rateLimit.reset) }
                }
            );
        }

        const body = await request.json();
        const { title, routes, images, tags } = body;

        // Validate required fields
        if (!title || !routes || routes.length === 0) {
            return NextResponse.json(
                { error: 'Title and at least one route are required' },
                { status: 400 }
            );
        }

        // Upload images to Cloudinary if provided
        let uploadedImageUrls: string[] = [];

        if (images && images.length > 0) {
            for (const imageBase64 of images) {
                // Validate image
                const validation = validateImageFile({ size: imageBase64.length * 0.75 } as File);
                if (!validation.valid) {
                    return NextResponse.json(
                        { error: validation.error },
                        { status: 400 }
                    );
                }

                try {
                    const result = await uploadImage(imageBase64, 'postImage');
                    uploadedImageUrls.push(result.url);
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                    return NextResponse.json(
                        { error: 'Failed to upload images' },
                        { status: 500 }
                    );
                }
            }
        }

        // Create post in database
        const newPost = await prisma.post.create({
            data: {
                userId,
                title,
                routes: routes as any, // JSON field
                images: uploadedImageUrls,
                tags: tags || []
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

        // Track user activity
        await prisma.userActivity.create({
            data: {
                userId,
                type: 'SHARE',
                postId: newPost.id,
                score: 5
            }
        }).catch(err => console.error('Failed to track activity:', err));

        // Invalidate user's feed cache
        const feedPattern = CACHE_KEYS.userFeed(userId);
        await cache.del(feedPattern).catch(err => console.error('Cache invalidation failed:', err));

        // Transform response
        const transformedPost = {
            ...newPost,
            routes: newPost.routes as unknown as Route[],
            comments: newPost._count.postComments,
            bookmarks: newPost._count.postBookmarks
        };

        return NextResponse.json(transformedPost, { status: 201 });

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        console.error('Error creating post:', error);
        return NextResponse.json(
            { error: 'Failed to create post' },
            { status: 500 }
        );
    }
}
