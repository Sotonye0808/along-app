import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/app/lib/utils/auth";
import { feedService } from "@/app/lib/services/feedService";
import { prisma } from "@/app/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest();
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

    if (user) {
      const result = await feedService.getFeed(user.id as string, { cursor, limit });
      return NextResponse.json(result, { status: 200 });
    }

    // Guest access: return public posts (most recent)
    const posts = await prisma.post.findMany({
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        user: {
          select: { id: true, userName: true, firstName: true, lastName: true, avatar: true, avatarConfig: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const hasMore = posts.length > limit;
    const resultPosts = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? resultPosts[resultPosts.length - 1].id : null;

    return NextResponse.json({ posts: resultPosts, nextCursor }, { status: 200 });
  } catch (error) {
    console.error("Feed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
