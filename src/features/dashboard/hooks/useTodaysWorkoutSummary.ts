import { useMemo } from "react";
import { useWorkoutPlan } from "@/src/features/workout/hooks/useWorkoutPlan";
import { useTodayExtras } from "@/src/features/workout/hooks/useTodayExtras";
import {
  adaptLibraryExercise,
  adaptPlanDay,
  estimateWorkoutMinutes,
} from "@/src/lib/workout-plan-adapter";
import { getPlanDayIndexForDate } from "@/src/lib/plan-day-selection";
import { localDateOnly } from "@/src/features/progress/lib/localDate";

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
  const { extras } = useTodayExtras();
  const includeExtras = !dateStr || dateStr === localDateOnly();

  const day = useMemo((): TodaysWorkoutDay | null => {
    if (!apiPlan) return null;

    const targetDate = dateStr
      ? new Date(`${dateStr}T00:00:00`) // local midnight, not UTC midnight
      : new Date();
    const dayIndex = getPlanDayIndexForDate(
      targetDate,
      apiPlan.daysPerWeek,
      apiPlan.trainingDays,
    );

    if (dayIndex === null) return { kind: "rest" };

    const apiDay = apiPlan.days[dayIndex];
    if (!apiDay) return null;

    const uiDay = adaptPlanDay(apiDay, apiPlan.goalId);
    const exercises =
      includeExtras && extras.length > 0
        ? [
            ...uiDay.exercises,
            ...extras.map((e) =>
              adaptLibraryExercise(
                {
                  id: e.id,
                  name: e.exerciseName,
                  muscleGroup: e.muscleGroup,
                  movementPattern: e.movementPattern,
                },
                apiPlan.goalId,
              ),
            ),
          ]
        : uiDay.exercises;

    return {
      kind: "workout",
      title: uiDay.title,
      tag: uiDay.tag,
      minutes: estimateWorkoutMinutes(exercises),
      exerciseCount: exercises.length,
      imageUrl: uiDay.coverImage,
    };
  }, [apiPlan, dateStr, extras, includeExtras]);

  // Back-compat alias used by older call sites expecting `summary`.
  const summary = day?.kind === "workout" ? day : null;

  return { day, summary, isLoading };
}
