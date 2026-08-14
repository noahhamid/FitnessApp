import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { PRODUCTION_API_URL } from "./public-api-url";

const baseURL =
  process.env.EXPO_PUBLIC_BETTER_AUTH_URL ?? PRODUCTION_API_URL;

/** Must match app.config.ts `scheme` (Google Auth Platform package / bundle). */
export const APP_SCHEME = "com.exo.fitness";

/** SecureStore key prefix — keep stable once shipped. */
export const AUTH_STORAGE_PREFIX = "exo_fitness";

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    expoClient({
      scheme: APP_SCHEME,
      storagePrefix: AUTH_STORAGE_PREFIX,
      storage: SecureStore,
    }),
  ],
});
