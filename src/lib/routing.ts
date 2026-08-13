// src/lib/routing.ts

import { useAuthStore } from "@/src/features/auth/hooks/useAuth";
import { getSession } from "@/src/features/auth/services/auth.service";

export async function hasActiveSession(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

export function isOnboardingComplete(): boolean {
  return useAuthStore.getState().onboarded;
}
