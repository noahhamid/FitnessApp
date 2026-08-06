import { useQuery } from "@tanstack/react-query";
import { api } from "@/src/lib/api";
import type { ApiWorkoutPlan } from "@/src/lib/workout-plan-adapter";

/** Must stay identical to useWorkoutPlan's useQuery key (array form). */
export const workoutPlanQueryKey = ["workout-plan"] as const;

export function fetchWorkoutPlan() {
  return api.get<ApiWorkoutPlan | null>("/api/workouts/plan");
}

export function useWorkoutPlan() {
  return useQuery({
    queryKey: workoutPlanQueryKey,
    queryFn: fetchWorkoutPlan,
  });
}
