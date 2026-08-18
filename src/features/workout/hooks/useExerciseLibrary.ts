import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/src/lib/api";

export interface LibraryExercise {
  id: string;
  name: string;
  muscleGroup: string;
  movementPattern: string;
  minEquipment: string;
  /** True = needs a bench, bar, wall or step. Bodyweight plans exclude these. */
  needsProp?: boolean;
  instructions?: string | null;
}

type Options = {
  /** Restrict to prop-dependent moves, or to floor-only ones. */
  needsProp?: boolean;
  enabled?: boolean;
};

export function useExerciseLibrary(muscleGroup?: string, options: Options = {}) {
  const { needsProp, enabled = true } = options;

  return useQuery({
    queryKey: ["exercise-library", muscleGroup ?? "all", needsProp ?? "any"],
    queryFn: () => {
      const params = new URLSearchParams();
      if (muscleGroup) params.set("muscleGroup", muscleGroup);
      if (needsProp !== undefined) params.set("needsProp", String(needsProp));
      const qs = params.toString();
      return api.get<LibraryExercise[]>(
        `/api/workouts/exercises${qs ? `?${qs}` : ""}`,
      );
    },
    enabled,
    // Keeps showing the previous category's list while the new one loads,
    // instead of blanking to a spinner on every tap.
    placeholderData: keepPreviousData,
    // Exercise library is static-ish data — no need to refetch on every
    // mount/focus. Once a category's been fetched, reuse it from cache.
    staleTime: 1000 * 60 * 30, // 30 min
  });
}
