import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db/prisma";
import { getUserFromRequest } from "@/app/lib/utils/auth";

export async function GET() {
  try {
    const user = await getUserFromRequest();
    if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, postsToday, openBugs, avgValidity, signups7d, topPosts] = await Promise.all([
      prisma.user.count(),
      prisma.post.count({ where: { createdAt: { gte: today } } }),
      prisma.bugReport.count({ where: { status: { notIn: ["RESOLVED", "CLOSED"] } } }),
      prisma.post.aggregate({ _avg: { validityScore: true } }),
      (async () => {
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const recentUsers = await prisma.user.findMany({
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { createdAt: true },
        });
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const start = new Date(Date.now() - i * 86400000);
          start.setHours(0, 0, 0, 0);
          const end = new Date(start.getTime() + 86400000);
          const count = recentUsers.filter(u => u.createdAt >= start && u.createdAt < end).length;
          days.push({ date: start.toISOString().slice(0, 10), count });
        }
        return days;
      })(),
      prisma.post.findMany({
        select: { id: true, title: true, validityScore: true },
        orderBy: { validityScore: "desc" },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      postsToday,
      avgValidity: Math.round((avgValidity._avg.validityScore ?? 0) * 10) / 10,
      openBugs,
      signups7d,
      topPosts: topPosts.map(p => ({ id: p.id, title: p.title, validityScore: p.validityScore })),
    }, { status: 200 });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
