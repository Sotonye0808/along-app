/**
 * Sentry server-side (Node.js runtime) instrumentation.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
    Sentry.init({
        dsn,
        environment: process.env.NODE_ENV ?? "development",
        release: process.env.NEXT_PUBLIC_APP_VERSION,

        // Capture 10 % of traces in production, 100 % in dev
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    });
}
