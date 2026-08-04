import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { api } from "@/src/lib/api";

interface StartSessionInput {
  notes?: string;
  // New — lets the backend create the session and all its exercises in
  // one request instead of the caller looping N addExercise calls after.
  exercises?: { exerciseName: string }[];
}

interface StartSessionResponse {
  id: string;
}

/** Queries that mirror live / recently-changed session state. */
function invalidateSessionQueries(qc: QueryClient) {
  // ContinueWorkoutCard + handle rebuild from this exact key
  // (see useInProgressSession).
  void qc.invalidateQueries({ queryKey: ["in-progress-session"] });
  // Prefix match — covers ProgressScreen's
  // ["workout-sessions", "recent-for-progress"] and any future list keys.
  void qc.invalidateQueries({ queryKey: ["workout-sessions"] });
}

export function useStartWorkoutSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StartSessionInput) =>
      api.post<StartSessionResponse>("/api/workouts", input),
    onSuccess: () => invalidateSessionQueries(qc),
  });
}

export function useAddExerciseToSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      exerciseName,
    }: {
      sessionId: string;
      exerciseName: string;
    }) =>
      api.post(`/api/workouts/${sessionId}/exercises`, {
        exerciseName,
        sets: [],
      }),
    // Without this, the exercise is saved on the backend but
    // ContinueWorkoutCard / Resume keep showing the pre-add list from
    // the stale ["in-progress-session"] cache.
    onSuccess: () => invalidateSessionQueries(qc),
  });
}

interface CompleteSessionInput {
  sessionId: string;
  exercises: {
    exerciseName: string;
    sets: {
      reps?: number;
      weight?: number;
      durationSec?: number;
      completed?: boolean;
    }[];
  }[];
}

export function useCompleteWorkoutSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, exercises }: CompleteSessionInput) =>
      api.post(`/api/workouts/${sessionId}/complete`, { exercises }),
    onSuccess: () => invalidateSessionQueries(qc),
  });
}

export function useDeleteWorkoutSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) =>
      api.delete<{ deleted: boolean }>(`/api/workouts/${sessionId}`),
    onSuccess: () => invalidateSessionQueries(qc),
  });
}