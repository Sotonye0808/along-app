import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { rateLimitByIP } from '@/lib/utils/rateLimiter';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis';
import { Prisma } from '@/app/generated/prisma/client';
import { z } from 'zod';

const usersQuerySchema = z.object({
    search: z.string().max(100).optional().default(''),
    limit: z.coerce.number().int().min(1).max(50).optional().default(20),
    cursor: z.string().cuid().optional().nullable(),
});

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
        const parsedQuery = usersQuerySchema.safeParse({
            search: searchParams.get('search') ?? undefined,
            limit: searchParams.get('limit') ?? undefined,
            cursor: searchParams.get('cursor'),
        });

        if (!parsedQuery.success) {
            return NextResponse.json(
                { error: parsedQuery.error.issues[0]?.message || 'Invalid query parameters' },
                { status: 400 }
            );
        }

        const { search, limit, cursor } = parsedQuery.data;

        const cacheKey = `${CACHE_KEYS.searchResults(search || 'all-users', 'users')}:${cursor || 'initial'}:${limit}`;
        const cached = await cache.get<string>(cacheKey);

        if (cached) {
            const parsedCache = JSON.parse(cached) as { data: User[]; nextCursor: string | null };
            const response = NextResponse.json(parsedCache.data, { status: 200 });
            if (parsedCache.nextCursor) {
                response.headers.set('x-next-cursor', parsedCache.nextCursor);
            }
            return response;
        }

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
        const transformedUsers = (results || []).map((user: any) => ({
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

        const payload = {
            data: transformedUsers,
            nextCursor,
        };

        await cache.set(cacheKey, JSON.stringify(payload), CACHE_TTL.search);

        const response = NextResponse.json(transformedUsers, { status: 200 });
        if (nextCursor) {
            response.headers.set('x-next-cursor', nextCursor);
        }

        return response;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return NextResponse.json(
                    { error: 'User resource not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json(
                { error: 'Database request failed' },
                { status: 400 }
            );
        }

        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
