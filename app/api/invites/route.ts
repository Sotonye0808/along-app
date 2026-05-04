import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/utils/auth-server";
import { rateLimitByUser, rateLimitByIP } from "@/lib/utils/rateLimiter";
import { inviteService } from "@/lib/services/InviteService";
import { handlePrismaError } from "@/lib/utils/prismaErrors";

/**
 * GET /api/invites — get or create the caller's invite code + leaderboard
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const authUserId = await requireAuth(request);

        const limited = await rateLimitByUser(authUserId, { maxRequests: 30, windowSeconds: 60 });
        if (!limited.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429, headers: { "Retry-After": String(limited.reset) } },
            );
        }

        const appBaseUrl =
            process.env.NEXT_PUBLIC_APP_URL ?? "https://along.app";

        const [invite, leaderboard] = await Promise.all([
            inviteService.getOrCreateCode(authUserId, appBaseUrl),
            inviteService.getLeaderboard(20),
        ]);

        return NextResponse.json({ invite, leaderboard });
    } catch (error) {
        const prismaError = handlePrismaError(error, "Invite");
        if (prismaError) return prismaError;
        console.error("[invites GET]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * POST /api/invites — validate a code (unauthenticated)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const ip = request.headers.get("x-forwarded-for") ?? "unknown";
        const limited = await rateLimitByIP(ip, { maxRequests: 20, windowSeconds: 60 });
        if (!limited.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429, headers: { "Retry-After": String(limited.reset) } },
            );
        }

        const body = (await request.json()) as { code?: string };
        const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
        const result = await inviteService.validateCode(code);
        return NextResponse.json(result);
    } catch (error) {
        const prismaError = handlePrismaError(error, "Invite");
        if (prismaError) return prismaError;
        console.error("[invites POST]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
