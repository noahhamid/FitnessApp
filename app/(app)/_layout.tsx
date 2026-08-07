import { useEffect } from "react";
import { useAuth, useAuthHydration } from "@/src/features/auth/hooks/useAuth";
import { prefetchWorkoutBootQueries } from "@/src/features/workout/hooks/useInProgressSession";
import { useMealWorkoutReminders } from "@/src/hooks/useMealWorkoutReminders";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect, Stack } from "expo-router";

export default function AppGroupLayout() {
  const hydrated = useAuthHydration();
  const { hasSession, onboardingComplete } = useAuth();
  const queryClient = useQueryClient();

  // Kick workout boot queries as soon as the signed-in app shell mounts —
  // ahead of Train tab focus — so in-progress vs Start isn't unknown on open.
  useEffect(() => {
    if (!hydrated || !hasSession || !onboardingComplete) return;
    prefetchWorkoutBootQueries(queryClient);
  }, [hydrated, hasSession, onboardingComplete, queryClient]);

  // Local meal/workout reminders — reschedule on open + each foreground.
  useMealWorkoutReminders(
    hydrated && hasSession && onboardingComplete,
  );

  if (!hydrated) return null;
  if (!hasSession) return <Redirect href="/(auth)/sign-in" />;
  if (!onboardingComplete) return <Redirect href="/(auth)/onboarding/goals" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
