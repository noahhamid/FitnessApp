import { Redirect } from "expo-router";

// ============================================================
// TEMP: bypassing auth gate while working on frontend UI only.
// Your real index.tsx (with useAuth/useAuthHydration/fetchUserProfile)
// is commented out below — restore it once backend work resumes.
// ============================================================

export default function Index() {
  return <Redirect href="/(auth)/welcome" />;
}

/* --- REAL VERSION, RESTORE LATER ---

import { useAuth, useAuthHydration } from "@/src/features/auth/hooks/useAuth";
import { useAuthStore } from "@/src/features/auth/hooks/useAuth";
import { fetchUserProfile } from "@/src/features/profile/services/profile.service";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function Index() {
  const hydrated = useAuthHydration();
  const { hasSession, onboardingComplete } = useAuth();
  const queryClient = useQueryClient();
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const [backendProfileLoaded, setBackendProfileLoaded] = useState(false);
  const [backendHasProfile, setBackendHasProfile] = useState(false);

  useEffect(() => {
    let active = true;
    async function syncOnboardingState() {
      if (!hydrated || !hasSession) {
        if (active) {
          setBackendHasProfile(false);
          setBackendProfileLoaded(true);
        }
        return;
      }
      if (active) setBackendProfileLoaded(false);

      try {
        await queryClient.invalidateQueries();
        const profile = await fetchUserProfile();
        if (!active) return;
        const hasProfile = profile != null;
        setBackendHasProfile(hasProfile);
        if (hasProfile) setOnboarded(true);
      } catch {
        if (!active) return;
        setBackendHasProfile(false);
      } finally {
        if (active) setBackendProfileLoaded(true);
      }
    }

    void syncOnboardingState();
    return () => {
      active = false;
    };
  }, [hydrated, hasSession, queryClient, setOnboarded]);

  const resolvedOnboarding = onboardingComplete || backendHasProfile;

  if (!hydrated) return null;
  if (!hasSession) return <Redirect href="/(auth)/welcome" />;
  if (!backendProfileLoaded) return null;
  if (!resolvedOnboarding) return <Redirect href="/(auth)/onboarding/goals" />;
  return <Redirect href="/(app)/(tabs)" />;
}

*/
