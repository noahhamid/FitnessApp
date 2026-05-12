import { Redirect, Stack } from "expo-router";

import { useAuth, useAuthHydration } from "@/src/features/auth";

export default function AppGroupLayout() {
  const ready = useAuthHydration();
  const { onboardingComplete, hasSession } = useAuth();

  if (!ready) return null;
  if (!onboardingComplete) return <Redirect href="/(auth)/welcome" />;
  if (!hasSession) return <Redirect href="/(auth)/sign-in" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
