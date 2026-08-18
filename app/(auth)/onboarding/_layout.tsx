import { saveOnboardingDraft } from "@/src/features/auth/services/onboarding-draft.service";
import type { OnboardingAuthParams } from "@/src/features/auth/services/onboarding-payload.service";
import { useOnboardingColors } from "@/src/ui/tokens";
import { Stack, useGlobalSearchParams } from "expo-router";
import { useEffect } from "react";

export default function OnboardingLayout() {
  const C = useOnboardingColors();
  const params = useGlobalSearchParams();

  useEffect(() => {
    void saveOnboardingDraft(params as OnboardingAuthParams);
  }, [params]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        animationDuration: 260,
        contentStyle: { backgroundColor: C.bg },
      }}
    >
      <Stack.Screen name="index" options={{ animation: "none" }} />
      <Stack.Screen name="gender" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="goal-detail" />
      <Stack.Screen name="focus-areas" />
      <Stack.Screen name="focus-transition" />
      <Stack.Screen name="age" />
      <Stack.Screen name="height" />
      <Stack.Screen name="weight" />
      <Stack.Screen name="body-fat" />
      <Stack.Screen name="target-weight" />
      <Stack.Screen name="pace" />
      <Stack.Screen name="predicted-date" />
      <Stack.Screen name="body-issues" />
      <Stack.Screen name="issues-transition" />
      <Stack.Screen name="injuries" />
      <Stack.Screen name="injuries-transition" />
      <Stack.Screen name="experience" />
      <Stack.Screen name="equipment" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="revised-prediction" />
      <Stack.Screen name="creating-plan" />
      <Stack.Screen name="ready" />
    </Stack>
  );
}
