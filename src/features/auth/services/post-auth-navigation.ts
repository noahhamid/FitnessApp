import { fetchUserProfile } from "@/src/features/profile/services/profile.service";
import { router } from "expo-router";
import { useAuthStore } from "../hooks/useAuth";
import {
  hasCompletedOnboardingPayload,
  saveCompletedOnboardingPayload,
  type OnboardingAuthParams,
} from "./onboarding-payload.service";

/** Shared routing after email or social sign-in / sign-up. */
export async function navigateAfterAuth(
  params: OnboardingAuthParams,
  options?: { isNewAccount?: boolean },
): Promise<void> {
  const offer = Array.isArray(params.offerAccepted)
    ? params.offerAccepted[0]
    : params.offerAccepted;
  if (offer === "1") {
    useAuthStore.getState().setPremiumUnlocked(true);
  } else if (offer === "0") {
    useAuthStore.getState().setPremiumUnlocked(false);
  }

  if (hasCompletedOnboardingPayload(params)) {
    await saveCompletedOnboardingPayload(params);
    useAuthStore.getState().setOnboarded(true);
    router.replace("/(app)/(tabs)");
    return;
  }

  if (options?.isNewAccount) {
    useAuthStore.getState().setOnboarded(false);
    router.replace("/(auth)/onboarding/goals");
    return;
  }

  let profileComplete = false;
  try {
    const profile = await fetchUserProfile();
    profileComplete = !!(
      profile?.goalId &&
      profile?.gender &&
      profile?.weightKg != null &&
      profile?.heightCm != null &&
      profile?.age != null &&
      profile?.daysPerWeek != null &&
      profile?.experience &&
      profile?.equipment
    );
  } catch {
    // Fall through to onboarding rather than blocking sign-in.
  }

  useAuthStore.getState().setOnboarded(profileComplete);
  router.replace(
    profileComplete ? "/(app)/(tabs)" : "/(auth)/onboarding/goals",
  );
}
