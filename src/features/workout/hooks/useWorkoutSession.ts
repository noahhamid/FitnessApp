import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { api } from "@/src/lib/api";
import { cancelReminder } from "@/src/lib/meal-workout-reminders";

interface StartSessionInput {
  notes?: string;
  // New — lets the backend create the session and all its exercises in
  // one request instead of the caller looping N addExercise calls after.
  exercises?: { exerciseName: string }[];
}

interface StartSessionExercise {
  id: string;
  exerciseName: string;
  sets: unknown;
}

interface StartSessionResponse {
  id: string;
  startedAt?: string;
  completedAt?: string | null;
  notes?: string | null;
  exercises?: StartSessionExercise[];
}

export type SessionSetPayload = {
  reps?: number;
  weight?: number;
  durationSec?: number;
  completed?: boolean;
};

/** Queries that mirror live / recently-changed session state. */
function invalidateSessionQueries(qc: QueryClient) {
  // ContinueWorkoutCard + resume rebuild from this exact key
  // (see useInProgressSession).
  void qc.invalidateQueries({ queryKey: ["in-progress-session"] });
  // Prefix match — covers ProgressScreen's
  // ["workout-sessions", "recent-for-progress"] and any future list keys.
  void qc.invalidateQueries({ queryKey: ["workout-sessions"] });
  // Dashboard "completed" + Train "today done" both read history.
  void qc.invalidateQueries({ queryKey: ["workout-history"] });
  void qc.invalidateQueries({ queryKey: ["personal-records"] });
}

/** Drop stale continue-card data immediately so Today doesn't flash the old card. */
function clearInProgressCache(qc: QueryClient) {
  qc.setQueryData(["in-progress-session"], []);
}

export function useStartWorkoutSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StartSessionInput) =>
      api.post<StartSessionResponse>("/api/workouts", input),
    onSuccess: (session, input) => {
      // Seed cache with real WorkoutExercise ids from the create response.
      qc.setQueryData(
        ["in-progress-session"],
        [
          {
            id: session.id,
            startedAt: session.startedAt ?? new Date().toISOString(),
            completedAt: null,
            notes: session.notes ?? input.notes ?? null,
            exercises: (session.exercises ?? []).map((ex) => ({
              id: ex.id,
              exerciseName: ex.exerciseName,
            })),
          },
        ],
      );
      invalidateSessionQueries(qc);
    },
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
      api.post<{ id: string; exerciseName: string; sets: unknown }>(
        `/api/workouts/${sessionId}/exercises`,
        {
          exerciseName,
          sets: [],
        },
      ),
    // Without this, the exercise is saved on the backend but
    // ContinueWorkoutCard / Resume keep showing the pre-add list from
    // the stale ["in-progress-session"] cache.
    onSuccess: () => invalidateSessionQueries(qc),
  });
}

/**
 * Incremental mid-workout set sync. Fire-and-forget — does NOT invalidate
 * queries (Finish's POST /complete remains the authoritative final write).
 * Still patches the in-progress cache so leave → Resume / Continue card see
 * the latest sets without a round-trip race.
 */
export function useUpdateSessionExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      exerciseId,
      sets,
    }: {
      sessionId: string;
      exerciseId: string;
      sets: SessionSetPayload[];
    }) =>
      api.patch<{ id: string }>(
        `/api/workouts/${sessionId}/exercises/${exerciseId}`,
        { sets },
      ),
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    onSuccess: (_data, { sessionId, exerciseId, sets }) => {
      qc.setQueryData<
        | {
            id: string;
            startedAt: string;
            completedAt: string | null;
            notes: string | null;
            exercises: {
              id: string;
              exerciseName: string;
              sets?: unknown;
            }[];
          }[]
        | undefined
      >(["in-progress-session"], (old) => {
        if (!old?.length) return old;
        const session = old[0];
        if (session.id !== sessionId) return old;
        return [
          {
            ...session,
            exercises: (session.exercises ?? []).map((ex) =>
              ex.id === exerciseId ? { ...ex, sets } : ex,
            ),
          },
          ...old.slice(1),
        ];
      });
    },
  });
}

interface CompleteSessionInput {
  sessionId: string;
  exercises: {
    exerciseName: string;
    sets: SessionSetPayload[];
  }[];
}

export function useCompleteWorkoutSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, exercises }: CompleteSessionInput) =>
      api.post(`/api/workouts/${sessionId}/complete`, { exercises }),
    onSuccess: () => {
      clearInProgressCache(qc);
      invalidateSessionQueries(qc);
      // Drop today's workout reminder immediately after finish.
      void cancelReminder("workout");
    },
  });
}

export function useDeleteWorkoutSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) =>
      api.delete<{ deleted: boolean }>(`/api/workouts/${sessionId}`),
    onSuccess: () => {
      clearInProgressCache(qc);
      invalidateSessionQueries(qc);
    },
  });
}
