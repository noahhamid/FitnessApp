/**
 * Canonical public API origin for the mobile client + absolute URL helpers.
 * Prefer EXPO_PUBLIC_* / BETTER_AUTH_URL from env; fall back to Vercel prod.
 */
export const PRODUCTION_API_URL = "https://potentialpeak-app-puce.vercel.app";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function isLanHostname(hostname: string): boolean {
  return /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(hostname);
}

/**
 * API / Better Auth base URL for the Expo client.
 * On web, LAN IPs from `.env.local` (meant for a phone on Wi‑Fi) are unreachable
 * in the browser — use the deployed API instead.
 */
export function getClientApiUrl(): string {
  const raw =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_BETTER_AUTH_URL ||
    PRODUCTION_API_URL;
  const base = stripTrailingSlash(raw);

  if (typeof window !== "undefined") {
    try {
      if (isLanHostname(new URL(base).hostname)) {
        return PRODUCTION_API_URL;
      }
    } catch {
      return PRODUCTION_API_URL;
    }
  }

  return base;
}

export function publicApiBase(): string {
  return (
    process.env.BETTER_AUTH_URL?.replace(/\/$/, "") ||
    process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ||
    process.env.EXPO_PUBLIC_BETTER_AUTH_URL?.replace(/\/$/, "") ||
    PRODUCTION_API_URL
  );
}
