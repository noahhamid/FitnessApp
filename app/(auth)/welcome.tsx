import { WelcomeSlides } from "@/src/features/auth/components/WelcomeSlides";
import { router } from "expo-router";

export default function WelcomeRoute() {
  return <WelcomeSlides onNext={() => router.push("/(auth)/sign-up")} />;
}
