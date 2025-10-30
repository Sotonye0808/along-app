import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data/database';

// Generate mock JWT tokens
function generateAccessToken(userId: string) {
    return `mock-access-token-${userId}-${Date.now()}`;
}

export async function POST(request: NextRequest) {
    try {
        // Get refresh token from cookie
        const refreshToken = request.cookies.get('refreshToken')?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { error: 'Refresh token not found' },
                { status: 401 }
            );
        }

        // In production, verify and decode the JWT token
        // For mock, extract userId from token format: mock-refresh-token-{userId}-{timestamp}
        const userId = refreshToken.split('-')[3];

        if (!userId) {
            return NextResponse.json(
                { error: 'Invalid refresh token' },
                { status: 401 }
            );
        }

        // Verify user exists
        const user = await db.getUserById(userId);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
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
            { error: 'Token refresh failed. Please log in again.' },
            { status: 500 }
        );
    }
}
