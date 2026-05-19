import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { cache } from '@/lib/cache/redis';
import { rateLimitByAction } from '@/lib/utils/rateLimiter';
import { verifyOtpSchema } from '@/lib/utils/validation';
import { handlePrismaError } from '@/lib/utils/prismaErrors';
import { getAuthRateLimitIdentifier } from '@/lib/utils/requestClient';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = verifyOtpSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0]?.message || 'Invalid verification payload' },
                { status: 400 }
            );
        }

        const { email, code } = validation.data;

        // Rate limit check (5 OTP verifications per 15 minutes per user+IP+agent fingerprint)
        const rateLimitIdentifier = getAuthRateLimitIdentifier(request, email);
        const rateLimit = await rateLimitByAction('auth:verify-otp', rateLimitIdentifier, {
            maxRequests: 5,
            windowSeconds: 900,
        });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many verification attempts. Please try again later.' },
                {
                    status: 429,
                    headers: { 'Retry-After': String(rateLimit.reset) }
                }
            );
        }

        // OTP is stored in Redis-backed cache only.
        const cachedOTP = await cache.get<string>(`otp:${email}`);
        if (!cachedOTP) {
            return NextResponse.json(
                { error: 'No verification code found for this email' },
                { status: 400 }
            );
        }

        let storedOTP: { code: string; expiresAt: number };
        try {
            storedOTP = JSON.parse(cachedOTP) as { code: string; expiresAt: number };
        } catch {
            await cache.del(`otp:${email}`);
            return NextResponse.json(
                { error: 'Verification data is invalid. Please request a new code.' },
                { status: 400 }
            );
        }

        // Check if OTP expired
        if (Date.now() > storedOTP.expiresAt) {
            await cache.del(`otp:${email}`);
            return NextResponse.json(
                { error: 'Verification code has expired' },
                { status: 400 }
            );
        }

        // Verify OTP
        if (code !== storedOTP.code) {
            return NextResponse.json(
                { error: 'Invalid verification code' },
                { status: 400 }
            );
        }

        // Mark user as verified
        const user = await prisma.user.update({
            where: { email },
            data: { verified: true },
            select: {
                id: true,
                userName: true,
                email: true,
                verified: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Clear OTP from both cache and memory
        await cache.del(`otp:${email}`);

        return NextResponse.json({
            message: 'Account verified successfully',
        });
    } catch (error) {
        const prismaError = handlePrismaError(error, 'User');
        if (prismaError) {
            return prismaError;
        }

        console.error('OTP verification error:', error);
        return NextResponse.json(
            { error: 'Verification failed. Please try again.' },
            { status: 500 }
        );
    }
}
