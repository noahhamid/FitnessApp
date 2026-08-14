import { OnboardingTransition } from "@/src/features/auth/components/OnboardingTransition";
import {
  estimateTimeline,
  formatTargetDate,
  type GoalId,
  type Pace,
} from "@/src/lib/onboarding-timeline";
import type { ExperienceLevel } from "@/src/lib/body-recomp-prediction";
import type { Gender } from "@/src/lib/nutrition-calc";
import { router, useLocalSearchParams } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { useMemo } from "react";

function resolveExperience(raw?: string): ExperienceLevel {
  if (raw === "novice" || raw === "advanced") return raw;
  return "intermediate";
}

export default function RevisedPredictionScreen() {
  const params = useLocalSearchParams<{
    goalId?: string;
    weightKg?: string;
    targetWeightKg?: string;
    pace?: string;
    daysPerWeek?: string;
    gender?: string;
    age?: string;
    heightCm?: string;
    experience?: string;
  }>();

  const goalId = (params.goalId ?? "health") as GoalId;
  const pace = (params.pace ?? "moderate") as Pace;
  const currentKg = parseInt(params.weightKg ?? "70", 10) || 70;
  const targetKg =
    parseInt(params.targetWeightKg ?? String(currentKg), 10) || currentKg;
  const daysPerWeek = parseInt(params.daysPerWeek ?? "3", 10) || 3;
  const gender: Gender = params.gender === "female" ? "female" : "male";
  const age = parseInt(params.age ?? "28", 10) || 28;
  const heightCm = parseInt(params.heightCm ?? "170", 10) || 170;
  const experience = resolveExperience(params.experience);

  const estimate = useMemo(
    () =>
      estimateTimeline({
        goalId,
        currentKg,
        targetKg,
        pace,
        daysPerWeek,
        gender,
        age,
        heightCm,
        experience,
      }),
    [
      goalId,
      currentKg,
      targetKg,
      pace,
      daysPerWeek,
      gender,
      age,
      heightCm,
      experience,
    ],
  );

  let headline: string;
  let sub: string;

  if (estimate.alreadyThere) {
    headline = "STILL RIGHT\nON TARGET.";
    sub =
      goalId === "endure" || goalId === "health"
        ? `Your ${daysPerWeek}-day schedule still supports holding your maintain weight.`
        : "Your training schedule still supports staying where you are.";
  } else {
    headline = `NOW\n${formatTargetDate(estimate.targetDate).toUpperCase()}`;
    sub = `Updated estimate with ${daysPerWeek} training days per week factored in.`;
  }

  return (
    <OnboardingTransition
      headline={headline}
      sub={sub}
      icon={Sparkles}
      onContinue={() =>
        router.push({ pathname: "/(auth)/onboarding/creating-plan", params })
      }
    />
  );
}
