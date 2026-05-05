/**
 * POST /api/workers/digest
 *
 * QStash-backed background worker that assembles a daily activity digest for a
 * user and stores it as an in-app notification so it appears in their feed.
 * Intended to be triggered on a schedule (e.g. daily at 08:00 WAT) via the
 * Upstash QStash scheduler.
 *
 * Payload shape:
 * {
 *   userId: string   // recipient user ID
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { handlePrismaError } from "@/lib/utils/prismaErrors";

const digestPayloadSchema = z.object({
    userId: z.string().cuid(),
});

async function verifyQStashSignature(request: NextRequest): Promise<boolean> {
    const currentKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
    const nextKey = process.env.QSTASH_NEXT_SIGNING_KEY;

    if (!currentKey || !nextKey) {
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

    const parsed = digestPayloadSchema.safeParse(raw);
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Bad payload" },
            { status: 400 },
        );
    }

    const { userId } = parsed.data;

    try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24 h

        // Count activity in the last 24 h
        const [likesCount, commentsCount, followsCount] = await Promise.all([
            prisma.like.count({
                where: {
                    post: { userId },
                    createdAt: { gte: since },
                },
            }),
            prisma.comment.count({
                where: {
                    post: { userId },
                    userId: { not: userId },
                    createdAt: { gte: since },
                },
            }),
            prisma.follow.count({
                where: {
                    followingId: userId,
                    createdAt: { gte: since },
                },
            }),
        ]);

        const total = likesCount + commentsCount + followsCount;

        // Skip digest if no activity
        if (total === 0) {
            return NextResponse.json({ ok: true, skipped: true, reason: "no-activity" });
        }

        const parts: string[] = [];
        if (likesCount > 0) parts.push(`${likesCount} like${likesCount > 1 ? "s" : ""}`);
        if (commentsCount > 0) parts.push(`${commentsCount} new comment${commentsCount > 1 ? "s" : ""}`);
        if (followsCount > 0) parts.push(`${followsCount} new follower${followsCount > 1 ? "s" : ""}`);

        const message = `Daily digest: ${parts.join(", ")} in the last 24 hours.`;

        // Store as a system notification (actorId = recipient = system user pattern,
        // so we use the recipient's own ID as actor to satisfy the FK constraint).
        await prisma.$transaction(async (tx) => {
            const notification = await tx.notification.create({
                data: {
                    type: "MENTION", // closest system-level type available
                    actorId: userId,
                    message,
                },
            });

            await tx.notificationRecipient.create({
                data: {
                    notificationId: notification.id,
                    userId,
                },
            });
        });

        return NextResponse.json({ ok: true, userId, digest: { likesCount, commentsCount, followsCount } });
    } catch (error) {
        const prismaError = handlePrismaError(error, "Notification");
        if (prismaError) return prismaError;
        console.error("[worker digest]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
