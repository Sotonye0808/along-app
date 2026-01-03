import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { rateLimitByIP } from '@/lib/utils/rateLimiter';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis';

/**
 * GET /api/users
 * Get list of users (paginated, searchable)
 * Public endpoint with rate limiting
 */
export async function GET(request: NextRequest) {
    try {
        // Rate limiting for guests
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const rateLimit = await rateLimitByIP(ip, {
            maxRequests: 100,
            windowSeconds: 60, // 100 requests per minute
        });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429, headers: { 'Retry-After': String(rateLimit.reset) } }
            );
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
        const cursor = searchParams.get('cursor');

        // Build where clause for search
        const whereClause = search
            ? {
                OR: [
                    { userName: { contains: search, mode: 'insensitive' as const } },
                    { firstName: { contains: search, mode: 'insensitive' as const } },
                    { lastName: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        // Fetch users with pagination
        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                userName: true,
                firstName: true,
                lastName: true,
                avatar: true,
                bio: true,
                location: true,
                verified: true,
                createdAt: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                    },
                },
            },
            orderBy: [
                { verified: 'desc' },
                { createdAt: 'desc' },
            ],
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        });

        // Check if there are more results
        const hasMore = users.length > limit;
        const results = hasMore ? users.slice(0, -1) : users;
        const nextCursor = hasMore ? results[results.length - 1].id : null;

        // Transform to match frontend expectations
        const transformedUsers = results.map((user) => ({
            id: user.id,
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            bio: user.bio,
            location: user.location,
            verified: user.verified,
            followers: user._count.followers,
            createdAt: user.createdAt.toISOString(),
        }));

        return NextResponse.json({
            users: transformedUsers,
            nextCursor,
            hasMore,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
