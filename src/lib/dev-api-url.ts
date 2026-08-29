/**
 * Expo-only: point auth at the same LAN host as Metro so we never hit
 * production rate limits while developing in Expo Go.
 */
import Constants from "expo-constants";
import { setClientApiUrlOverride } from "./public-api-url";

function isLanHostname(hostname: string): boolean {
  return /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(hostname);
}

export function applyDevLanApiUrlOverride(): string | null {
  if (typeof __DEV__ === "undefined" || !__DEV__) return null;

  try {
    const hostUri = Constants.expoConfig?.hostUri;
    if (!hostUri || typeof hostUri !== "string") return null;

    const cleaned = hostUri
      .replace(/^exp:\/\//, "")
      .replace(/^https?:\/\//, "");
    const host = cleaned.split(":")[0]?.split("/")[0];
    if (!host || host === "localhost" || host === "127.0.0.1") return null;
    if (!isLanHostname(host) && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      return null;
    }

    const url = `http://${host}:3000`;
    setClientApiUrlOverride(url);
    return url;
  } catch {
    return null;
  }
}
