import { NextRequest, NextResponse } from 'next/server';
import { rateLimitByAction } from '@/lib/utils/rateLimiter';
import { getAuthRateLimitIdentifier } from '@/lib/utils/requestClient';

export async function POST(request: NextRequest) {
    try {
        // Rate limit check (30 logout attempts per hour per session fingerprint)
        const rateLimitIdentifier = getAuthRateLimitIdentifier(request);
        const rateLimit = await rateLimitByAction('auth:logout', rateLimitIdentifier, {
            maxRequests: 30,
            windowSeconds: 3600,
        });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many logout attempts. Please try again later.' },
                {
                    status: 429,
                    headers: { 'Retry-After': String(rateLimit.reset) }
                }
            );
        }

        const response = NextResponse.json({
            message: 'Logged out successfully',
        });

        // Clear auth cookies
        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Logout failed. Please try again.' },
            { status: 500 }
        );
    }
}
