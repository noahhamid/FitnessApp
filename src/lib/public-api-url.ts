/**
 * Canonical public API origin for the mobile client + absolute URL helpers.
 * Prefer EXPO_PUBLIC_* / BETTER_AUTH_URL from env; fall back to Vercel prod.
 */
export const PRODUCTION_API_URL = "https://potentialpeak-app-puce.vercel.app";

export function publicApiBase(): string {
  return (
    process.env.BETTER_AUTH_URL?.replace(/\/$/, "") ||
    process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ||
    process.env.EXPO_PUBLIC_BETTER_AUTH_URL?.replace(/\/$/, "") ||
    PRODUCTION_API_URL
  );
}
