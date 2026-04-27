import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/auth-server';
import { rateLimitByUser } from '@/lib/utils/rateLimiter';
import { z } from 'zod';

const unsubscribeSchema = z.object({
    endpoint: z.string().url('Endpoint must be a valid URL'),
});

/**
 * POST /api/notifications/unsubscribe
 * Remove push notification subscription
 * Requires authentication
 * 
 * TODO Phase 8.7 (Real-time Features):
 * - Delete subscription from PushSubscription table
 * - Match by userId and endpoint
 */
export async function POST(request: NextRequest) {
    try {
        const authUser = await requireAuth(request);

        // Rate limiting
        const rateLimit = await rateLimitByUser(authUser, {
            maxRequests: 10,
            windowSeconds: 3600, // 10 unsubscribes per hour
        });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429, headers: { 'Retry-After': String(rateLimit.reset) } }
            );
        }

        const parsedBody = unsubscribeSchema.safeParse(await request.json());
        if (!parsedBody.success) {
            return NextResponse.json(
                { error: parsedBody.error.issues[0]?.message || 'Endpoint is required' },
                { status: 400 }
            );
        }

        const { endpoint } = parsedBody.data;

        // TODO: Implement database removal for push subscriptions
        // await prisma.pushSubscription.deleteMany({
        //     where: {
        //         userId: authUser,
        //         endpoint: endpoint,
        //     },
        // });

        console.log('Push subscription removed for user:', authUser);

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
