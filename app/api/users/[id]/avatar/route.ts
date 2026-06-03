import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db/prisma";
import { getUserFromRequest } from "@/app/lib/utils/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getUserFromRequest();

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (currentUser.id !== id) {
      return NextResponse.json({ error: "You can only edit your own avatar" }, { status: 403 });
    }

    const body = await request.json();
    const { avatarConfig } = body;

    if (!avatarConfig || !avatarConfig.style) {
      return NextResponse.json({ error: "avatarConfig with style is required" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        avatarConfig: avatarConfig as never,
      },
      select: {
        id: true,
        userName: true,
        avatar: true,
        avatarConfig: true,
      },
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Update avatar error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
