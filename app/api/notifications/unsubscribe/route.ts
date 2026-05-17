import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/auth-server';
import { rateLimitByUser } from '@/lib/utils/rateLimiter';
import { prisma } from '@/lib/db/prisma';
import { handlePrismaError } from '@/lib/utils/prismaErrors';
import { z } from 'zod';

const unsubscribeSchema = z.object({
    endpoint: z.string().url('Endpoint must be a valid URL'),
});

/**
 * POST /api/notifications/unsubscribe
 * Remove a Web Push API subscription for the authenticated user.
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

        const parsed = unsubscribeSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? 'Endpoint is required' },
                { status: 400 },
            );
        }

        await prisma.pushSubscription.deleteMany({
            where: { userId: authUser, endpoint: parsed.data.endpoint },
        });

        return NextResponse.json({ message: 'Subscription removed successfully' });
    } catch (error) {
        const prismaError = handlePrismaError(error, 'PushSubscription');
        if (prismaError) return prismaError;
        console.error('[unsubscribe]', error);
        return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
    }
}

