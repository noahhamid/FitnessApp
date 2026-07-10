// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

const baseURL = process.env.EXPO_PUBLIC_BETTER_AUTH_URL;

if (!baseURL) {
  throw new Error("EXPO_PUBLIC_BETTER_AUTH_URL is not configured");
}

export const AUTH_STORAGE_PREFIX = "myapp";

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    expoClient({
      scheme: "myapp",
      storagePrefix: AUTH_STORAGE_PREFIX,
      storage: SecureStore,
    }),
  ],
});