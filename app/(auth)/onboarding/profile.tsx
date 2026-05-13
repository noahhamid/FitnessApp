import { ProfileMetricsForm } from "@/src/features/auth";
import { router, useLocalSearchParams } from "expo-router";

export default function OnboardingProfileRoute() {
  // Receive goalId passed from goals.tsx so ProfileMetricsForm
  // can personalise its copy and store it alongside metrics
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  return (
    <ProfileMetricsForm
      goalId={goalId}
      onBack={() => router.back()}
      onNext={() => router.push("/(auth)/onboarding/ready")}
    />
  );
}
