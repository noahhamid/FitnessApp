import { OnboardingTransition } from "@/src/features/auth/components/OnboardingTransition";
import { router, useLocalSearchParams } from "expo-router";
import { Shield } from "lucide-react-native";

export default function InjuriesTransitionScreen() {
  const params = useLocalSearchParams<{ injuries?: string }>();
  const injuries = (params.injuries ?? "").split(",").filter(Boolean);
  const hasInjuries = injuries.length > 0 && !injuries.includes("none");

  return (
    <OnboardingTransition
      headline={
        hasInjuries ? "WE'LL TRAIN\nAROUND IT." : "NO LIMITATIONS.\nFULL SEND."
      }
      sub={
        hasInjuries
          ? "Moves that stress those areas get swapped for safer alternatives."
          : "Nothing to work around — the full exercise catalog stays open."
      }
      icon={Shield}
      onContinue={() =>
        router.replace({ pathname: "/(auth)/onboarding/experience", params })
      }
    />
  );
}
