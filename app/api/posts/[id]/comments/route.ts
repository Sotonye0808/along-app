import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db/prisma";
import { getUserFromRequest } from "@/app/lib/utils/auth";
import { COMMENT_SCHEMA } from "@/app/lib/schemas/post";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

    const comments = await prisma.comment.findMany({
      where: { postId: id },
      include: {
        user: {
          select: { id: true, userName: true, firstName: true, lastName: true, avatar: true, avatarConfig: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    const hasMore = comments.length > limit;
    const resultComments = hasMore ? comments.slice(0, limit) : comments;
    const nextCursor = hasMore ? resultComments[resultComments.length - 1].id : null;

    return NextResponse.json({ comments: resultComments, nextCursor }, { status: 200 });
  } catch (error) {
    console.error("List comments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = COMMENT_SCHEMA.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const userId = user.id as string;

    const comment = await prisma.$transaction(async (tx) => {
      const c = await tx.comment.create({
        data: { postId: id, userId, text: parsed.data.text },
        include: {
          user: {
            select: { id: true, userName: true, firstName: true, lastName: true, avatar: true, avatarConfig: true },
          },
        },
      });

      await tx.post.update({ where: { id }, data: { comments: { increment: 1 } } });

      // Create notification for COMMENT
      const post = await tx.post.findUnique({ where: { id }, select: { userId: true, title: true } });
      if (post && post.userId !== userId && user.firstName && user.lastName) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            actorId: userId,
            postId: id,
            message: `${user.firstName} ${user.lastName} commented on your post`,
            recipients: { create: { userId: post.userId } },
          },
        });
      }

      return c;
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
