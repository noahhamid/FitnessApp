import { OnboardingTransition } from "@/src/features/auth/components/OnboardingTransition";
import {
  estimateTimeline,
  formatTargetDate,
  type GoalId,
  type Pace,
} from "@/src/lib/onboarding-timeline";
import { router, useLocalSearchParams } from "expo-router";
import { CalendarDays } from "lucide-react-native";
import { useMemo } from "react";

export default function PredictedDateScreen() {
  const params = useLocalSearchParams<{
    goalId?: string;
    weightKg?: string;
    targetWeightKg?: string;
    pace?: string;
  }>();

  const goalId = (params.goalId ?? "health") as GoalId;
  const pace = (params.pace ?? "moderate") as Pace;
  const currentKg = parseInt(params.weightKg ?? "70", 10) || 70;
  const targetKg =
    parseInt(params.targetWeightKg ?? String(currentKg), 10) || currentKg;

  const estimate = useMemo(
    () => estimateTimeline(goalId, currentKg, targetKg, pace),
    [goalId, currentKg, targetKg, pace],
  );

  let headline: string;

  if (estimate.type === "weight" && estimate.alreadyThere) {
    headline = "YOU'RE\nALREADY THERE.";
  } else if (estimate.type === "weight") {
    headline = `ABOUT\n${formatTargetDate(estimate.targetDate).toUpperCase()}`;
  } else {
    headline = `${estimate.weeksLow}–${estimate.weeksHigh}\nWEEKS OUT`;
  }

  return (
    <OnboardingTransition
      headline={headline}
      icon={CalendarDays}
      onContinue={() =>
        router.push({ pathname: "/(auth)/onboarding/body-issues", params })
      }
    />
  );
}
