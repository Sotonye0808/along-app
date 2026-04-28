import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/utils/auth-server";
import { handlePrismaError } from "@/lib/utils/prismaErrors";

const patchSchema = z.object({
  status: z.enum(["OPEN", "TRIAGED", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
});

/**
 * PATCH /api/bug-reports/[id]
 * Admin: update bug report status.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const authUser = await requireAuth(request);

    const admin = await prisma.user.findUnique({
      where: { id: authUser },
      select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: unknown = await request.json();
    const { status } = patchSchema.parse(body);

    const updated = await prisma.bugReport.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }
    const prismaError = handlePrismaError(error, "BugReport");
    if (prismaError) return prismaError;
    return NextResponse.json({ error: "Failed to update bug report" }, { status: 500 });
  }
}
