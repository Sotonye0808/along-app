import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { rateLimitByIP } from '@/lib/utils/rateLimiter';
import jwt from 'jsonwebtoken';

// Generate new access token
function generateAccessToken(userId: string) {
    return jwt.sign(
        { userId },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: '15m' }
    );
}

export async function POST(request: NextRequest) {
    try {
        // Rate limit check (20 refresh attempts per hour per IP)
        const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const rateLimit = await rateLimitByIP(clientIP, { maxRequests: 20, windowSeconds: 3600 });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many token refresh attempts. Please try again later.' },
                {
                    status: 429,
                    headers: { 'Retry-After': String(rateLimit.reset) }
                }
            );
        }

        // Get refresh token from cookie
        const refreshToken = request.cookies.get('refreshToken')?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { error: 'Refresh token not found' },
                { status: 401 }
            );
        }

        // Verify and decode the JWT refresh token
        let decoded: { userId: string };
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid or expired refresh token' },
                { status: 401 }
            );
        }

        const { userId } = decoded;

        // Verify user exists and is verified
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                verified: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (!user.verified) {
            return NextResponse.json(
                { error: 'User account not verified' },
                { status: 403 }
            );
        }

        // Generate new access token
        const accessToken = generateAccessToken(userId);

        // Create response
        const response = NextResponse.json({
            accessToken,
        });

        // Set new access token in cookie
        response.cookies.set('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 15, // 15 minutes
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Token refresh error:', error);
        return NextResponse.json(
            { error: 'Token refresh failed. Please try again.' },
            { status: 500 }
        );
    }
}
return NextResponse.json(
    { error: 'Token refresh failed. Please log in again.' },
    { status: 500 }
);
    }
}
