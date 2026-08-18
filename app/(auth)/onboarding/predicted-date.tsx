import { OnboardingTransition } from "@/src/features/auth/components/OnboardingTransition";
import {
  estimateTimeline,
  formatTargetDate,
  type GoalId,
  type Pace,
} from "@/src/lib/onboarding-timeline";
import type { Gender } from "@/src/lib/nutrition-calc";
import { router, useLocalSearchParams } from "expo-router";
import { CalendarDays } from "lucide-react-native";
import { useMemo } from "react";

export default function PredictedDateScreen() {
  const params = useLocalSearchParams<{
    goalId?: string;
    weightKg?: string;
    targetWeightKg?: string;
    pace?: string;
    gender?: string;
    age?: string;
    heightCm?: string;
    bodyFatPercent?: string;
  }>();

  const goalId = (params.goalId ?? "health") as GoalId;
  const pace = (params.pace ?? "moderate") as Pace;
  const currentKg = parseInt(params.weightKg ?? "70", 10) || 70;
  const targetKg =
    parseInt(params.targetWeightKg ?? String(currentKg), 10) || currentKg;
  const gender: Gender = params.gender === "female" ? "female" : "male";
  const age = parseInt(params.age ?? "28", 10) || 28;
  const heightCm = parseInt(params.heightCm ?? "170", 10) || 170;
  const bodyFatRaw = Number(params.bodyFatPercent);
  const bodyFatPercent =
    Number.isFinite(bodyFatRaw) && bodyFatRaw > 0 ? bodyFatRaw : undefined;

  const estimate = useMemo(
    () =>
      estimateTimeline({
        goalId,
        currentKg,
        targetKg,
        pace,
        gender,
        age,
        heightCm,
        bodyFatPercent,
      }),
    [goalId, currentKg, targetKg, pace, gender, age, heightCm, bodyFatPercent],
  );

  let headline: string;
  let sub: string;

  if (estimate.alreadyThere) {
    headline =
      goalId === "endure" || goalId === "health"
        ? "RIGHT WHERE\nYOU WANT TO BE."
        : "YOU'RE\nALREADY THERE.";
    sub =
      goalId === "endure" || goalId === "health"
        ? "You're at your maintain weight — we'll lock nutrition into steady mode."
        : "You're at your target weight — we'll lock the plan into maintenance mode.";
  } else {
    headline = `ABOUT\n${formatTargetDate(estimate.targetDate).toUpperCase()}`;
    if (goalId === "lose") {
      sub = `That's when we project you'll hit ${targetKg} kg at your chosen pace.`;
    } else if (goalId === "build") {
      sub = `That's when we project you'll reach ${targetKg} kg at your chosen pace.`;
    } else {
      sub = `That's when we project you'll settle around ${targetKg} kg at your chosen pace.`;
    }
  }

  return (
    <OnboardingTransition
      headline={headline}
      sub={sub}
      icon={CalendarDays}
      onContinue={() =>
        router.push({ pathname: "/(auth)/onboarding/body-issues", params })
      }
    />
  );
}
