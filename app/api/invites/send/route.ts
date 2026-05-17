import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/utils/auth-server";
import { rateLimitByUser } from "@/lib/utils/rateLimiter";
import { inviteService } from "@/lib/services/InviteService";
import { prisma } from "@/lib/db/prisma";
import { sendInviteEmail } from "@/lib/services/emailService";
import { handlePrismaError } from "@/lib/utils/prismaErrors";

const inviteSchema = z.object({
    email: z.string().email(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        let authUserId: string;
        try {
            authUserId = await requireAuth(request);
        } catch {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const rateLimit = await rateLimitByUser(authUserId, {
            maxRequests: 10,
            windowSeconds: 3600,
        });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429, headers: { "Retry-After": String(rateLimit.reset) } },
            );
        }

        const body: unknown = await request.json();
        const data = inviteSchema.parse(body);

        const user = await prisma.user.findUnique({
            where: { id: authUserId },
            select: { firstName: true, lastName: true, userName: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const appBaseUrl =
            process.env.NEXT_PUBLIC_APP_URL ?? "https://along.app";
        const invite = await inviteService.getOrCreateCode(authUserId, appBaseUrl);

        const inviterName = `${user.firstName} ${user.lastName}`.trim();
        const result = await sendInviteEmail({
            email: data.email,
            inviterName: inviterName || user.userName,
            inviteUrl: invite.inviteUrl,
            inviteCode: invite.code,
        });

        if (!result.ok && !result.skipped) {
            return NextResponse.json(
                { error: "Failed to send invite" },
                { status: 500 },
            );
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0]?.message ?? "Invalid input" },
                { status: 400 },
            );
        }

        const prismaError = handlePrismaError(error, "Invite");
        if (prismaError) return prismaError;

        console.error("[invites/send]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
