import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data/database';

// Generate mock JWT tokens (in production, use actual JWT library)
function generateTokens(userId: string) {
    const accessToken = `mock-access-token-${userId}-${Date.now()}`;
    const refreshToken = `mock-refresh-token-${userId}-${Date.now()}`;
    return { accessToken, refreshToken };
}

export async function POST(request: NextRequest) {
    try {
        const body: LoginCredentials = await request.json();
        const { email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await db.getUserByEmail(email);

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Verify password (in production, use bcrypt.compare)
        if (user.password !== password) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Check if user is verified
        if (!user.verified) {
            return NextResponse.json(
                { error: 'Please verify your account before logging in' },
                { status: 403 }
            );
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user.id);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        // Create response with tokens
        const response = NextResponse.json({
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        });

        // Set tokens in httpOnly cookies (for production security)
        response.cookies.set('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 15, // 15 minutes
            path: '/',
        });

        response.cookies.set('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Login failed. Please try again.' },
            { status: 500 }
        );
    }
}
