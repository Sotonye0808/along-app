import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authenticateRequest } from "@/lib/utils/auth-server";
import { rateLimitByIP, rateLimitByUser } from "@/lib/utils/rateLimiter";
import { handlePrismaError } from "@/lib/utils/prismaErrors";
import {
  sendBugReportConfirmationEmail,
  sendBugReportNotificationEmail,
} from "@/lib/services/emailService";

const bugReportSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(10).max(2000),
  category: z.enum(["UI", "ROUTING", "AUTH", "PERFORMANCE", "DATA", "NOTIFICATIONS", "OTHER"]),
  postId: z.string().cuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * POST /api/bug-reports
 * Submit a bug report. Auth optional — uses IP rate limit for guests.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authUser = await authenticateRequest(request);
    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";

    if (authUser) {
      const rateLimit = await rateLimitByUser(authUser, { maxRequests: 10, windowSeconds: 3600 });
      if (!rateLimit.success) {
        return NextResponse.json(
          { error: "Rate limit exceeded" },
          { status: 429, headers: { "Retry-After": String(rateLimit.reset) } },
        );
      }
    } else {
      const rateLimit = await rateLimitByIP(ip, { maxRequests: 3, windowSeconds: 3600 });
      if (!rateLimit.success) {
        return NextResponse.json(
          { error: "Rate limit exceeded" },
          { status: 429, headers: { "Retry-After": String(rateLimit.reset) } },
        );
      }
    }

    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required to submit a bug report" },
        { status: 401 },
      );
    }

    const body: unknown = await request.json();
    const data = bugReportSchema.parse(body);

    const report = await prisma.bugReport.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        reporterId: authUser,
        postId: data.postId,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
      },
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        createdAt: true,
      },
    });

    const reporter = await prisma.user.findUnique({
      where: { id: authUser },
      select: { firstName: true, lastName: true, email: true },
    });

    if (reporter) {
      const reporterName = `${reporter.firstName} ${reporter.lastName}`.trim();
      const [notifyResult, confirmResult] = await Promise.all([
        sendBugReportNotificationEmail({
          name: reporterName,
          email: reporter.email,
          reportId: report.id,
          title: report.title,
          category: report.category,
        }),
        sendBugReportConfirmationEmail({
          email: reporter.email,
          name: reporter.firstName,
          reportId: report.id,
          title: report.title,
          category: report.category,
        }),
      ]);

      if (
        (!notifyResult.ok && !notifyResult.skipped) ||
        (!confirmResult.ok && !confirmResult.skipped)
      ) {
        console.warn("[bug-reports] email send failed");
      }
    }

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }

    const prismaError = handlePrismaError(error, "BugReport");
    if (prismaError) return prismaError;

    console.error("Error creating bug report:", error);
    return NextResponse.json({ error: "Failed to submit bug report" }, { status: 500 });
  }
}

/**
 * GET /api/bug-reports
 * Admin-only: list bug reports with optional status filter.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authUser = await authenticateRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: authUser },
      select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);

    const reports = await prisma.bugReport.findMany({
      where: {
        ...(status ? { status: status as "OPEN" | "TRIAGED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" } : {}),
        ...(category ? { category: category as "UI" | "ROUTING" | "AUTH" | "PERFORMANCE" | "DATA" | "NOTIFICATIONS" | "OTHER" } : {}),
      },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        createdAt: true,
        reporter: { select: { id: true, userName: true, firstName: true, lastName: true } },
      },
    });

    const hasMore = reports.length > limit;
    const page = hasMore ? reports.slice(0, limit) : reports;
    const nextCursor = hasMore ? page[page.length - 1]?.id : undefined;

    const response = NextResponse.json({ data: page, nextCursor: nextCursor ?? null });
    if (nextCursor) {
      response.headers.set("x-next-cursor", nextCursor);
    }
    return response;
  } catch (error) {
    console.error("Error fetching bug reports:", error);
    return NextResponse.json({ error: "Failed to fetch bug reports" }, { status: 500 });
  }
}
