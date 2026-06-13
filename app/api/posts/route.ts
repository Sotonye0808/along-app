import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db/prisma";
import { getUserFromRequest } from "@/app/lib/utils/auth";
import { CREATE_POST_SCHEMA } from "@/app/lib/schemas/post";
import { validityEngine } from "@/app/lib/services/ValidityEngine";
import { qstashService } from "@/app/lib/services/qstashService";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CREATE_POST_SCHEMA.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, routes, images, tags, region, startLat, startLng, endLat, endLng, totalDistanceKm, estimatedMins } = parsed.data;

    const post = await prisma.post.create({
      data: {
        userId: user.id as string,
        title,
        routes: routes as never,
        images: images ?? [],
        tags: tags ?? [],
        region: region ?? null,
        startLat: startLat ?? null,
        startLng: startLng ?? null,
        endLat: endLat ?? null,
        endLng: endLng ?? null,
        totalDistanceKm: totalDistanceKm ?? null,
        estimatedMins: estimatedMins ?? null,
      },
      include: {
        user: {
          select: { id: true, userName: true, firstName: true, lastName: true, avatar: true, avatarConfig: true },
        },
      },
    });

    // Calculate initial validity score
    const validityResult = await validityEngine.evaluate({
      likes: 0,
      dislikes: 0,
      routeDetailScore: routes.length * 20,
      similarityRatio: 100,
      createdAt: new Date(),
    });

    await prisma.post.update({
      where: { id: post.id },
      data: { validityScore: validityResult.score, validityTier: validityResult.tier },
    });

    qstashService.publishRewardsAward({ userId: user.id as string, actionKey: "CREATE_POST" });
    qstashService.publishFeedInvalidation({ followersOfUserId: user.id as string });
    qstashService.publishValidityRecompute({ postId: post.id });

    return NextResponse.json({ post: { ...post, validityScore: validityResult.score, validityTier: validityResult.tier } }, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

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
    console.error("List posts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
