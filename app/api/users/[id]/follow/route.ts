import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/db/prisma';
import { requireAuth, authenticateRequest } from '@/lib/utils/auth-server';
import { rateLimitByUser } from '@/lib/utils/rateLimiter';
import { cache, CACHE_KEYS } from '@/lib/cache/redis';

/**
 * POST /api/users/[id]/follow
 * Follow or unfollow a user
 * Requires authentication
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: targetUserId } = await params;
        const authUser = await requireAuth(request);

        // Rate limiting
        const rateLimit = await rateLimitByUser(authUser, {
            maxRequests: 100,
            windowSeconds: 3600, // 100 follows per hour
        });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429, headers: { 'Retry-After': String(rateLimit.reset) } }
            );
        }

        // Cannot follow yourself
        if (authUser === targetUserId) {
            return NextResponse.json(
                { error: "Cannot follow yourself" },
                { status: 400 }
            );
        }

        // Check if target user exists
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: { id: true, firstName: true, lastName: true },
        });

        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if already following
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: authUser,
                    followingId: targetUserId,
                },
            },
        });

        if (existingFollow) {
            // Unfollow: Delete the follow relationship
            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId: authUser,
                        followingId: targetUserId,
                    },
                },
            });

            // Invalidate caches
            await Promise.all([
                cache.del(CACHE_KEYS.userProfile(authUser)),
                cache.del(CACHE_KEYS.userProfile(targetUserId)),
                cache.del(CACHE_KEYS.userSuggestions(authUser)),
            ]);

            return NextResponse.json({
                message: "Unfollowed successfully",
                isFollowing: false,
            });
        } else {
            // Follow: Create the follow relationship
            await prisma.$transaction(async (tx) => {
                // Create follow relationship
                await tx.follow.create({
                    data: {
                        followerId: authUser,
                        followingId: targetUserId,
                    },
                });

                // Create notification
                const notification = await tx.notification.create({
                    data: {
                        type: 'FOLLOW',
                        actorId: authUser,
                        message: `started following you`,
                    },
                });

                // Create notification recipient
                await tx.notificationRecipient.create({
                    data: {
                        notificationId: notification.id,
                        userId: targetUserId,
                        read: false,
                    },
                });
            });

            // Invalidate caches
            await Promise.all([
                cache.del(CACHE_KEYS.userProfile(authUser)),
                cache.del(CACHE_KEYS.userProfile(targetUserId)),
                cache.del(CACHE_KEYS.userSuggestions(authUser)),
            ]);

            return NextResponse.json({
                message: "Followed successfully",
                isFollowing: true,
            });
        }
    } catch (error) {
        console.error("Follow error:", error);
        return NextResponse.json(
            { error: "Failed to process follow request" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/users/[id]/follow
 * Check if current user follows target user
 * Requires authentication
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: targetUserId } = await params;
        const authUser = await authenticateRequest(request);

        // If not authenticated, return false
        if (!authUser) {
            return NextResponse.json({ isFollowing: false });
        }

        // Check if follow relationship exists
        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: authUser,
                    followingId: targetUserId,
                },
            },
        });

        return NextResponse.json({ isFollowing: !!follow });
    } catch (error) {
        console.error("Check follow error:", error);
        return NextResponse.json(
            { error: "Failed to check follow status" },
            { status: 500 }
        );
    }
}
