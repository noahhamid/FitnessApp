/**
 * Canonical public API origin for the mobile client + absolute URL helpers.
 * Prefer EXPO_PUBLIC_* / BETTER_AUTH_URL from env; fall back to Vercel prod.
 *
 * Keep this file free of `expo-*` / `react-native` imports — the API server
 * also loads it. Dev LAN detection lives in `dev-api-url.ts` (client only).
 */
export const PRODUCTION_API_URL = "https://potential-peak.vercel.app";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function isLanHostname(hostname: string): boolean {
  return /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(hostname);
}

/** Optional override set by the Expo client on startup (see `dev-api-url.ts`). */
let clientApiUrlOverride: string | null = null;

export function setClientApiUrlOverride(url: string | null): void {
  clientApiUrlOverride = url ? stripTrailingSlash(url) : null;
}

/**
 * API / Better Auth base URL for the Expo client.
 * On web, LAN IPs from `.env.local` (meant for a phone on Wi‑Fi) are unreachable
 * in the browser — use the deployed API instead.
 */
export function getClientApiUrl(): string {
  if (clientApiUrlOverride) return clientApiUrlOverride;

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

export function privacyPageUrl(): string {
  return `${publicApiBase()}/privacy`;
}

export function termsPageUrl(): string {
  return `${publicApiBase()}/terms`;
}
