/**
 * PushService — Server-side VAPID push notification sender.
 * Wraps `web-push` with sensible defaults and error handling.
 *
 * Environment variables required (production):
 *   VAPID_PUBLIC_KEY   — output of `npx web-push generate-vapid-keys`
 *   VAPID_PRIVATE_KEY  — output of `npx web-push generate-vapid-keys`
 *   VAPID_MAILTO       — "mailto:your@email.com" or your origin URL
 */
import * as webpush from "web-push";
import type { PushSubscription as WebPushSubscription, WebPushError } from "web-push";

let initialized = false;

function ensureInitialized(): void {
    if (initialized) return;

    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const mailto = process.env.VAPID_MAILTO ?? "mailto:along@example.com";

    if (!publicKey || !privateKey) {
        // Gracefully degrade — push sends will be no-ops in dev without keys
        return;
    }

    webpush.setVapidDetails(mailto, publicKey, privateKey);
    initialized = true;
}

export interface PushPayload {
    title: string;
    body: string;
    icon?: string;
    url?: string;
    tag?: string;
}

export interface PushTarget {
    endpoint: string;
    p256dh: string;
    auth: string;
}

export interface PushResult {
    success: boolean;
    statusCode?: number;
    /** True when the subscription is expired / gone and should be deleted from DB */
    gone?: boolean;
}

/**
 * Send a single push notification to one subscription.
 * Returns `gone: true` when the push service returns 404/410 — caller should
 * remove the subscription from the database.
 */
export async function sendPushNotification(
    target: PushTarget,
    payload: PushPayload,
): Promise<PushResult> {
    ensureInitialized();

    if (!initialized) {
        // No VAPID keys configured — silently skip in dev
        return { success: false };
    }

    const subscription: WebPushSubscription = {
        endpoint: target.endpoint,
        keys: { p256dh: target.p256dh, auth: target.auth },
    };

    try {
        const result = await webpush.sendNotification(
            subscription,
            JSON.stringify(payload),
            { TTL: 60 * 60 * 24 }, // 24-hour TTL
        );
        return { success: true, statusCode: result.statusCode };
    } catch (err) {
        const wpErr = err as WebPushError;
        const statusCode = wpErr.statusCode ?? 0;
        const gone = statusCode === 404 || statusCode === 410;
        return { success: false, statusCode, gone };
    }
}

/**
 * Fan-out a push notification to multiple subscriptions.
 * Returns the list of endpoints whose subscriptions are expired (gone).
 */
export async function sendPushToMany(
    targets: PushTarget[],
    payload: PushPayload,
): Promise<{ goneEndpoints: string[] }> {
    const results = await Promise.allSettled(
        targets.map((t) => sendPushNotification(t, payload)),
    );

    const goneEndpoints: string[] = [];
    results.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value.gone) {
            goneEndpoints.push(targets[i].endpoint);
        }
    });

    return { goneEndpoints };
}
