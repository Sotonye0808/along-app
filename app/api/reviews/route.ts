import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handlePrismaError } from "@/lib/utils/prismaErrors";
import { requireAuth } from "@/lib/utils/auth-server";
import { rateLimitByIP } from "@/lib/utils/rateLimiter";
import { userReviewRepository } from "@/lib/db/UserReviewRepository";
import { adminAccessRepository } from "@/lib/db/AdminAccessRepository";

const reviewStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);

async function requireAdmin(request: NextRequest): Promise<string | NextResponse> {
    const authUser = await requireAuth(request);
    const isAdmin = await adminAccessRepository.isAdmin(authUser);
    if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return authUser;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const adminOrError = await requireAdmin(request);
        if (adminOrError instanceof NextResponse) return adminOrError;

        const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
        const limited = await rateLimitByIP(ip, { maxRequests: 30, windowSeconds: 60 });
        if (!limited.success) {
            return NextResponse.json(
                { error: "Rate limit exceeded" },
                { status: 429, headers: { "Retry-After": String(limited.reset) } },
            );
        }

        const { searchParams } = new URL(request.url);
        const statusParam = searchParams.get("status");
        const cursor = searchParams.get("cursor") ?? undefined;
        const limit = Number(searchParams.get("limit") ?? "20");

        const status = statusParam ? reviewStatusSchema.parse(statusParam) : undefined;
        const result = await userReviewRepository.listForAdmin({ status, cursor, limit });

        const response = NextResponse.json(result);
        if (result.nextCursor) {
            response.headers.set("x-next-cursor", result.nextCursor);
        }
        return response;
    } catch (error) {
        const prismaError = handlePrismaError(error, "UserReview");
        if (prismaError) return prismaError;
        throw error;
    }
}
