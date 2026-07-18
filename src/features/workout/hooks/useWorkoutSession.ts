import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/src/lib/api";

interface StartSessionInput {
  notes?: string;
  exercises: { exerciseName: string; sets: unknown[] }[];
}

interface StartSessionResponse {
  id: string;
}

export function useStartWorkoutSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StartSessionInput) =>
      api.post<StartSessionResponse>("/api/workouts", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workout-sessions"] }),
  });
}

interface CompleteSessionInput {
  sessionId: string;
  exercises: {
    exerciseName: string;
    sets: { reps?: number; weight?: number; durationSec?: number; completed?: boolean }[];
  }[];
}

export function useCompleteWorkoutSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, exercises }: CompleteSessionInput) =>
      api.post(`/api/workouts/${sessionId}/complete`, { exercises }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workout-sessions"] }),
  });
}