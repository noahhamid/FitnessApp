import { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useAuth, useAuthHydration } from "@/src/features/auth/hooks/useAuth";
import { flushDeferredOnboardingIfNeeded } from "@/src/features/auth/services/onboarding-payload.service";
import { prefetchWorkoutBootQueries } from "@/src/features/workout/hooks/useInProgressSession";
import { useMealWorkoutReminders } from "@/src/hooks/useMealWorkoutReminders";
import { useStoreReviewPrompts } from "@/src/hooks/useStoreReviewPrompts";
import { ensureSessionTimerListener } from "@/src/lib/session-timer-notification";
import { LoadingScreen } from "@/src/ui/components/LoadingScreen";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect, Stack } from "expo-router";
import { shouldRedirectToVerifyEmail } from "@/src/lib/email-verification";

export default function AppGroupLayout() {
  const hydrated = useAuthHydration();
  const { hasSession, onboardingComplete, user } = useAuth();
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
  useStoreReviewPrompts(hydrated && hasSession && onboardingComplete);

  useEffect(() => {
    if (!hydrated || !hasSession || !onboardingComplete) return;
    ensureSessionTimerListener();
  }, [hydrated, hasSession, onboardingComplete]);

  // Retry deferred profile save while staying on tabs (Index only remounts
  // on cold entry / leaving the app group).
  useEffect(() => {
    if (!hydrated || !hasSession || !onboardingComplete) return;
    void flushDeferredOnboardingIfNeeded();

    let appState: AppStateStatus = AppState.currentState;
    const sub = AppState.addEventListener("change", (next) => {
      if (
        appState.match(/inactive|background/) &&
        next === "active"
      ) {
        void flushDeferredOnboardingIfNeeded();
      }
      appState = next;
    });
    return () => sub.remove();
  }, [hydrated, hasSession, onboardingComplete]);

  if (!hydrated) return <LoadingScreen />;
  if (!hasSession) return <Redirect href="/(auth)/welcome" />;
  if (
    shouldRedirectToVerifyEmail(user, { allowDeferred: onboardingComplete })
  ) {
    const email = user?.email?.trim();
    return (
      <Redirect
        href={{
          pathname: "/(auth)/verify-email",
          params: email ? { email: encodeURIComponent(email) } : undefined,
        }}
      />
    );
  }
  if (!onboardingComplete) return <Redirect href="/(auth)/onboarding" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
