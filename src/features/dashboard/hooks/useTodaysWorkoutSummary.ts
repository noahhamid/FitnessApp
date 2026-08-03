import { useMemo } from "react";
import { useWorkoutPlan } from "@/src/features/workout/hooks/useWorkoutPlan";
import { adaptPlanDay } from "@/src/lib/workout-plan-adapter";
import { getPlanDayIndexForDate } from "@/src/lib/plan-day-selection";

function estimateMinutes(exercises: {
  sets: number;
  reps?: number;
  durationSec?: number;
  restSec: number;
}[]) {
  const seconds = exercises.reduce((sum, ex) => {
    const work = ex.durationSec ?? (ex.reps ?? 10) * 3;
    return sum + (work + ex.restSec) * ex.sets;
  }, 0);
  return Math.round(seconds / 60);
}

export type TodaysWorkoutDay =
  | {
      kind: "workout";
      title: string;
      tag: string;
      minutes: number;
      exerciseCount: number;
      imageUrl: string;
    }
  | { kind: "rest" };

export function useTodaysWorkoutSummary(dateStr?: string) {
  const { data: apiPlan, isLoading } = useWorkoutPlan();

  const day = useMemo((): TodaysWorkoutDay | null => {
    if (!apiPlan) return null;

    const targetDate = dateStr
      ? new Date(`${dateStr}T00:00:00`) // local midnight, not UTC midnight
      : new Date();
    const dayIndex = getPlanDayIndexForDate(targetDate, apiPlan.daysPerWeek);

    if (dayIndex === null) return { kind: "rest" };

    const apiDay = apiPlan.days[dayIndex];
    if (!apiDay) return null;

    const uiDay = adaptPlanDay({ ...apiDay }, apiPlan.goalId);

    const groups = [
      ...new Set(
        uiDay.exercises.map((e) => e.muscleGroup).filter(Boolean),
      ),
    ] as string[];
    const capitalized = groups.map(
      (g) => g.charAt(0).toUpperCase() + g.slice(1),
    );
    const title =
      capitalized.length >= 2
        ? `${capitalized[0]} & ${capitalized[1]}`
        : (capitalized[0] ?? uiDay.title);

    return {
      kind: "workout",
      title,
      tag: uiDay.title,
      minutes: estimateMinutes(uiDay.exercises),
      exerciseCount: uiDay.exercises.length,
      imageUrl: uiDay.coverImage,
    };
  }, [apiPlan, dateStr]);

  // Back-compat alias used by older call sites expecting `summary`.
  const summary = day?.kind === "workout" ? day : null;

  return { day, summary, isLoading };
}
