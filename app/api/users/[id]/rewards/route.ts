import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/utils/auth-server";
import { rateLimitByUser } from "@/lib/utils/rateLimiter";
import { rewardsService } from "@/lib/services/RewardsService";
import { handlePrismaError } from "@/lib/utils/prismaErrors";

interface Params {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
    try {
        const authUserId = await requireAuth(request);
        const { id } = await params;

        // Only allow users to see their own rewards (or admin — simplified here)
        if (authUserId !== id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const limited = await rateLimitByUser(authUserId, { maxRequests: 60, windowSeconds: 60 });
        if (!limited.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429, headers: { "Retry-After": String(limited.reset) } },
            );
        }

        const summary = await rewardsService.getSummary(id);
        return NextResponse.json(summary);
    } catch (error) {
        const prismaError = handlePrismaError(error, "User");
        if (prismaError) return prismaError;
        console.error("[rewards GET]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
