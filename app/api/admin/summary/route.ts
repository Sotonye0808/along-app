import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/utils/auth-server";
import { rateLimitByUser } from "@/lib/utils/rateLimiter";
import { adminAccessRepository } from "@/lib/db/AdminAccessRepository";
import { adminMetricsRepository } from "@/lib/db/AdminMetricsRepository";

async function requireAdmin(request: NextRequest): Promise<string | NextResponse> {
    const authUser = await requireAuth(request);
    const isAdmin = await adminAccessRepository.isAdmin(authUser);
    if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return authUser;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
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

    const summary = await adminMetricsRepository.getSummary();
    return NextResponse.json(summary);
}
