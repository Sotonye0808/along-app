import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/app/lib/db/prisma";
import { verifyAccessToken } from "@/app/lib/utils/auth";
import { clearAuthCookies } from "@/app/lib/utils/cookies";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let payload: { userId: string; role: string };
    try {
      payload = verifyAccessToken(token);
    } catch {
      clearAuthCookies();
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        userName: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        bio: true,
        location: true,
        verified: true,
        role: true,
        rewardPoints: true,
        rewardTier: true,
        inviteCode: true,
        avatarConfig: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      clearAuthCookies();
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
