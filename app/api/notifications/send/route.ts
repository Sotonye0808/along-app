/**
 * POST /api/notifications/send
 *
 * Internal endpoint: send a Web Push notification to all registered
 * devices of one or more users.
 *
 * This route is intended to be called from server-side code or QStash
 * workers — not directly from the browser.  It therefore requires a
 * shared internal secret (`INTERNAL_API_SECRET`) rather than a user JWT,
 * so it can be triggered by background workers safely.
 *
 * Payload shape:
 * {
 *   recipientIds: string[]   // userId values
 *   title:        string
 *   body:         string
 *   url?:         string     // deep-link opened on notification click
 *   icon?:        string     // icon URL
 *   tag?:         string     // deduplication tag
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { sendPushToMany } from "@/lib/services/PushService";

const sendSchema = z.object({
    recipientIds: z.array(z.string().cuid()).min(1).max(100),
    title: z.string().min(1).max(100),
    body: z.string().min(1).max(300),
    url: z.string().url().optional(),
    icon: z.string().url().optional(),
    tag: z.string().max(50).optional(),
});

function authorized(request: NextRequest): boolean {
    const secret = process.env.INTERNAL_API_SECRET;
    if (!secret) {
        // Allow in dev/test without a secret configured
        return process.env.NODE_ENV !== "production";
    }
    const provided =
        request.headers.get("x-internal-secret") ??
        request.headers.get("authorization")?.replace(/^Bearer\s+/, "");
    return provided === secret;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    if (!authorized(request)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let raw: unknown;
    try {
        raw = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = sendSchema.safeParse(raw);
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Bad payload" },
            { status: 400 },
        );
    }

    const { recipientIds, title, body, url, icon, tag } = parsed.data;

    // Fetch all subscriptions for the target users
    const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId: { in: recipientIds } },
        select: { endpoint: true, p256dh: true, auth: true },
    });

    if (subscriptions.length === 0) {
        return NextResponse.json({ ok: true, sent: 0, skipped: "no-subscriptions" });
    }

    const payload = {
        title,
        body,
        url: url ?? process.env.NEXT_PUBLIC_APP_URL ?? "/",
        icon: icon ?? "/icon-192.png",
        tag,
    };

    const { goneEndpoints } = await sendPushToMany(subscriptions, payload);

    // Clean up expired subscriptions
    if (goneEndpoints.length > 0) {
        await prisma.pushSubscription.deleteMany({
            where: { endpoint: { in: goneEndpoints } },
        });
    }

    return NextResponse.json({
        ok: true,
        sent: subscriptions.length - goneEndpoints.length,
        expired: goneEndpoints.length,
    });
}
