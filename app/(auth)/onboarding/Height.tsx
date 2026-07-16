import { router } from "expo-router";
import HeightScreen from "@/src/features/auth/components/HeightScreen";

export default function Height() {
  return (
    <HeightScreen
      onContinue={(heightCm) => {
        // TODO: persist heightCm once backend wiring is ready
        router.push("/(onboarding)/weight");
      }}
    />
  );
}
