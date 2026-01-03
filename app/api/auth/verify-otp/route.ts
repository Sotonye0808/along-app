import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { cache } from '@/lib/cache/redis';
import { rateLimitByIP } from '@/lib/utils/rateLimiter';

// Import the same OTP store from register route (fallback)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
    try {
        // Rate limit check (5 OTP verifications per 15 minutes per IP)
        const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const rateLimit = await rateLimitByIP(clientIP, { maxRequests: 5, windowSeconds: 900 });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many verification attempts. Please try again later.' },
                {
                    status: 429,
                    headers: { 'Retry-After': String(rateLimit.reset) }
                }
            );
        }

        const body: OtpVerification = await request.json();
        const { email, code } = body;

        // Validate required fields
        if (!email || !code) {
            return NextResponse.json(
                { error: 'Email and code are required' },
                { status: 400 }
            );
        }

        // Get stored OTP from Redis cache first, then fallback to in-memory
        let storedOTP: { code: string; expiresAt: number } | null = null;

        const cachedOTP = await cache.get<string>(`otp:${email}`);
        if (cachedOTP) {
            storedOTP = JSON.parse(cachedOTP);
        } else {
            storedOTP = otpStore.get(email) || null;
        }

        if (!storedOTP) {
            return NextResponse.json(
                { error: 'No verification code found for this email' },
                { status: 400 }
            );
        }

        // Check if OTP expired
        if (Date.now() > storedOTP.expiresAt) {
            await cache.del(`otp:${email}`);
            otpStore.delete(email);
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
        otpStore.delete(email);

        return NextResponse.json({
            message: 'Account verified successfully',
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        return NextResponse.json(
            { error: 'Verification failed. Please try again.' },
            { status: 500 }
        );
    }
}
