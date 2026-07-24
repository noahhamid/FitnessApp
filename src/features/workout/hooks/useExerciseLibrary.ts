import { useQuery } from "@tanstack/react-query";
import { api } from "@/src/lib/api";

export interface LibraryExercise {
  id: string;
  name: string;
  muscleGroup: string;
  movementPattern: string;
  minEquipment: string;
}

export function useExerciseLibrary(muscleGroup?: string) {
  return useQuery({
    queryKey: ["exercise-library", muscleGroup ?? "all"],
    queryFn: () =>
      api.get<LibraryExercise[]>(
        `/api/workouts/exercises${muscleGroup ? `?muscleGroup=${muscleGroup}` : ""}`,
      ),
  });
}