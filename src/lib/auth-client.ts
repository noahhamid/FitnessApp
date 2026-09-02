import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import type { BetterAuthClientPlugin } from "better-auth/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { applyDevLanApiUrlOverride } from "./dev-api-url";
import { getClientApiUrl } from "./public-api-url";
import { persistSessionToken, readSessionToken } from "./session-token";
import { APP_SCHEME, AUTH_STORAGE_PREFIX } from "./brand";

// Before createAuthClient — force Expo Go onto the Metro host's :3000 API.
applyDevLanApiUrlOverride();

const baseURL = getClientApiUrl();

export { APP_SCHEME, AUTH_STORAGE_PREFIX };

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
    id: "trainplate-bearer-token",
    fetchPlugins: [
      {
        id: "trainplate-bearer-token",
        name: "Trainplate bearer token",
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
    // expo plugin types lag better-auth's BetterAuthClientPlugin.
    expoClient({
      scheme: APP_SCHEME,
      storagePrefix: AUTH_STORAGE_PREFIX,
      storage: Platform.OS === "web" ? webStorage : SecureStore,
    }) as any,
    bearerTokenPlugin(),
  ],
});
