import { useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { useAddExerciseToSession } from "./useWorkoutSession";
import { useWorkoutPlan } from "./useWorkoutPlan";
import { adaptLibraryExercise } from "@/src/lib/workout-plan-adapter";
import type { Exercise } from "../data/workouts";

export type LiveAddLibraryExercise = {
  id: string;
  name: string;
  muscleGroup: string;
  movementPattern: string;
};

type AddOptions = {
  /** Skip if this name is already in the destination session. */
  alreadyAdded?: Set<string>;
  /**
   * Optional optimistic UI update (ActiveWorkoutScreen's live list).
   * Called with the adapted Exercise *before* the network request.
   * Today-screen callers omit this — ContinueWorkoutCard refreshes via
   * ["in-progress-session"] invalidation on mutate success.
   */
  onOptimistic?: (exercise: Exercise) => void;
  /** Undo onOptimistic if the POST fails. */
  onRollback?: (optimisticId: string) => void;
  /**
   * Swap the optimistic client id for the real WorkoutExercise row id
   * so mid-workout set PATCH can target the correct row.
   */
  onCommitted?: (optimisticId: string, realExerciseId: string) => void;
  /** Extra side effects after a successful optimistic append (e.g. close modal). */
  onAfterOptimistic?: () => void;
  /** Extra side effects when the POST fails after a rollback (e.g. reopen modal). */
  onAfterError?: () => void;
};

/**
 * Single path for adding a library exercise to a live in-progress session.
 * Callers supply sessionId — ActiveWorkoutScreen passes its prop;
 * WorkoutScreen Today passes inProgress.sessionId from useInProgressSession.
 *
 * Wraps useAddExerciseToSession (which invalidates ["in-progress-session"]
 * on success), so ContinueWorkoutCard / Resume stay in sync from any call site.
 */
export function useAddToLiveSession(sessionId: string | null | undefined) {
  const addToSession = useAddExerciseToSession();
  const { data: apiPlan } = useWorkoutPlan();
  const [addingName, setAddingName] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  // Synchronous guard — React state (`addingName`) only updates after
  // re-render, so two handlers in the same tap (nested Pressables) or a
  // rapid double-tap both see addingName === null. A ref flips immediately.
  const inFlightRef = useRef(false);

  const addExercise = async (
    libEx: LiveAddLibraryExercise,
    opts: AddOptions = {},
  ): Promise<boolean> => {
    if (!sessionId) {
      setAddError("No active workout session");
      return false;
    }
    if (opts.alreadyAdded?.has(libEx.name)) return false;
    if (inFlightRef.current || addingName) return false;

    inFlightRef.current = true;
    setAddingName(libEx.name);
    setAddError(null);

    const adapted = adaptLibraryExercise(
      libEx,
      apiPlan?.goalId ?? "health",
    );
    const optimistic: Exercise = {
      ...adapted,
      id: `live-${libEx.id}-${Date.now()}`,
    };

    opts.onOptimistic?.(optimistic);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    opts.onAfterOptimistic?.();

    try {
      const created = await addToSession.mutateAsync({
        sessionId,
        exerciseName: libEx.name,
      });
      opts.onCommitted?.(optimistic.id, created.id);
      return true;
    } catch (e) {
      opts.onRollback?.(optimistic.id);
      setAddError(
        e instanceof Error ? e.message : "Couldn't add exercise — try again",
      );
      opts.onAfterError?.();
      return false;
    } finally {
      inFlightRef.current = false;
      setAddingName(null);
    }
  };

  return {
    addExercise,
    addingName,
    addError,
    isPending: addToSession.isPending || addingName !== null,
  };
}
