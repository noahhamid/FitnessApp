import { WelcomeSlides } from "@/src/features/auth";
import { router } from "expo-router";

export default function WelcomeRoute() {
  return <WelcomeSlides onNext={() => router.push("/(auth)/onboarding/gender")} />;
}
