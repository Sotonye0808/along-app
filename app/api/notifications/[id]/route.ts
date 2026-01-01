import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/utils/auth-server';
import { rateLimitByUser } from '@/lib/utils/rateLimiter';

/**
 * GET /api/notifications/[id]
 * Get a single notification
 * Requires authentication
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authUser = await requireAuth(request);

        // Rate limiting
        const rateLimit = await rateLimitByUser(authUser.userId, {
            maxRequests: 100,
            windowSeconds: 60,
        });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429, headers: { 'Retry-After': String(rateLimit.reset) } }
            );
        }

        // Find notification through recipient
        const recipient = await prisma.notificationRecipient.findFirst({
            where: {
                userId: authUser.userId,
                notification: {
                    id: id,
                },
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
                    },
                },
            },
        });

        if (!recipient) {
            return NextResponse.json(
                { error: 'Notification not found' },
                { status: 404 }
            );
        }

        // Transform to match frontend expectations
        const transformedNotification = {
            id: recipient.notification.id,
            userId: recipient.userId,
            type: recipient.notification.type.toLowerCase() as 'like' | 'comment' | 'follow' | 'mention',
            message: `${recipient.notification.actor.firstName} ${recipient.notification.actor.lastName} ${recipient.notification.message}`,
            postId: recipient.notification.postId,
            read: recipient.read,
            createdAt: recipient.notification.createdAt.toISOString(),
            actor: recipient.notification.actor,
        };

        return NextResponse.json(transformedNotification);
    } catch (error) {
        console.error('Error fetching notification:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notification' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/notifications/[id]
 * Mark notification as read
 * Requires authentication and ownership
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authUser = await requireAuth(request);

        // Rate limiting
        const rateLimit = await rateLimitByUser(authUser.userId, {
            maxRequests: 50,
            windowSeconds: 60,
        });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429, headers: { 'Retry-After': String(rateLimit.reset) } }
            );
        }

        // Find recipient
        const recipient = await prisma.notificationRecipient.findFirst({
            where: {
                userId: authUser.userId,
                notification: {
                    id: id,
                },
            },
        });

        if (!recipient) {
            return NextResponse.json(
                { error: 'Notification not found' },
                { status: 404 }
            );
        }

        // Update read status
        await prisma.notificationRecipient.update({
            where: { id: recipient.id },
            data: { read: true },
        });

        return NextResponse.json({
            message: 'Notification marked as read',
        });
    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json(
            { error: 'Failed to update notification' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/notifications/[id]
 * Delete a notification for the authenticated user
 * Requires authentication and ownership
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authUser = await requireAuth(request);

        // Rate limiting
        const rateLimit = await rateLimitByUser(authUser.userId, {
            maxRequests: 50,
            windowSeconds: 60,
        });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429, headers: { 'Retry-After': String(rateLimit.reset) } }
            );
        }

        // Find recipient
        const recipient = await prisma.notificationRecipient.findFirst({
            where: {
                userId: authUser.userId,
                notification: {
                    id: id,
                },
            },
        });

        if (!recipient) {
            return NextResponse.json(
                { error: 'Notification not found' },
                { status: 404 }
            );
        }

        // Delete recipient (not the notification itself, as it may be for multiple users)
        await prisma.notificationRecipient.delete({
            where: { id: recipient.id },
        });

        return NextResponse.json({
            message: 'Notification deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        return NextResponse.json(
            { error: 'Failed to delete notification' },
            { status: 500 }
        );
    }
}
