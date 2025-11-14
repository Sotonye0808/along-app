import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data/database';

// GET /api/notifications/[id] - Get a single notification
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const notification = await db.getNotificationById(id);

        if (!notification) {
            return NextResponse.json(
                { error: 'Notification not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(notification, { status: 200 });
    } catch (error) {
        console.error('Error fetching notification:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notification' },
            { status: 500 }
        );
    }
}

// PATCH /api/notifications/[id] - Update a notification (e.g., mark as read)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updatedNotification = await db.updateNotification(id, body);

        if (!updatedNotification) {
            return NextResponse.json(
                { error: 'Notification not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedNotification, { status: 200 });
    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json(
            { error: 'Failed to update notification' },
            { status: 500 }
        );
    }
}

// DELETE /api/notifications/[id] - Delete a notification
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const deleted = await db.deleteNotification(id);

        if (!deleted) {
            return NextResponse.json(
                { error: 'Notification not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Notification deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting notification:', error);
        return NextResponse.json(
            { error: 'Failed to delete notification' },
            { status: 500 }
        );
    }
}
