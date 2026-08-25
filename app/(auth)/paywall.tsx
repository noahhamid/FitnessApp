import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { PaywallFlow } from "@/src/features/billing/PaywallFlow";
import { useAuthStore } from "@/src/features/auth/hooks/useAuth";
import {
  onboardingParamsForNavigation,
  saveCompletedOnboardingPayload,
  type OnboardingAuthParams,
} from "@/src/features/auth/services/onboarding-payload.service";
import {
  clearOnboardingDraft,
  saveOnboardingDraft,
} from "@/src/features/auth/services/onboarding-draft.service";
import { authClient } from "@/src/lib/auth";

export default function OnboardingPaywallScreen() {
  const params = useLocalSearchParams<OnboardingAuthParams>();
  const [leaving, setLeaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { data: session } = authClient.useSession();
  const alreadyAuthed = !!session?.user;
  const gender = Array.isArray(params.gender) ? params.gender[0] : params.gender;

  async function continueOnboarding(purchased: boolean) {
    if (leaving) return;
    setLeaving(true);
    setSaveError(null);

    const nextParams = onboardingParamsForNavigation({
      ...params,
      onboardingComplete: "1",
      ...(purchased ? { offerAccepted: "1" } : {}),
    });
    await saveOnboardingDraft(nextParams);

    if (alreadyAuthed) {
      try {
        await saveCompletedOnboardingPayload(nextParams);
        await clearOnboardingDraft();
        useAuthStore.getState().setOnboarded(true);
        router.replace("/(app)/(tabs)");
      } catch {
        setSaveError(
          "Your plan could not be saved. Check your connection and try again.",
        );
        setLeaving(false);
      }
      return;
    }

    router.replace({
      pathname: "/(auth)/sign-up",
      params: nextParams,
    });
  }

  return (
    <PaywallFlow
      gender={gender}
      leaving={leaving}
      saveError={saveError}
      onUnlocked={() => void continueOnboarding(true)}
      onLeaveWithoutPurchase={() => void continueOnboarding(false)}
    />
  );
}
