import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handlePrismaError } from "@/lib/utils/prismaErrors";
import { requireAuth } from "@/lib/utils/auth-server";
import { rateLimitByUser } from "@/lib/utils/rateLimiter";
import { userReviewRepository } from "@/lib/db/UserReviewRepository";
import { adminAccessRepository } from "@/lib/db/AdminAccessRepository";

const patchSchema = z.object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

async function requireAdmin(request: NextRequest): Promise<string | NextResponse> {
    const authUser = await requireAuth(request);
    const isAdmin = await adminAccessRepository.isAdmin(authUser);
    if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return authUser;
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
    try {
        const adminOrError = await requireAdmin(request);
        if (adminOrError instanceof NextResponse) return adminOrError;

        const rateLimit = await rateLimitByUser(adminOrError, {
            maxRequests: 30,
            windowSeconds: 60,
        });
        if (!rateLimit.success) {
            return NextResponse.json(
                { error: "Rate limit exceeded" },
                { status: 429, headers: { "Retry-After": String(rateLimit.reset) } },
            );
        }

        const { id } = await params;
        const body: unknown = await request.json();
        const { status } = patchSchema.parse(body);

        const updated = await userReviewRepository.updateStatus(id, status);
        return NextResponse.json(updated);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.issues },
                { status: 400 },
            );
        }

        const prismaError = handlePrismaError(error, "UserReview");
        if (prismaError) return prismaError;

        console.error("Error updating review status:", error);
        return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
    }
}
