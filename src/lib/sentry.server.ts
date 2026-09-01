import * as Sentry from "@sentry/node";

const dsn = process.env.SENTRY_DSN?.trim();

/**
 * API-side crash reporting. Deliberately separate from src/lib/sentry.ts —
 * that one is @sentry/react-native and runs on the user's phone; this runs in
 * the Vercel function. Two programs, two SDKs.
 *
 * SENTRY_DSN has no EXPO_PUBLIC_ prefix on purpose: it must never be inlined
 * into the app bundle. Unset (local dev) disables reporting entirely.
 */
export const serverSentryEnabled = Boolean(dsn);

if (serverSentryEnabled) {
  Sentry.init({
    dsn,
    // Errors only. Tracing would sample every request for data we have no
    // plan to read, and it costs quota.
    tracesSampleRate: 0,
  });
}

export { Sentry };
