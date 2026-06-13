import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db/prisma";
import { getUserFromRequest } from "@/app/lib/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest();
    if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const bugs = await prisma.bugReport.findMany({
      where: where as never,
      include: {
        reporter: { select: { id: true, firstName: true, lastName: true, userName: true, avatar: true } },
        reviewer: { select: { id: true, firstName: true, lastName: true, userName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    const hasMore = bugs.length > limit;
    const resultBugs = hasMore ? bugs.slice(0, limit) : bugs;
    const nextCursor = hasMore ? resultBugs[resultBugs.length - 1].id : null;

    return NextResponse.json({ bugs: resultBugs, nextCursor }, { status: 200 });
  } catch (error) {
    console.error("Admin bugs list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromRequest();
    if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { bugId, status, reviewerId } = body;

    if (!bugId || !status) {
      return NextResponse.json({ error: "bugId and status required" }, { status: 400 });
    }

    const data: Record<string, unknown> = { status };
    if (reviewerId) data.reviewerId = reviewerId;
    if (status === "RESOLVED" || status === "CLOSED") data.resolvedAt = new Date();

    await prisma.bugReport.update({
      where: { id: bugId },
      data: data as never,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Admin bug update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
