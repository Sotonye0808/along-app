import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data/database';

// GET /api/notifications - Get notifications for a user
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

        const notifications = await db.getNotificationsByUserId(userId);
        return NextResponse.json(notifications, { status: 200 });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

// POST /api/notifications - Create a notification
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const newNotification = await db.createNotification(body);

        return NextResponse.json(newNotification, { status: 201 });
    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json(
            { error: 'Failed to create notification' },
            { status: 500 }
        );
    }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { notificationId, userId, markAll } = body;

        if (markAll && userId) {
            await db.markAllNotificationsAsRead(userId);
            return NextResponse.json(
                { message: 'All notifications marked as read' },
                { status: 200 }
            );
        } else if (notificationId) {
            const success = await db.markNotificationAsRead(notificationId);
            if (!success) {
                return NextResponse.json(
                    { error: 'Notification not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json(
                { message: 'Notification marked as read' },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { error: 'Missing notificationId or userId' },
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
