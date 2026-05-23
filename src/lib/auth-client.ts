import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

const baseURL =
  process.env.EXPO_PUBLIC_API_URL ??
  process.env.EXPO_PUBLIC_BETTER_AUTH_URL ??
  "http://localhost:3000";

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
