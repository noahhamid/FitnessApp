import { router } from "expo-router";

import { GoalsForm } from "@/src/features/auth";

export default function OnboardingGoalsRoute() {
  return <GoalsForm onNext={() => router.push("/(auth)/onboarding/profile")} />;
}
