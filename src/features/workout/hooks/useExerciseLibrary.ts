import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/src/lib/api";

export interface LibraryExercise {
  id: string;
  name: string;
  muscleGroup: string;
  movementPattern: string;
  minEquipment: string;
  instructions?: string | null;
}

export function useExerciseLibrary(muscleGroup?: string) {
  return useQuery({
    queryKey: ["exercise-library", muscleGroup ?? "all"],
    queryFn: () =>
      api.get<LibraryExercise[]>(
        `/api/workouts/exercises${muscleGroup ? `?muscleGroup=${muscleGroup}` : ""}`,
      ),
    // Keeps showing the previous category's list while the new one loads,
    // instead of blanking to a spinner on every tap.
    placeholderData: keepPreviousData,
    // Exercise library is static-ish data — no need to refetch on every
    // mount/focus. Once a category's been fetched, reuse it from cache.
    staleTime: 1000 * 60 * 30, // 30 min
  });
}