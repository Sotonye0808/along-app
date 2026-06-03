import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db/prisma";
import { getUserFromRequest } from "@/app/lib/utils/auth";
import { qstashService } from "@/app/lib/services/qstashService";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const type = body.type === "DISLIKE" ? "DISLIKE" : "LIKE";
    const userId = user.id as string;

    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId: id, userId } },
    });

    if (existing) {
      if (existing.type === type) {
        // Remove the like/dislike (toggle off)
        await prisma.$transaction([
          prisma.like.delete({ where: { id: existing.id } }),
          prisma.post.update({
            where: { id },
            data: type === "LIKE" ? { likes: { decrement: 1 } } : { dislikes: { decrement: 1 } },
          }),
        ]);
        return NextResponse.json({ liked: false, type: null }, { status: 200 });
      } else {
        // Switch from like to dislike or vice versa
        await prisma.$transaction([
          prisma.like.update({ where: { id: existing.id }, data: { type } }),
          prisma.post.update({
            where: { id },
            data: type === "LIKE"
              ? { likes: { increment: 1 }, dislikes: { decrement: 1 } }
              : { likes: { decrement: 1 }, dislikes: { increment: 1 } },
          }),
        ]);
        return NextResponse.json({ liked: true, type }, { status: 200 });
      }
    }

    // New like/dislike
    await prisma.$transaction([
      prisma.like.create({ data: { postId: id, userId, type } }),
      prisma.post.update({
        where: { id },
        data: type === "LIKE" ? { likes: { increment: 1 } } : { dislikes: { increment: 1 } },
      }),
    ]);

    // Create notification for LIKE only
    if (type === "LIKE") {
      const post = await prisma.post.findUnique({ where: { id }, select: { userId: true, title: true } });
      if (post && post.userId !== userId && user.firstName && user.lastName) {
        await prisma.notification.create({
          data: {
            type: "LIKE",
            actorId: userId,
            postId: id,
            message: `${user.firstName} ${user.lastName} liked your post`,
            recipients: { create: { userId: post.userId } },
          },
        });
      }
      if (post && post.userId !== userId) {
        qstashService.publishRewardsAward({ userId: post.userId, actionKey: "RECEIVE_LIKE" });
        qstashService.publishFeedInvalidation({ userIds: [post.userId] });
      }
    }

    return NextResponse.json({ liked: true, type }, { status: 200 });
  } catch (error) {
    console.error("Like toggle error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
