import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/src/lib/api";

export interface TodayExtraExercise {
  id: string;
  exerciseName: string;
  muscleGroup: string;
  movementPattern: string;
}

type ExtraInput = {
  exerciseName: string;
  muscleGroup: string;
  movementPattern: string;
};

/** Device-local calendar date as YYYY-MM-DD — not toISOString(), which is UTC. */
function localDateOnly(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function useTodayExtras() {
  const qc = useQueryClient();
  const localDate = localDateOnly();
  const queryKey = ["today-extras", localDate] as const;
  // Same pattern as useAddToLiveSession: React state / isPending alone is too
  // late for two sync calls in one tap (or a rapid double-tap).
  const addInFlightRef = useRef(false);

  const query = useQuery({
    queryKey,
    queryFn: () =>
      api.get<TodayExtraExercise[]>(
        `/api/workouts/today-extras?date=${localDate}`,
      ),
  });

  const clearAllExtras = useMutation({
    mutationFn: async () => {
      const current =
        qc.getQueryData<TodayExtraExercise[]>(queryKey) ?? [];
      await Promise.all(
        current.map((e) => api.delete(`/api/workouts/today-extras/${e.id}`)),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const addExtraMutation = useMutation({
    mutationFn: (exercise: ExtraInput) =>
      api.post<TodayExtraExercise>("/api/workouts/today-extras", {
        ...exercise,
        date: localDate,
      }),
    // Optimistic — the whole point is that this survives reload, but it
    // should still feel instant on add, same as the old local-state
    // version did. Roll back on failure.
    onMutate: async (exercise) => {
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<TodayExtraExercise[]>(queryKey);

      const optimistic: TodayExtraExercise = {
        id: `optimistic-${exercise.exerciseName}`,
        ...exercise,
      };
      qc.setQueryData<TodayExtraExercise[]>(queryKey, (old) => [
        ...(old ?? []),
        optimistic,
      ]);

      return { previous };
    },
    onError: (_err, _exercise, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      addInFlightRef.current = false;
      void qc.invalidateQueries({ queryKey });
    },
  });

  const addExtra = (exercise: ExtraInput) => {
    if (addInFlightRef.current || addExtraMutation.isPending) return;
    const current = qc.getQueryData<TodayExtraExercise[]>(queryKey) ?? [];
    if (current.some((e) => e.exerciseName === exercise.exerciseName)) return;
    addInFlightRef.current = true;
    addExtraMutation.mutate(exercise);
  };

  const removeExtra = useMutation({
    mutationFn: (extraId: string) =>
      api.delete(`/api/workouts/today-extras/${extraId}`),
    onMutate: async (extraId) => {
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<TodayExtraExercise[]>(queryKey);

      qc.setQueryData<TodayExtraExercise[]>(
        queryKey,
        (old) => old?.filter((e) => e.id !== extraId) ?? [],
      );

      return { previous };
    },
    onError: (_err, _extraId, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });

  return {
    extras: query.data ?? [],
    isLoading: query.isLoading,
    addExtra,
    removeExtra: removeExtra.mutate,
    clearAllExtras: clearAllExtras.mutateAsync,
    isAddingExtra: addExtraMutation.isPending,
  };
}
