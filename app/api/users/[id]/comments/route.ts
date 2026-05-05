import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/utils/auth-server";
import { rateLimitByUser } from "@/lib/utils/rateLimiter";
import { prisma } from "@/lib/db/prisma";
import { handlePrismaError } from "@/lib/utils/prismaErrors";

interface Params {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id]/comments — returns all comments made by this user,
 * with the parent post included. Single Prisma query — eliminates the N+1
 * that previously required one request per post.
 */
export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const authUserId = await requireAuth(request);
        const { id } = await params;

        if (authUserId !== id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const limited = await rateLimitByUser(authUserId, { maxRequests: 60, windowSeconds: 60 });
        if (!limited.success) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const comments = await prisma.comment.findMany({
            where: { userId: id },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                postId: true,
                userId: true,
                text: true,
                createdAt: true,
                likes: true,
                dislikes: true,
                user: {
                    select: {
                        id: true,
                        userName: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        avatarConfig: true,
                        verified: true,
                        email: true,
                        createdAt: true,
                    },
                },
                post: {
                    select: {
                        id: true,
                        userId: true,
                        title: true,
                        routes: true,
                        images: true,
                        tags: true,
                        likes: true,
                        dislikes: true,
                        comments: true,
                        validityScore: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });

        return NextResponse.json({ data: comments });
    } catch (error) {
        const prismaError = handlePrismaError(error, "Comment");
        if (prismaError) return prismaError;
        console.error("[user comments GET]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
