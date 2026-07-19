import { useQuery } from "@tanstack/react-query";
import { api } from "@/src/lib/api";

export type LastPerformanceMap = Record<string, { weight?: number; reps?: number }>;

export function useLastPerformance() {
  return useQuery({
    queryKey: ["workout-last-performance"],
    queryFn: () => api.get<LastPerformanceMap>("/api/workouts/last-performance"),
  });
}