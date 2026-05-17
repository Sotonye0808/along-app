/**
 * POST /api/workers/notify
 *
 * QStash-backed background worker that fans out a notification to one or more
 * recipient users.  Requests must be verified with the QStash signature header
 * so they can only be triggered by Upstash QStash (or via a test token in
 * development).
 *
 * Payload shape:
 * {
 *   type:       "LIKE" | "COMMENT" | "FOLLOW" | "MENTION"
 *   actorId:    string          // user who triggered the action
 *   recipientIds: string[]      // users who should receive the notification
 *   postId?:    string
 *   commentId?: string
 *   message:    string
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { cache, CACHE_KEYS } from "@/lib/cache/redis";
import { handlePrismaError } from "@/lib/utils/prismaErrors";

const notifyPayloadSchema = z.object({
    type: z.enum(["LIKE", "COMMENT", "FOLLOW", "MENTION"]),
    actorId: z.string().cuid(),
    recipientIds: z.array(z.string().cuid()).min(1).max(50),
    postId: z.string().cuid().optional(),
    commentId: z.string().cuid().optional(),
    message: z.string().min(1).max(500),
});

/**
 * Verify a QStash request signature.  In development (no QSTASH_CURRENT_SIGNING_KEY)
 * the check is skipped so the endpoint can be tested locally.
 */
async function verifyQStashSignature(request: NextRequest): Promise<boolean> {
    const currentKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
    const nextKey = process.env.QSTASH_NEXT_SIGNING_KEY;

    if (!currentKey || !nextKey) {
        // Allow unauthenticated calls in dev/test
        return process.env.NODE_ENV !== "production";
    }

    const receiver = new Receiver({
        currentSigningKey: currentKey,
        nextSigningKey: nextKey,
    });

    const signature = request.headers.get("upstash-signature") ?? "";
    const body = await request.text();

    try {
        await receiver.verify({ signature, body });
        return true;
    } catch {
        return false;
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    // Clone request for body re-reading after signature verification
    const cloned = request.clone();
    const verified = await verifyQStashSignature(request);
    if (!verified) {
        return NextResponse.json({ error: "Forbidden — invalid QStash signature" }, { status: 403 });
    }

    let raw: unknown;
    try {
        raw = await cloned.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = notifyPayloadSchema.safeParse(raw);
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Bad payload" },
            { status: 400 },
        );
    }

    const { type, actorId, recipientIds, postId, commentId, message } = parsed.data;

    try {
        // Create one notification row and fan-out recipient rows in a transaction
        await prisma.$transaction(async (tx: any) => {
            const notification = await tx.notification.create({
                data: {
                    type,
                    actorId,
                    postId: postId ?? null,
                    commentId: commentId ?? null,
                    message,
                },
            });

            await tx.notificationRecipient.createMany({
                data: recipientIds.map((userId) => ({
                    notificationId: notification.id,
                    userId,
                })),
                skipDuplicates: true,
            });
        });

        // Bust notification caches for all recipients
        await Promise.allSettled(
            recipientIds.map((uid) =>
                cache.del(CACHE_KEYS.searchResults(uid, "notifications")),
            ),
        );

        return NextResponse.json({ ok: true, recipients: recipientIds.length });
    } catch (error) {
        const prismaError = handlePrismaError(error, "Notification");
        if (prismaError) return prismaError;
        console.error("[worker notify]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
