import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimitByIP } from "@/lib/utils/rateLimiter";
import {
    sendContactConfirmationEmail,
    sendContactNotificationEmail,
} from "@/lib/services/emailService";

const contactSchema = z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    subject: z.string().min(3).max(120),
    message: z.string().min(5).max(1500),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const ip =
            request.headers.get("x-forwarded-for") ??
            request.headers.get("x-real-ip") ??
            "unknown";
        const rateLimit = await rateLimitByIP(ip, {
            maxRequests: 5,
            windowSeconds: 600,
        });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429, headers: { "Retry-After": String(rateLimit.reset) } },
            );
        }

        const body: unknown = await request.json();
        const data = contactSchema.parse(body);

        const [notifyResult, confirmResult] = await Promise.all([
            sendContactNotificationEmail({
                name: data.name,
                email: data.email,
                subject: data.subject,
                message: data.message,
            }),
            sendContactConfirmationEmail({
                email: data.email,
                name: data.name,
                subject: data.subject,
                message: data.message,
            }),
        ]);

        const failed = [notifyResult, confirmResult].some(
            (result) => !result.ok && !result.skipped,
        );

        if (failed) {
            return NextResponse.json(
                { error: "Failed to send message" },
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

        console.error("[contact]", error);
        return NextResponse.json(
            { error: "Failed to send message" },
            { status: 500 },
        );
    }
}
