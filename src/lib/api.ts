import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { localDateOnly } from "@/src/features/progress/lib/localDate";
import { AUTH_STORAGE_PREFIX, authClient } from "./auth-client";
import { getClientApiUrl } from "./public-api-url";
import {
  clearSessionToken,
  readSessionToken,
  SESSION_TOKEN_KEY,
} from "./session-token";

const API_URL = getClientApiUrl();
const DEFAULT_TIMEOUT_MS = 15_000;//To the team, this is deliberate. A vercel cold start can take a few seconds, we shouldn't lower it below 10s
export const AI_TIMEOUT_MS = 60_000;

type ApiEnvelope<T> = { data: T };
type ApiFailure = { error: string };

const SESSION_COOKIE_KEY = `${AUTH_STORAGE_PREFIX}_cookie`;
const SESSION_DATA_KEY = `${AUTH_STORAGE_PREFIX}_session_data`;

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

  const fromClient = (
    authClient as { getCookie?: () => string | null | undefined }
  ).getCookie?.();
  let cookie =
    typeof fromClient === "string" && fromClient.length > 0
      ? fromClient
      : null;
  if (!cookie) {
    try {
      cookie = await SecureStore.getItemAsync(SESSION_COOKIE_KEY);
    } catch {
      cookie = null;
    }
  }

  let token = await readSessionToken();
  if (!token && cookie) {
    token = parseSessionToken(cookie);
  }

  if (cookie) headers.Cookie = cookie;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    // Until / after bearer plugin is live on Vercel, also send the token as a
    // session cookie so auth.api.getSession() can resolve it.
    if (!headers.Cookie) {
      headers.Cookie = `better-auth.session_token=${token}`;
    }
  }

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
  await clearSessionToken();
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(SESSION_COOKIE_KEY),
      SecureStore.deleteItemAsync(SESSION_DATA_KEY),
      SecureStore.deleteItemAsync(SESSION_TOKEN_KEY),
    ]);
  } catch {
    // SecureStore is a stub on web — token already cleared above.
  }
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
type RequestOptions = { timeoutMs?: number};

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const authHeaders = await buildAuthHeaders();

  const controller = new AbortController();
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Client-Calendar-Date": localDateOnly(),
      ...authHeaders,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "omit",
    signal: controller.signal,
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
} catch(err){
  if (timedOut) {
    throw new Error("The network seems to be slow or unavailable. Please try again :)")
  }
  throw err;
} finally{
  clearTimeout(timer);
}
}

export const api = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>("GET", path, undefined, options);
  },

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("POST", path, body, options);
  },

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("PUT", path, body, options);
  },

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>("DELETE", path, undefined, options);
  },

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("PATCH", path, body, options);
  },
};