// src/lib/routing.ts

import { useAuthStore } from "@/src/features/auth/hooks/useAuth";
import { getSession } from "@/src/features/auth/services/auth.service";
import { fetchUserProfile } from "@/src/features/profile/services/profile.service";
import * as SecureStore from "expo-secure-store";
import { AUTH_STORAGE_PREFIX } from "@/src/lib/auth-client";

// Temporary — add to getPostSignInRoute just to verify, remove after
export async function getPostSignInRoute(): Promise<string> {
  try {
    const token = await SecureStore.getItemAsync(`${AUTH_STORAGE_PREFIX}_session_token`);
    const cookie = await SecureStore.getItemAsync(`${AUTH_STORAGE_PREFIX}_cookie`);
    console.log("[routing] token:", !!token, "cookie:", !!cookie);

    const profile = await fetchUserProfile();
    const hasProfile = profile !== null;
    useAuthStore.getState().setOnboarded(hasProfile);
    return hasProfile ? "/(app)/(tabs)" : "/(auth)/onboarding/goals";
  } catch (err) {
    console.error("[routing] profile check failed:", err);
    return "/(auth)/onboarding/goals";
  }
}

export async function hasActiveSession(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

export function isOnboardingComplete(): boolean {
  return useAuthStore.getState().onboarded;
}