import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/utils/auth-server";
import { rateLimitByUser } from "@/lib/utils/rateLimiter";
import { prisma } from "@/lib/db/prisma";
import { handlePrismaError } from "@/lib/utils/prismaErrors";

/**
 * GET /api/analytics — returns the authenticated user's engagement analytics.
 * Aggregate data computed from their posts and interactions.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const authUserId = await requireAuth(request);

        const limited = await rateLimitByUser(authUserId, { maxRequests: 30, windowSeconds: 60 });
        if (!limited.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429, headers: { "Retry-After": String(limited.reset) } },
            );
        }

        const [posts, followerCount, followingCount, totalInvited] = await Promise.all([
            prisma.post.findMany({
                where: { userId: authUserId },
                select: {
                    id: true,
                    title: true,
                    likes: true,
                    dislikes: true,
                    comments: true,
                    bookmarks: true,
                    views: true,
                    shares: true,
                    createdAt: true,
                    region: true,
                    tags: true,
                },
                orderBy: { createdAt: "asc" },
            }),
            prisma.follow.count({ where: { followingId: authUserId } }),
            prisma.follow.count({ where: { followerId: authUserId } }),
            prisma.user.count({ where: { invitedById: authUserId } }),
        ]);

        const totalPosts = posts.length;
        const totalLikes = posts.reduce((s: number, p: any) => s + (p.likes ?? 0), 0);
        const totalComments = posts.reduce((s: number, p: any) => s + (p.comments ?? 0), 0);
        const totalBookmarks = posts.reduce((s: number, p: any) => s + (p.bookmarks ?? 0), 0);
        const totalViews = posts.reduce((s: number, p: any) => s + (p.views ?? 0), 0);
        const totalShares = posts.reduce((s: number, p: any) => s + (p.shares ?? 0), 0);

        // Engagement timeline: group posts by month (YYYY-MM)
        const byMonth: Record<string, { likes: number; comments: number; posts: number }> = {};
        for (const post of posts) {
            const key = post.createdAt.toISOString().slice(0, 7);
            byMonth[key] ??= { likes: 0, comments: 0, posts: 0 };
            byMonth[key].posts += 1;
            byMonth[key].likes += post.likes ?? 0;
            byMonth[key].comments += post.comments ?? 0;
        }

        const timeline = Object.entries(byMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, data]) => ({ month, ...data }));

        // Top regions
        const regionMap: Record<string, number> = {};
        for (const post of posts) {
            if (post.region) regionMap[post.region] = (regionMap[post.region] ?? 0) + 1;
        }
        const topRegions = Object.entries(regionMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([region, count]) => ({ region, count }));

        // Top posts by likes
        const topPosts = [...posts]
            .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
            .slice(0, 5)
            .map((p: any) => ({
                id: p.id,
                title: p.title,
                likes: p.likes ?? 0,
                comments: p.comments ?? 0,
                bookmarks: p.bookmarks ?? 0,
            }));

        return NextResponse.json({
            overview: {
                totalPosts,
                totalLikes,
                totalComments,
                totalBookmarks,
                totalViews,
                totalShares,
                followerCount,
                followingCount,
                totalInvited,
            },
            timeline,
            topRegions,
            topPosts,
        });
    } catch (error) {
        const prismaError = handlePrismaError(error, "Analytics");
        if (prismaError) return prismaError;
        console.error("[analytics GET]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
