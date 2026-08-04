import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/src/lib/api";
import { useExerciseLibrary } from "./useExerciseLibrary";
import { useWorkoutPlan } from "./useWorkoutPlan";
import {
  adaptLibraryExercise,
  adaptPlanDay,
  imageForMuscleGroup,
} from "@/src/lib/workout-plan-adapter";
import { getTodaysPlanDayIndex } from "@/src/lib/plan-day-selection";
import type { ExerciseLoggedSet, WorkoutPlan } from "../data/workouts";

type RawSet = ExerciseLoggedSet;

interface RawSession {
  id: string;
  startedAt: string;
  completedAt: string | null;
  notes: string | null;
  /** `id` is WorkoutExercise row id — unique per session row, even if names repeat. */
  exercises: { id: string; exerciseName: string; sets?: unknown }[];
}

function normalizeSets(raw: unknown): RawSet[] {
  if (!Array.isArray(raw)) return [];
  const out: RawSet[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const s = item as Record<string, unknown>;
    const next: RawSet = {};
    if (typeof s.reps === "number") next.reps = s.reps;
    if (typeof s.weight === "number") next.weight = s.weight;
    if (typeof s.durationSec === "number") next.durationSec = s.durationSec;
    if (typeof s.completed === "boolean") next.completed = s.completed;
    out.push(next);
  }
  return out;
}

function countCompletedSets(sets: RawSet[]): number {
  return sets.filter((s) => s.completed !== false).length;
}

function estimateMinutes(plan: WorkoutPlan): number {
  const seconds = plan.exercises.reduce((sum, ex) => {
    const work =
      ex.type === "duration" ? (ex.durationSec ?? 0) : (ex.reps ?? 10) * 3;
    return sum + (work + ex.restSec) * ex.sets;
  }, 0);
  return Math.round(seconds / 60);
}

export function useInProgressSession() {
  const { data: apiPlan } = useWorkoutPlan();
  const { data: allExercises } = useExerciseLibrary(); // unfiltered — need name lookups across all muscle groups

  const sessionQuery = useQuery({
    queryKey: ["in-progress-session"],
    queryFn: () =>
      api.get<RawSession[]>("/api/workouts?completed=false&limit=1"),
  });

  const result = useMemo(() => {
    const session = sessionQuery.data?.[0];
    if (!session || !allExercises) return null;

    const libraryByName = new Map(allExercises.map((ex) => [ex.name, ex]));

    // Reconstruct a WorkoutPlan-shaped object from the session's stored
    // exercise names, using library metadata where the name matches
    // (which it always should, since exercises only ever come from the
    // seeded pool) — falls back to a generic default otherwise.
    // Always stamp WorkoutExercise.id onto the result: adaptLibraryExercise
    // would otherwise use the catalog Exercise.id, so two session rows with
    // the same name (e.g. after a double-add) share one React key.
    const exercises = session.exercises.map((se) => {
      const libEx = libraryByName.get(se.exerciseName);
      const adapted = adaptLibraryExercise(
        libEx ?? {
          id: se.id,
          name: se.exerciseName,
          muscleGroup: "core",
          movementPattern: "carry",
        },
        apiPlan?.goalId ?? "health",
      );
      const loggedSets = normalizeSets(se.sets);
      return {
        ...adapted,
        id: se.id,
        ...(loggedSets.length > 0 ? { loggedSets } : {}),
      };
    });

    // Prefer today's plan-day cover for the continue-card hero; else muscle image.
    let coverImage = "";
    if (apiPlan) {
      const todaysIndex = getTodaysPlanDayIndex(apiPlan.daysPerWeek);
      if (todaysIndex != null && apiPlan.days[todaysIndex]) {
        coverImage = adaptPlanDay(
          apiPlan.days[todaysIndex],
          apiPlan.goalId,
        ).coverImage;
      }
    }
    if (!coverImage && exercises[0]?.muscleGroup) {
      coverImage = imageForMuscleGroup(exercises[0].muscleGroup);
    }

    const plan: WorkoutPlan = {
      id: session.id,
      title: session.notes ?? "Workout",
      tag: "In progress",
      coverImage,
      exercises,
    };

    const totalMinutes = estimateMinutes(plan);
    const elapsedMinutes = Math.floor(
      (Date.now() - new Date(session.startedAt).getTime()) / 60000,
    );

    // Real set completion (Stage 1 PATCH / resume hydration) — not wall-clock.
    const totalTargetSets = plan.exercises.reduce((a, e) => a + e.sets, 0);
    const completedSets = session.exercises.reduce((a, se) => {
      return a + countCompletedSets(normalizeSets(se.sets));
    }, 0);
    const percent =
      totalTargetSets > 0
        ? Math.min(100, Math.round((completedSets / totalTargetSets) * 100))
        : 0;
    const minutesLeft = Math.max(0, totalMinutes - elapsedMinutes);
    const estCalories = Math.round(totalMinutes * 8.5);

    return {
      sessionId: session.id,
      plan,
      percent,
      minutesLeft,
      estCalories,
    };
  }, [sessionQuery.data, allExercises, apiPlan]);

  return { inProgress: result, isLoading: sessionQuery.isLoading };
}
