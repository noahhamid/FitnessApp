import { Stack } from "expo-router";

// ============================================================
// TEMP: bypassing session/onboarding gate while working on
// frontend UI only. Real version (with useAuth/useAuthHydration)
// is commented out below — restore once backend work resumes.
// ============================================================

export default function AppGroupLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

/* --- REAL VERSION, RESTORE LATER ---

import { useAuth, useAuthHydration } from "@/src/features/auth/hooks/useAuth";
import { Redirect, Stack } from "expo-router";

export default function AppGroupLayout() {
  const hydrated = useAuthHydration();
  const { hasSession, onboardingComplete } = useAuth();

  if (!hydrated) return null;
  if (!hasSession) return <Redirect href="/(auth)/sign-in" />;
  if (!onboardingComplete)
    return <Redirect href="/(auth)/onboarding/goals" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}

*/
