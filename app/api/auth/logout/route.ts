import { NextRequest, NextResponse } from 'next/server';
import { rateLimitByIP } from '@/lib/utils/rateLimiter';

export async function POST(request: NextRequest) {
    try {
        // Rate limit check (10 logout attempts per hour per IP)
        const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const rateLimit = await rateLimitByIP(clientIP, { maxRequests: 10, windowSeconds: 3600 });

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
