import { useAuth, useAuthHydration } from "@/src/features/auth/hooks/useAuth";
import { useAuthStore } from "@/src/features/auth/hooks/useAuth";
import { fetchUserProfile } from "@/src/features/profile/services/profile.service";
import { shouldRedirectToVerifyEmail } from "@/src/lib/email-verification";
import { isOnboardingProfileComplete } from "@/src/lib/onboarding-complete";
import { LoadingScreen } from "@/src/ui/components/LoadingScreen";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function Index() {
  const hydrated = useAuthHydration();
  const { hasSession, onboardingComplete, user} = useAuth();
  const queryClient = useQueryClient();
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const [backendProfileLoaded, setBackendProfileLoaded] = useState(false);
  const [backendProfileComplete, setBackendProfileComplete] = useState(false);
  const [backendCheckFailed, setBackendCheckFailed] = useState(false);

  useEffect(() => {
    let active = true;
    async function syncOnboardingState() {
      if (!hydrated || !hasSession) {
        if (active) {
          setBackendProfileComplete(false);
          setBackendCheckFailed(false);
          setBackendProfileLoaded(true);
        }
        return;
      }

      
      if (active) setBackendProfileLoaded(false);

      try {
        await queryClient.invalidateQueries();
        const profile = await fetchUserProfile();
        if (!active) return;
        const complete = isOnboardingProfileComplete(profile);
        setBackendProfileComplete(complete);
        setBackendCheckFailed(false);
        // Trust the server when we actually reached it — a leftover local
        // "quiz done" flag must not send someone into the app with no profile.
        setOnboarded(complete);
      } catch {
        if (!active) return;
        setBackendProfileComplete(false);
        setBackendCheckFailed(true);
      } finally {
        if (active) setBackendProfileLoaded(true);
      }
    }

    void syncOnboardingState();
    return () => {
      active = false;
    };
  }, [hydrated, hasSession, queryClient, setOnboarded]);
  
  const resolvedOnboarding = backendCheckFailed
    ? onboardingComplete
    : backendProfileComplete;

    if (!hydrated) return <LoadingScreen />;
    if (!hasSession) return <Redirect href="/(auth)/welcome" />;
    if (shouldRedirectToVerifyEmail(user)) {
      return <Redirect href="/(auth)/verify-email" />;
    }
    if (!backendProfileLoaded) return <LoadingScreen />;
    if (!resolvedOnboarding) return <Redirect href="/(auth)/onboarding" />;
    return <Redirect href="/(app)/(tabs)" />;
}
