import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { PRODUCTION_API_URL } from "./public-api-url";

const baseURL =
  process.env.EXPO_PUBLIC_BETTER_AUTH_URL ?? PRODUCTION_API_URL;

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
