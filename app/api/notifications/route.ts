import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/utils/auth-server';
import { rateLimitByUser } from '@/lib/utils/rateLimiter';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis';
import { Prisma } from '@/app/generated/prisma/client';
import { z } from 'zod';

const notificationsQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(50).optional().default(20),
    cursor: z.string().cuid().optional().nullable(),
});

/**
 * GET /api/notifications
 * Get notifications for authenticated user
 * Returns notifications with actor information
 */
export async function GET(request: NextRequest) {
    try {
        // Authenticate user - if fails, return 401
        let authUser: string;
        try {
            authUser = await requireAuth(request);
        } catch (authError) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in again.' },
                { status: 401 }
            );
        }

        // Rate limiting
        const rateLimit = await rateLimitByUser(authUser, {
            maxRequests: 100,
            windowSeconds: 60, // 100 requests per minute
        });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429, headers: { 'Retry-After': String(rateLimit.reset) } }
            );
        }

        const { searchParams } = new URL(request.url);
        const parsedQuery = notificationsQuerySchema.safeParse({
            limit: searchParams.get('limit') ?? undefined,
            cursor: searchParams.get('cursor'),
        });

        if (!parsedQuery.success) {
            return NextResponse.json(
                { error: parsedQuery.error.issues[0]?.message || 'Invalid query parameters' },
                { status: 400 }
            );
        }

        const { limit, cursor } = parsedQuery.data;

        const cacheKey = `${CACHE_KEYS.searchResults(authUser, 'notifications')}:${cursor || 'initial'}:${limit}`;
        const cached = await cache.get<string>(cacheKey);
        if (cached) {
            const parsedCache = JSON.parse(cached) as { data: Notification[]; nextCursor: string | null };
            const response = NextResponse.json(parsedCache.data, { status: 200 });
            if (parsedCache.nextCursor) {
                response.headers.set('x-next-cursor', parsedCache.nextCursor);
            }
            return response;
        }

        // Fetch notifications through recipient relationship
        const notificationRecipients = await prisma.notificationRecipient.findMany({
            where: {
                userId: authUser,
            },
            include: {
                notification: {
                    include: {
                        actor: {
                            select: {
                                id: true,
                                userName: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                                verified: true,
                            },
                        },
                        post: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                        comment: {
                            select: {
                                id: true,
                                text: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        });

        // Check if there are more results
        const hasMore = notificationRecipients.length > limit;
        const results = hasMore ? notificationRecipients.slice(0, -1) : notificationRecipients;
        const nextCursor = hasMore ? results[results.length - 1].id : null;

        // Transform to match frontend expectations
        const transformedNotifications = results.map((recipient: any) => ({
            id: recipient.notification.id,
            userId: recipient.userId,
            type: recipient.notification.type.toLowerCase() as 'like' | 'comment' | 'follow' | 'mention',
            message: `${recipient.notification.actor.firstName} ${recipient.notification.actor.lastName} ${recipient.notification.message}`,
            postId: recipient.notification.postId,
            read: recipient.read,
            createdAt: recipient.notification.createdAt.toISOString(),
            actor: recipient.notification.actor,
        }));

        await cache.set(
            cacheKey,
            JSON.stringify({
                data: transformedNotifications,
                nextCursor,
            }),
            CACHE_TTL.search
        );

        // Return array directly for frontend compatibility
        const response = NextResponse.json(transformedNotifications, { status: 200 });
        if (nextCursor) {
            response.headers.set('x-next-cursor', nextCursor);
        }
        return response;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return NextResponse.json(
                    { error: 'Notification resource not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json(
                { error: 'Database request failed' },
                { status: 400 }
            );
        }

        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/notifications
 * Mark notification(s) as read
 * Supports single notification or marking all as read
 */
export async function PATCH(request: NextRequest) {
    try {
        const authUser = await requireAuth(request);

        // Rate limiting
        const rateLimit = await rateLimitByUser(authUser, {
            maxRequests: 50,
            windowSeconds: 60, // 50 updates per minute
        });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429, headers: { 'Retry-After': String(rateLimit.reset) } }
            );
        }

        const body = await request.json();
        const patchSchema = z.object({
            notificationId: z.string().cuid().optional(),
            markAll: z.boolean().optional().default(false),
        });
        const parsedBody = patchSchema.safeParse(body);

        if (!parsedBody.success) {
            return NextResponse.json(
                { error: parsedBody.error.issues[0]?.message || 'Invalid request payload' },
                { status: 400 }
            );
        }

        const { notificationId, markAll } = parsedBody.data;

        if (markAll) {
            // Mark all notifications as read for this user
            await prisma.notificationRecipient.updateMany({
                where: {
                    userId: authUser,
                    read: false,
                },
                data: {
                    read: true,
                },
            });

            await cache.delPattern(`${CACHE_KEYS.searchResults(authUser, 'notifications')}:*`);

            return NextResponse.json({
                message: 'All notifications marked as read',
            });
        } else if (notificationId) {
            // Mark single notification as read
            const recipient = await prisma.notificationRecipient.findFirst({
                where: {
                    userId: authUser,
                    notification: {
                        id: notificationId,
                    },
                },
            });

            if (!recipient) {
                return NextResponse.json(
                    { error: 'Notification not found' },
                    { status: 404 }
                );
            }

            await prisma.notificationRecipient.update({
                where: { id: recipient.id },
                data: { read: true },
            });

            await cache.delPattern(`${CACHE_KEYS.searchResults(authUser, 'notifications')}:*`);

            return NextResponse.json({
                message: 'Notification marked as read',
            });
        } else {
            return NextResponse.json(
                { error: 'Missing notificationId or markAll parameter' },
                { status: 400 }
            );
        }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return NextResponse.json(
                    { error: 'Notification resource not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json(
                { error: 'Database request failed' },
                { status: 400 }
            );
        }

        console.error('Error updating notification:', error);
        return NextResponse.json(
            { error: 'Failed to update notification' },
            { status: 500 }
        );
    }
}
