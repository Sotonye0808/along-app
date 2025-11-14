import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/notifications/unsubscribe
 * Remove push notification subscription
 */
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // In production, remove subscription from database
        // TODO: Implement database removal for push subscriptions
        console.log('Push subscription removed');

        // Mock response
        return NextResponse.json({
            message: 'Subscription removed successfully',
        });
    } catch (error) {
        console.error('Error removing subscription:', error);
        return NextResponse.json(
            { error: 'Failed to remove subscription' },
            { status: 500 }
        );
    }
}
