import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/utils/auth-server";
import { rateLimitByUser } from "@/lib/utils/rateLimiter";
import { prisma } from "@/lib/db/prisma";
import { handlePrismaError } from "@/lib/utils/prismaErrors";

const createReviewSchema = z.object({
    revieweeId: z.string().cuid({ message: "Invalid user ID" }),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(500).optional(),
});

/**
 * GET /api/reviews/user — list approved reviews for display (public, paginated)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const revieweeId = searchParams.get("revieweeId") ?? undefined;
    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = Math.min(Number(searchParams.get("limit") ?? "10"), 50);

    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const { rateLimitByIP } = await import("@/lib/utils/rateLimiter");
    const rl = await rateLimitByIP(ip, { maxRequests: 60, windowSeconds: 60 });
    if (!rl.success) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    try {
        const reviews = await prisma.userReview.findMany({
            where: {
                status: "APPROVED",
                ...(revieweeId ? { revieweeId } : {}),
            },
            take: limit + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                reviewer: {
                    select: {
                        id: true,
                        userName: true,
                        firstName: true,
                        lastName: true,
                        avatarConfig: true,
                        avatar: true,
                        verified: true,
                    },
                },
            },
        });

        const hasMore = reviews.length > limit;
        const page = hasMore ? reviews.slice(0, limit) : reviews;
        const nextCursor = hasMore ? (page[page.length - 1]?.id ?? null) : null;

        return NextResponse.json({ data: page, nextCursor });
    } catch (error) {
        const prismaError = handlePrismaError(error, "UserReview");
        if (prismaError) return prismaError;
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * POST /api/reviews/user — submit a review (authenticated)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const authUserId = await requireAuth(request);

        const limited = await rateLimitByUser(authUserId, { maxRequests: 5, windowSeconds: 3600 });
        if (!limited.success) {
            return NextResponse.json(
                { error: "Review limit reached. Try again later." },
                { status: 429 },
            );
        }

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const parsed = createReviewSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation error", details: parsed.error.flatten() },
                { status: 422 },
            );
        }

        const { revieweeId, rating, comment } = parsed.data;

        if (revieweeId === authUserId) {
            return NextResponse.json({ error: "Cannot review yourself" }, { status: 400 });
        }

        const review = await prisma.userReview.upsert({
            where: { reviewerId_revieweeId: { reviewerId: authUserId, revieweeId } },
            update: { rating, comment: comment ?? null, status: "PENDING" },
            create: { reviewerId: authUserId, revieweeId, rating, comment: comment ?? null },
            select: { id: true, rating: true, status: true, createdAt: true },
        });

        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        const prismaError = handlePrismaError(error, "UserReview");
        if (prismaError) return prismaError;
        console.error("[reviews/user POST]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
