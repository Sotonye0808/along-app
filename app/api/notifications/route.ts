import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/utils/auth-server';
import { rateLimitByUser } from '@/lib/utils/rateLimiter';

/**
 * GET /api/notifications
 * Get notifications for authenticated user
 * Returns notifications with actor information
 */
export async function GET(request: NextRequest) {
    try {
        const authUser = await requireAuth(request);

        // Rate limiting
        const rateLimit = await rateLimitByUser(authUser.userId, {
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
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
        const cursor = searchParams.get('cursor');

        // Fetch notifications through recipient relationship
        const notificationRecipients = await prisma.notificationRecipient.findMany({
            where: {
                userId: authUser.userId,
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
        const transformedNotifications = results.map((recipient) => ({
            id: recipient.notification.id,
            userId: recipient.userId,
            type: recipient.notification.type.toLowerCase() as 'like' | 'comment' | 'follow' | 'mention',
            message: `${recipient.notification.actor.firstName} ${recipient.notification.actor.lastName} ${recipient.notification.message}`,
            postId: recipient.notification.postId,
            read: recipient.read,
            createdAt: recipient.notification.createdAt.toISOString(),
            actor: recipient.notification.actor,
        }));

        return NextResponse.json({
            notifications: transformedNotifications,
            nextCursor,
            hasMore,
        });
    } catch (error) {
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
        const rateLimit = await rateLimitByUser(authUser.userId, {
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
        const { notificationId, markAll } = body;

        if (markAll) {
            // Mark all notifications as read for this user
            await prisma.notificationRecipient.updateMany({
                where: {
                    userId: authUser.userId,
                    read: false,
                },
                data: {
                    read: true,
                },
            });

            return NextResponse.json({
                message: 'All notifications marked as read',
            });
        } else if (notificationId) {
            // Mark single notification as read
            const recipient = await prisma.notificationRecipient.findFirst({
                where: {
                    userId: authUser.userId,
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
        console.error('Error updating notification:', error);
        return NextResponse.json(
            { error: 'Failed to update notification' },
            { status: 500 }
        );
    }
}
