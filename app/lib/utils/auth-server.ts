/**
 * Server-Side Authentication Utilities
 * Helpers for JWT token verification and user authentication in API routes
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';

/**
 * Extract and verify JWT token from request cookies or Authorization header
 * @param request - NextRequest object
 * @returns userId if token is valid, null otherwise
 */
export async function authenticateRequest(request: NextRequest): Promise<string | null> {
    try {
        // Try to get token from cookie first
        let token = request.cookies.get('accessToken')?.value;

        // If not in cookie, try Authorization header
        if (!token) {
            const authHeader = request.headers.get('Authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return null;
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { userId: string };

        // Verify user exists and is verified
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, verified: true }
        });

        if (!user || !user.verified) {
            return null;
        }

        return decoded.userId;
    } catch (error) {
        // Token is invalid or expired
        return null;
    }
}

/**
 * Get user ID from request (throws error if not authenticated)
 * Use this when authentication is required
 */
export async function requireAuth(request: NextRequest): Promise<string> {
    const userId = await authenticateRequest(request);

    if (!userId) {
        throw new Error('Unauthorized');
    }

    return userId;
}

/**
 * Generate JWT access and refresh tokens
 */
export function generateTokens(userId: string) {
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
