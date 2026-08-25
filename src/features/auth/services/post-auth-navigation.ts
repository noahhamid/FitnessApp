import { fetchUserProfile } from "@/src/features/profile/services/profile.service";
import { isOnboardingProfileComplete } from "@/src/lib/onboarding-complete";
import { router } from "expo-router";
import { useAuthStore } from "../hooks/useAuth";
import {
  clearOnboardingDraft,
  loadOnboardingDraft,
  saveOnboardingDraft,
} from "./onboarding-draft.service";
import {
  hasCompletedOnboardingPayload,
  onboardingParamsForNavigation,
  saveCompletedOnboardingPayload,
  type OnboardingAuthParams,
} from "./onboarding-payload.service";

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Shared routing after email or social sign-in / sign-up. */
export async function navigateAfterAuth(
  params: OnboardingAuthParams,
  options?: { isNewAccount?: boolean },
): Promise<void> {
  const draft = await loadOnboardingDraft();
  const merged: OnboardingAuthParams = {
    ...draft,
    ...onboardingParamsForNavigation(params),
  };

  const offer = Array.isArray(merged.offerAccepted)
    ? merged.offerAccepted[0]
    : merged.offerAccepted;
  if (offer === "1") {
    useAuthStore.getState().setPremiumUnlocked(true);
  } else if (offer === "0") {
    useAuthStore.getState().setPremiumUnlocked(false);
  }

  if (hasCompletedOnboardingPayload(merged)) {
    const saved = await saveCompletedOnboardingPayload(merged);
    if (saved) {
      await clearOnboardingDraft();
      useAuthStore.getState().setOnboarded(true);
      router.replace("/(app)/(tabs)");
      return;
    }
    // Account exists but session/token not ready yet (email verify pending,
    // or web cross-origin cookie lag). Keep the draft and wait for confirm.
    await saveOnboardingDraft(merged);
    useAuthStore.getState().setOnboarded(false);
    const email = single(merged.email);
    router.replace({
      pathname: "/(auth)/verify-email",
      params: {
        ...onboardingParamsForNavigation(merged),
        ...(email ? { email: encodeURIComponent(email) } : {}),
      },
    });
    return;
  }

  if (options?.isNewAccount) {
    useAuthStore.getState().setOnboarded(false);
    router.replace("/(auth)/onboarding");
    return;
  }

  let profileComplete = false;
  try {
    profileComplete = isOnboardingProfileComplete(await fetchUserProfile());
  } catch {
    // Fall through to onboarding rather than blocking sign-in.
  }

  useAuthStore.getState().setOnboarded(profileComplete);
  if (profileComplete) {
    await clearOnboardingDraft();
    router.replace("/(app)/(tabs)");
    return;
  }
  router.replace("/(auth)/onboarding");
}
