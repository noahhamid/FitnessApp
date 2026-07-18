import { useQuery } from "@tanstack/react-query";
import { api } from "@/src/lib/api";
import type { ApiWorkoutPlan } from "./workout-plan-adapter";

export function useWorkoutPlan() {
  return useQuery({
    queryKey: ["workout-plan"],
    queryFn: () => api.get<ApiWorkoutPlan | null>("/api/workouts/plan"),
  });
}