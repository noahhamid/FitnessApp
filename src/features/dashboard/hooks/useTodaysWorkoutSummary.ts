import { useMemo } from "react";
import { useWorkoutPlan } from "@/src/features/workout/hooks/useWorkoutPlan";
import { adaptPlanDay } from "@/src/lib/workout-plan-adapter";
import { getTodaysPlanDayIndex } from "@/src/lib/plan-day-selection";

function estimateMinutes(exercises: { sets: number; reps?: number; durationSec?: number; restSec: number }[]) {
  const seconds = exercises.reduce((sum, ex) => {
    const work = ex.durationSec ?? (ex.reps ?? 10) * 3;
    return sum + (work + ex.restSec) * ex.sets;
  }, 0);
  return Math.round(seconds / 60);
}

export function useTodaysWorkoutSummary() {
  const { data: apiPlan, isLoading } = useWorkoutPlan();

  const summary = useMemo(() => {
    if (!apiPlan) return null;

    const todaysIndex = getTodaysPlanDayIndex(apiPlan.days.length);
    const apiDay = apiPlan.days[todaysIndex];
    if (!apiDay) return null;

    const uiDay = adaptPlanDay({ ...apiDay }, apiPlan.goalId);

    // Muscle-group headline for the card's large title (e.g. "Chest & Shoulders"),
    // while the plan's own day label (e.g. "Push Day") becomes the small tag —
    // mirrors the mock's original title/tag split exactly.
    const groups = [...new Set(uiDay.exercises.map((e) => e.muscleGroup).filter(Boolean))] as string[];
    const capitalized = groups.map((g) => g.charAt(0).toUpperCase() + g.slice(1));
    const title = capitalized.length >= 2
      ? `${capitalized[0]} & ${capitalized[1]}`
      : capitalized[0] ?? uiDay.title;

    return {
      title,
      tag: uiDay.title, // the plan's day label, e.g. "Push Day"
      minutes: estimateMinutes(uiDay.exercises),
      exerciseCount: uiDay.exercises.length,
      imageUrl: uiDay.coverImage,
    };
  }, [apiPlan]);

  return { summary, isLoading };
}