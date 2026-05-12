import { Redirect } from "expo-router";

import { useAuth, useAuthHydration } from "@/src/features/auth";

export default function Index() {
  const ready = useAuthHydration();
  const { onboardingComplete, hasSession } = useAuth();

  if (!ready) return null;
  if (!onboardingComplete) return <Redirect href="/(auth)/welcome" />;
  if (!hasSession) return <Redirect href="/(auth)/sign-in" />;
  return <Redirect href="/(app)/(tabs)" />;
}
