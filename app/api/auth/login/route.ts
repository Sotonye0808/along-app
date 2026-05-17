import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { rateLimitByIP } from '@/lib/utils/rateLimiter';
import { validateLoginData } from '@/lib/utils/validation';
import { handlePrismaError } from '@/lib/utils/prismaErrors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Generate JWT tokens
function generateTokens(userId: string) {
    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
}

export async function POST(request: NextRequest) {
    try {
        // Rate limit check (10 login attempts per 15 minutes per IP)
        const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const rateLimit = await rateLimitByIP(clientIP, { maxRequests: 10, windowSeconds: 900 });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many login attempts. Please try again later.' },
                {
                    status: 429,
                    headers: { 'Retry-After': String(rateLimit.reset) }
                }
            );
        }

        const body: LoginCredentials = await request.json();

        // Validate input data
        const validation = validateLoginData(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0]?.message || 'Invalid input data' },
                { status: 400 }
            );
        }

        const { email, password } = body;

        // Find user by email with password
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                userName: true,
                firstName: true,
                lastName: true,
                email: true,
                password: true,
                avatar: true,
                bio: true,
                verified: true,
                location: true,
                createdAt: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        posts: true
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Verify password with bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
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

        // Transform response to match frontend interface
        const responseUser = {
            ...userWithoutPassword,
            followers: user._count.followers,
            following: [], // Will be populated by a separate call if needed
            likes: [], // Will be populated by a separate call if needed
            bookmarks: [] // Will be populated by a separate call if needed
        };

        // Create response with tokens
        const response = NextResponse.json({
            user: responseUser,
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
        const prismaError = handlePrismaError(error, 'User');
        if (prismaError) {
            return prismaError;
        }

        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Login failed. Please try again.' },
            { status: 500 }
        );
    }
}
