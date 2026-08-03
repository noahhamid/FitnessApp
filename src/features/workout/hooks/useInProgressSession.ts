import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/src/lib/api";
import { useExerciseLibrary } from "./useExerciseLibrary";
import { useWorkoutPlan } from "./useWorkoutPlan";
import { adaptLibraryExercise } from "@/src/lib/workout-plan-adapter";
import type { WorkoutPlan } from "../data/workouts";

interface RawSession {
  id: string;
  startedAt: string;
  completedAt: string | null;
  notes: string | null;
  /** `id` is WorkoutExercise row id — unique per session row, even if names repeat. */
  exercises: { id: string; exerciseName: string }[];
}

function estimateMinutes(plan: WorkoutPlan): number {
  const seconds = plan.exercises.reduce((sum, ex) => {
    const work = ex.type === "duration" ? (ex.durationSec ?? 0) : (ex.reps ?? 10) * 3;
    return sum + (work + ex.restSec) * ex.sets;
  }, 0);
  return Math.round(seconds / 60);
}

export function useInProgressSession() {
  const { data: apiPlan } = useWorkoutPlan();
  const { data: allExercises } = useExerciseLibrary(); // unfiltered — need name lookups across all muscle groups

  const sessionQuery = useQuery({
    queryKey: ["in-progress-session"],
    queryFn: () => api.get<RawSession[]>("/api/workouts?completed=false&limit=1"),
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
      return { ...adapted, id: se.id };
    });

    const plan: WorkoutPlan = {
      id: session.id,
      title: session.notes ?? "Workout",
      tag: "In progress",
      coverImage: "", // ContinueWorkoutCard doesn't use an image, unlike WorkoutPlanCard
      exercises,
    };

    const totalMinutes = estimateMinutes(plan);
    const elapsedMinutes = Math.floor(
      (Date.now() - new Date(session.startedAt).getTime()) / 60000,
    );

    // Time-based estimate, NOT real set-completion data — see note above
    // on why actual per-set progress isn't available for an abandoned session.
    const percent = totalMinutes > 0
      ? Math.min(100, Math.round((elapsedMinutes / totalMinutes) * 100))
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
  }, [sessionQuery.data, allExercises, apiPlan?.goalId]);

  return { inProgress: result, isLoading: sessionQuery.isLoading };
}