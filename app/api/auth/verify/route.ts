import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data/database';

export async function GET(request: NextRequest) {
    try {
        // Get access token from cookie
        const accessToken = request.cookies.get('accessToken')?.value;

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // In production, verify and decode the JWT token
        // For mock, extract userId from token format: mock-access-token-{userId}-{timestamp}
        const userId = accessToken.split('-')[3];

        if (!userId) {
            return NextResponse.json(
                { error: 'Invalid token' },
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

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            authenticated: true,
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json(
            { error: 'Authentication verification failed' },
            { status: 500 }
        );
    }
}
