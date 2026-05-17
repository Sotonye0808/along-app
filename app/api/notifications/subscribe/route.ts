import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/auth-server';
import { rateLimitByUser } from '@/lib/utils/rateLimiter';
import { prisma } from '@/lib/db/prisma';
import { handlePrismaError } from '@/lib/utils/prismaErrors';
import { z } from 'zod';

const subscribeSchema = z.object({
    endpoint: z.string().url('Endpoint must be a valid URL'),
    keys: z.object({
        p256dh: z.string().min(1, 'Missing p256dh key'),
        auth: z.string().min(1, 'Missing auth key'),
    }),
});

/**
 * POST /api/notifications/subscribe
 * Save a Web Push API subscription for the authenticated user.
 * Upserts on (userId, endpoint) so re-subscribing from the same device is safe.
 */
export async function POST(request: NextRequest) {
    try {
        const authUser = await requireAuth(request);

        const rateLimit = await rateLimitByUser(authUser, {
            maxRequests: 10,
            windowSeconds: 3600,
        });
        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429, headers: { 'Retry-After': String(rateLimit.reset) } },
            );
        }

        const parsed = subscribeSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? 'Invalid subscription data' },
                { status: 400 },
            );
        }

        const { endpoint, keys } = parsed.data;

        await prisma.pushSubscription.upsert({
            where: { userId_endpoint: { userId: authUser, endpoint } },
            create: { userId: authUser, endpoint, p256dh: keys.p256dh, auth: keys.auth },
            update: { p256dh: keys.p256dh, auth: keys.auth },
        });

        return NextResponse.json({ message: 'Subscription saved successfully' });
    } catch (error) {
        const prismaError = handlePrismaError(error, 'PushSubscription');
        if (prismaError) return prismaError;
        console.error('[subscribe]', error);
        return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
    }
}

