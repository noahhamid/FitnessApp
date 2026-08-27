import * as Sentry from "@sentry/react-native";

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();

/**
 * Crash reporting only — product analytics stays out of scope for launch.
 * Set EXPO_PUBLIC_SENTRY_DSN (EAS env / .env.local). `sentryEnabled` is
 * `Boolean(dsn)` — true only when that var is a non-empty string after trim.
 */
export const sentryEnabled = Boolean(dsn);

if (sentryEnabled) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.15,
    enableAutoSessionTracking: true,
    debug: false,
  });
}

export { Sentry };
