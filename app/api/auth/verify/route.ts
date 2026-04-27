import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db/prisma';
import { rateLimitByIP } from '@/lib/utils/rateLimiter';
import { handlePrismaError } from '@/lib/utils/prismaErrors';
import { z } from 'zod';

const tokenPayloadSchema = z.object({
    userId: z.string().min(1, 'Invalid token payload'),
});

export async function GET(request: NextRequest) {
    try {
        // Rate limit check (60 auth verification attempts per hour per IP)
        const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const rateLimit = await rateLimitByIP(clientIP, { maxRequests: 60, windowSeconds: 3600 });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many verification requests. Please try again later.' },
                {
                    status: 429,
                    headers: { 'Retry-After': String(rateLimit.reset) }
                }
            );
        }

        // Get access token from cookie
        const accessToken = request.cookies.get('accessToken')?.value;

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        let decoded: { userId: string };
        try {
            const verifiedToken = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!);
            const parsedPayload = tokenPayloadSchema.safeParse(verifiedToken);
            if (!parsedPayload.success) {
                return NextResponse.json(
                    { error: parsedPayload.error.issues[0]?.message || 'Invalid token payload' },
                    { status: 401 }
                );
            }

            decoded = parsedPayload.data;
        } catch {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        const userId = decoded.userId;

        if (!userId) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                userName: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                bio: true,
                verified: true,
                location: true,
                createdAt: true,
                _count: {
                    select: {
                        followers: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const responseUser = {
            ...user,
            followers: user._count.followers,
            following: [],
            likes: [],
            bookmarks: [],
        };

        return NextResponse.json({
            authenticated: true,
            user: responseUser,
        });
    } catch (error) {
        const prismaError = handlePrismaError(error, 'User');
        if (prismaError) {
            return prismaError;
        }

        console.error('Token verification error:', error);
        return NextResponse.json(
            { error: 'Authentication verification failed' },
            { status: 500 }
        );
    }
}
