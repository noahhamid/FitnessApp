import { GoalsForm } from "@/src/features/auth";
import { router } from "expo-router";

export default function OnboardingGoalsRoute() {
  return (
    <GoalsForm
      onNext={(goalId) =>
        router.push({
          pathname: "/(auth)/onboarding/profile",
          params: { goalId },
        })
      }
    />
  );
}
