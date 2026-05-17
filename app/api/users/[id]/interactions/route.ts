import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/utils/auth-server";
import { rateLimitByUser } from "@/lib/utils/rateLimiter";
import { prisma } from "@/lib/db/prisma";
import { handlePrismaError } from "@/lib/utils/prismaErrors";

interface Params {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id]/interactions — returns all likes, dislikes and bookmarks for a user
 * in a single batched query per type, eliminating the per-post N+1 loop.
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

        const [likeRows, bookmarkRows] = await Promise.all([
            prisma.like.findMany({
                where: { userId: id },
                select: { postId: true, type: true },
            }),
            prisma.bookmark.findMany({
                where: { userId: id },
                select: { postId: true },
            }),
        ]);

        const likes: string[] = [];
        const dislikes: string[] = [];

        for (const row of likeRows) {
            if (row.type === "LIKE") likes.push(row.postId);
            else if (row.type === "DISLIKE") dislikes.push(row.postId);
        }

        const bookmarks = bookmarkRows.map((b: any) => b.postId);

        return NextResponse.json({ data: { likes, dislikes, bookmarks } });
    } catch (error) {
        const prismaError = handlePrismaError(error, "Like");
        if (prismaError) return prismaError;
        console.error("[user interactions GET]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
