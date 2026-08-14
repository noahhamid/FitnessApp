import { OnboardingTransition } from "@/src/features/auth/components/OnboardingTransition";
import { router, useLocalSearchParams } from "expo-router";
import { Crosshair } from "lucide-react-native";

export default function FocusTransitionScreen() {
  const params = useLocalSearchParams();

  return (
    <OnboardingTransition
      headline={"BUILDING AROUND\nYOUR FOCUS."}
      sub="Next we'll grab age, height, and weight so the plan fits your body."
      icon={Crosshair}
      onContinue={() =>
        router.push({ pathname: "/(auth)/onboarding/age", params })
      }
    />
  );
}
