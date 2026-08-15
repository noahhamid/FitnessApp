import * as Sentry from "@sentry/react-native";

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();

/**
 * Crash reporting only — product analytics stays out of scope for launch.
 * Set EXPO_PUBLIC_SENTRY_DSN from your Sentry project settings
 * (Settings → Client Keys / DSN). Leave unset to disable in local Expo Go.
 */
export const sentryEnabled = Boolean(dsn);

if (sentryEnabled) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.15,
    enableAutoSessionTracking: true,
    debug: __DEV__,
  });
}

export { Sentry };
