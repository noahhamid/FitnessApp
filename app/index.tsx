import { useAuth, useAuthHydration } from "@/src/features/auth/hooks/useAuth";
import { Redirect } from "expo-router";

export default function Index() {
  const hydrated = useAuthHydration();
  const { hasSession, onboardingComplete } = useAuth();

  if (!hydrated) return null;
  if (!hasSession) return <Redirect href="/(auth)/welcome" />;
  if (!onboardingComplete) return <Redirect href="/(auth)/onboarding/goals" />;
  return <Redirect href="/(app)/(tabs)" />;
}
