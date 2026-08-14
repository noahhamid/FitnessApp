import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { AUTH_STORAGE_PREFIX, authClient } from "./auth-client";
import { PRODUCTION_API_URL } from "./public-api-url";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? PRODUCTION_API_URL;

type ApiEnvelope<T> = { data: T };
type ApiFailure = { error: string };

const SESSION_COOKIE_KEY = `${AUTH_STORAGE_PREFIX}_cookie`;
const SESSION_DATA_KEY = `${AUTH_STORAGE_PREFIX}_session_data`;
const SESSION_TOKEN_KEY = `${AUTH_STORAGE_PREFIX}_session_token`;

let handlingUnauthorized = false;

// ── Auth header cache ──────────────────────────────────────────────────────
// Every request used to independently read SecureStore up to 3 times
// (cookie, direct token, cookie-again-as-fallback). On cold start, with
// 6+ queries firing in parallel off the dashboard mount, that meant
// 15-20 sequential Keystore round-trips before requests even went out.
// Cache the result in memory, and dedupe concurrent callers into a
// single in-flight read.
let cachedAuthHeaders: Record<string, string> | null = null;
let authHeadersPromise: Promise<Record<string, string>> | null = null;

function parseSessionToken(cookieHeader: string): string | null {
  const match = cookieHeader.match(
    /(?:^|;\s*)(?:__Secure-)?better-auth\.session_token=([^;]+)/,
  );
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

async function computeAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};

  const fromClient = authClient.getCookie?.();
  const cookie =
    typeof fromClient === "string" && fromClient.length > 0
      ? fromClient
      : await SecureStore.getItemAsync(SESSION_COOKIE_KEY);

  let token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
  if (!token && cookie) {
    token = parseSessionToken(cookie);
  }

  if (cookie) headers.Cookie = cookie;
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
}

async function buildAuthHeaders(): Promise<Record<string, string>> {
  if (cachedAuthHeaders) return cachedAuthHeaders;

  if (!authHeadersPromise) {
    authHeadersPromise = computeAuthHeaders().then((headers) => {
      cachedAuthHeaders = headers;
      authHeadersPromise = null;
      return headers;
    });
  }
  return authHeadersPromise;
}

/**
 * Call after sign-in, sign-out, or any session refresh so stale
 * cookies/tokens are never served from the in-memory cache.
 */
export function invalidateAuthHeaderCache(): void {
  cachedAuthHeaders = null;
  authHeadersPromise = null;
}

async function clearSessionStorage(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(SESSION_COOKIE_KEY),
    SecureStore.deleteItemAsync(SESSION_DATA_KEY),
    SecureStore.deleteItemAsync(SESSION_TOKEN_KEY),
  ]);
}

async function handleUnauthorized(): Promise<void> {
  if (handlingUnauthorized) return;
  handlingUnauthorized = true;

  try {
    invalidateAuthHeaderCache();
    await clearSessionStorage();
    const { useAuthStore } = await import(
      "@/src/features/auth/hooks/useAuth"
    );
    useAuthStore.getState().reset();
    router.replace("/(auth)/welcome");
  } finally {
    handlingUnauthorized = false;
  }
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  const authHeaders = await buildAuthHeaders();
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...authHeaders,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "omit",
  });

  let payload: ApiEnvelope<T> | ApiFailure | null = null;

  try {
    payload = (await response.json()) as ApiEnvelope<T> | ApiFailure;
  } catch {
    payload = null;
  }

  if (response.status === 401) {
    await handleUnauthorized();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const message =
      payload && "error" in payload
        ? payload.error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (!payload || !("data" in payload)) {
    throw new Error("Invalid API response shape");
  }

  return payload.data;
}

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>("GET", path);
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>("POST", path, body);
  },

  put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>("PUT", path, body);
  },

  delete<T>(path: string): Promise<T> {
    return request<T>("DELETE", path);
  },

  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>("PATCH", path, body);
  },
};