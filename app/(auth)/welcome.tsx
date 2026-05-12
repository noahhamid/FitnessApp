import { router } from "expo-router";

import { WelcomeSlides } from "@/src/features/auth";

export default function WelcomeRoute() {
  return <WelcomeSlides onNext={() => router.push("/(auth)/onboarding/goals")} />;
}
