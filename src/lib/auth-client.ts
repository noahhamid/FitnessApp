import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import type { BetterAuthClientPlugin } from "better-auth/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { getClientApiUrl } from "./public-api-url";
import { persistSessionToken, readSessionToken } from "./session-token";

const baseURL = getClientApiUrl();

/** Must match app.config.ts `scheme` (Google Auth Platform package / bundle). */
export const APP_SCHEME = "com.exo.fitness";

/** SecureStore key prefix — keep stable once shipped. */
export const AUTH_STORAGE_PREFIX = "exo_fitness";

const webStorage = {
  getItem: (key: string) => {
    try {
      return typeof localStorage !== "undefined"
        ? localStorage.getItem(key)
        : null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
    } catch {
      /* private mode */
    }
  },
};

/**
 * Web cannot read `Set-Cookie` on cross-origin responses. Better Auth's bearer
 * plugin exposes `set-auth-token` instead — store it and send as Bearer.
 */
function bearerTokenPlugin(): BetterAuthClientPlugin {
  return {
    id: "exo-bearer-token",
    fetchPlugins: [
      {
        id: "exo-bearer-token",
        name: "Exo bearer token",
        hooks: {
          async onSuccess(context) {
            const fromHeader =
              context.response.headers.get("set-auth-token") ??
              context.response.headers.get("Set-Auth-Token");
            if (fromHeader) {
              await persistSessionToken(fromHeader);
              return;
            }
            const data = context.data as { token?: unknown } | null;
            if (data && typeof data.token === "string" && data.token.length > 0) {
              await persistSessionToken(data.token);
            }
          },
        },
        async init(url, options) {
          const token = await readSessionToken();
          if (!token) return { url, options };
          const headers = new Headers(options?.headers as HeadersInit | undefined);
          if (!headers.has("Authorization")) {
            headers.set("Authorization", `Bearer ${token}`);
          }
          return {
            url,
            options: {
              ...options,
              headers,
            },
          };
        },
      },
    ],
  };
}

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    expoClient({
      scheme: APP_SCHEME,
      storagePrefix: AUTH_STORAGE_PREFIX,
      storage: Platform.OS === "web" ? webStorage : SecureStore,
    }),
    bearerTokenPlugin(),
  ],
});
