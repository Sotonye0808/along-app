import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db/prisma";
import { getUserFromRequest } from "@/app/lib/utils/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getUserFromRequest();

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (currentUser.id === id) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: currentUser.id as string, followingId: id } },
    });

    if (existing) {
      return NextResponse.json({ error: "Already following this user" }, { status: 409 });
    }

    await prisma.$transaction([
      prisma.follow.create({
        data: { followerId: currentUser.id as string, followingId: id },
      }),
      prisma.notification.create({
        data: {
          type: "FOLLOW",
          actorId: currentUser.id as string,
          message: `${currentUser.firstName} ${currentUser.lastName} followed you`,
          recipients: { create: { userId: id } },
        },
      }),
    ]);

    return NextResponse.json({ followed: true }, { status: 201 });
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getUserFromRequest();

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: currentUser.id as string, followingId: id } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not following this user" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.follow.delete({
        where: { followerId_followingId: { followerId: currentUser.id as string, followingId: id } },
      }),
      prisma.notification.deleteMany({
        where: {
          type: "FOLLOW",
          actorId: currentUser.id as string,
          postId: null,
        },
      }),
    ]);

    return NextResponse.json({ followed: false }, { status: 200 });
  } catch (error) {
    console.error("Unfollow error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
