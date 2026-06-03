import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db/prisma";
import { getUserFromRequest } from "@/app/lib/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // "all" | "unread" | "rewards"
    const cursor = searchParams.get("cursor");
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
    const userId = user.id as string;

    const notifications = await prisma.notification.findMany({
      where: {
        recipients: filter === "unread" ? { some: { userId, read: false } } : { some: { userId } },
        ...(filter === "rewards" ? { type: { in: ["REWARD", "BADGE", "VERIFIED"] as never } } : {}),
      },
      include: {
        actor: {
          select: { id: true, userName: true, firstName: true, lastName: true, avatar: true, avatarConfig: true },
        },
        post: { select: { id: true, title: true } },
        recipients: {
          where: { userId },
          select: { read: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    const hasMore = notifications.length > limit;
    const resultNotifications = hasMore ? notifications.slice(0, limit) : notifications;
    const nextCursor = hasMore ? resultNotifications[resultNotifications.length - 1].id : null;

    const unreadCount = await prisma.notificationRecipient.count({
      where: { userId, read: false },
    });

    return NextResponse.json({ notifications: resultNotifications, nextCursor, unreadCount }, { status: 200 });
  } catch (error) {
    console.error("List notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const userId = user.id as string;

    if (body.markAll) {
      await prisma.notificationRecipient.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
    } else if (body.notificationId) {
      await prisma.notificationRecipient.updateMany({
        where: { notificationId: body.notificationId, userId },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Mark read error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
