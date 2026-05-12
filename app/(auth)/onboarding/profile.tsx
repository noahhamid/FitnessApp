import { router } from "expo-router";

import { ProfileMetricsForm } from "@/src/features/auth";

export default function OnboardingProfileRoute() {
  return (
    <ProfileMetricsForm
      onBack={() => router.back()}
      onNext={() => router.push("/(auth)/onboarding/ready")}
    />
  );
}
