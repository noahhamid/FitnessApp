import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/** Must match `AUTH_STORAGE_PREFIX` in auth-client.ts */
const STORAGE_PREFIX = "exo_fitness";

/** Same key `api.ts` reads for `Authorization: Bearer`. */
export const SESSION_TOKEN_KEY = `${STORAGE_PREFIX}_session_token`;

function webGet(key: string): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function webSet(key: string, value: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
}

function webRemove(key: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(key);
  } catch {
    /* private mode */
  }
}

export async function readSessionToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return webGet(SESSION_TOKEN_KEY);
  }
  return SecureStore.getItemAsync(SESSION_TOKEN_KEY);
}

export async function persistSessionToken(
  token: string | null | undefined,
): Promise<void> {
  if (!token) return;
  if (Platform.OS === "web") {
    webSet(SESSION_TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
  }
  const { invalidateAuthHeaderCache } = await import("./api");
  invalidateAuthHeaderCache();
}

export async function clearSessionToken(): Promise<void> {
  if (Platform.OS === "web") {
    webRemove(SESSION_TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
  }
  const { invalidateAuthHeaderCache } = await import("./api");
  invalidateAuthHeaderCache();
}

/** Pull `token` from Better Auth JSON bodies (sign-in / sign-up / verify). */
export async function persistTokenFromAuthData(
  data: unknown,
): Promise<void> {
  if (!data || typeof data !== "object") return;
  const token = (data as { token?: unknown }).token;
  if (typeof token === "string" && token.length > 0) {
    await persistSessionToken(token);
  }
}
