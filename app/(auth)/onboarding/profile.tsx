import { ProfileMetricsForm } from "@/src/features/auth";
import { router, useLocalSearchParams } from "expo-router";

export default function OnboardingProfileRoute() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  return (
    <ProfileMetricsForm
      goalId={goalId}
      onBack={() => router.back()}
      onNext={() =>
        router.push({
          pathname: "/(auth)/onboarding/ready",
          params: { goalId },
        })
      }
    />
  );
}
