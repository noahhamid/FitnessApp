import { OnboardingTransition } from "@/src/features/auth/components/OnboardingTransition";
import {
  estimateTimeline,
  formatTargetDate,
  type GoalId,
  type Pace,
} from "@/src/lib/onboarding-timeline";
import { router, useLocalSearchParams } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { useMemo } from "react";

export default function RevisedPredictionScreen() {
  const params = useLocalSearchParams<{
    goalId?: string;
    weightKg?: string;
    targetWeightKg?: string;
    pace?: string;
    daysPerWeek?: string;
  }>();

  const goalId = (params.goalId ?? "health") as GoalId;
  const pace = (params.pace ?? "moderate") as Pace;
  const currentKg = parseInt(params.weightKg ?? "70", 10) || 70;
  const targetKg =
    parseInt(params.targetWeightKg ?? String(currentKg), 10) || currentKg;
  const daysPerWeek = parseInt(params.daysPerWeek ?? "3", 10) || 3;

  const estimate = useMemo(
    () => estimateTimeline(goalId, currentKg, targetKg, pace, daysPerWeek),
    [goalId, currentKg, targetKg, pace, daysPerWeek],
  );

  let headline: string;

  if (estimate.type === "weight" && estimate.alreadyThere) {
    headline = "STILL RIGHT\nON TARGET.";
  } else if (estimate.type === "weight") {
    headline = `NOW\n${formatTargetDate(estimate.targetDate).toUpperCase()}`;
  } else {
    headline = `${estimate.weeksLow}–${estimate.weeksHigh}\nWEEKS OUT`;
  }

  return (
    <OnboardingTransition
      headline={headline}
      icon={Sparkles}
      onContinue={() =>
        router.push({ pathname: "/(auth)/onboarding/creating-plan", params })
      }
    />
  );
}
