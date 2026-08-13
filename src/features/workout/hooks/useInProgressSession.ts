import { useEffect, useMemo, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { api } from "@/src/lib/api";
import { localDateOnly } from "@/src/features/progress/lib/localDate";
import { useExerciseLibrary } from "./useExerciseLibrary";
import {
  useWorkoutPlan,
  workoutPlanQueryKey,
  fetchWorkoutPlan,
} from "./useWorkoutPlan";
import {
  adaptLibraryExercise,
  adaptPlanDay,
  imageForMuscleGroup,
} from "@/src/lib/workout-plan-adapter";
import { dayTitleFromMuscleGroups } from "@/src/lib/plan-day-title";
import { getTodaysPlanDayIndex } from "@/src/lib/plan-day-selection";
import type { ExerciseLoggedSet, WorkoutPlan } from "../data/workouts";

type RawSet = ExerciseLoggedSet;

interface RawSession {
  id: string;
  startedAt: string;
  completedAt: string | null;
  notes: string | null;
  /** `id` is WorkoutExercise row id — unique per session row, even if names repeat. */
  exercises: { id: string; exerciseName: string; sets?: unknown }[];
}

export const inProgressSessionQueryKey = ["in-progress-session"] as const;

export function fetchInProgressSessions() {
  return api.get<RawSession[]>("/api/workouts?completed=false&limit=1");
}

/** Cold-start prefetch — call once auth/onboarding is ready so Train/Dashboard
 *  don't open with an unknown in-progress state. */
export function prefetchWorkoutBootQueries(qc: QueryClient) {
  void qc.prefetchQuery({
    queryKey: inProgressSessionQueryKey,
    queryFn: fetchInProgressSessions,
  });
  void qc.prefetchQuery({
    queryKey: workoutPlanQueryKey,
    queryFn: fetchWorkoutPlan,
  });
  void qc.prefetchQuery({
    queryKey: ["exercise-library", "all"],
    queryFn: () => api.get("/api/workouts/exercises"),
  });
}

function normalizeSets(raw: unknown): RawSet[] {
  if (!Array.isArray(raw)) return [];
  const out: RawSet[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const s = item as Record<string, unknown>;
    const next: RawSet = {};
    if (typeof s.reps === "number") next.reps = s.reps;
    if (typeof s.weight === "number") next.weight = s.weight;
    if (typeof s.durationSec === "number") next.durationSec = s.durationSec;
    if (typeof s.completed === "boolean") next.completed = s.completed;
    out.push(next);
  }
  return out;
}

function countCompletedSets(sets: RawSet[]): number {
  return sets.filter((s) => s.completed !== false).length;
}

function estimateMinutes(plan: WorkoutPlan): number {
  const seconds = plan.exercises.reduce((sum, ex) => {
    const work =
      ex.type === "duration" ? (ex.durationSec ?? 0) : (ex.reps ?? 10) * 3;
    return sum + (work + ex.restSec) * ex.sets;
  }, 0);
  return Math.round(seconds / 60);
}

/**
 * POST /:id/complete requires sets.min(1) per exercise. Prefer real
 * incremental-save payloads; only invent a single incomplete placeholder
 * when an exercise row has nothing logged yet so the stale session can
 * still finalize.
 */
function exercisesForAutoComplete(session: RawSession) {
  return session.exercises.map((se) => {
    const sets = normalizeSets(se.sets);
    return {
      exerciseName: se.exerciseName,
      sets: sets.length > 0 ? sets : [{ completed: false as const }],
    };
  });
}

/** Module-scoped — shared across every useInProgressSession mount (Dashboard
 * + Workout) so two hook instances can't double-POST the same stale id. */
const attemptedExpireIds = new Set<string>();
const inFlightExpireIds = new Set<string>();

export function useInProgressSession() {
  const qc = useQueryClient();
  const { data: apiPlan } = useWorkoutPlan();
  const { data: allExercises } = useExerciseLibrary(); // unfiltered — need name lookups across all muscle groups

  const sessionQuery = useQuery({
    queryKey: inProgressSessionQueryKey,
    queryFn: fetchInProgressSessions,
  });

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const session = sessionQuery.data?.[0];
    if (!session || session.completedAt != null) return;
    if (session.exercises.length === 0) return;

    const startedDay = localDateOnly(new Date(session.startedAt));
    const today = localDateOnly();
    if (startedDay === today) return;

    if (
      attemptedExpireIds.has(session.id) ||
      inFlightExpireIds.has(session.id)
    ) {
      return;
    }

    attemptedExpireIds.add(session.id);
    inFlightExpireIds.add(session.id);

    void (async () => {
      try {
        await api.post(`/api/workouts/${session.id}/complete`, {
          exercises: exercisesForAutoComplete(session),
        });
        // Only clear if this stale id is still what's cached — a newer
        // startSession may have replaced it while the POST was in flight.
        qc.setQueryData<RawSession[] | undefined>(
          ["in-progress-session"],
          (old) => {
            if (!old?.length) return old;
            if (old[0]?.id === session.id) return [];
            return old;
          },
        );
        void qc.invalidateQueries({ queryKey: ["in-progress-session"] });
        void qc.invalidateQueries({ queryKey: ["workout-history"] });
        void qc.invalidateQueries({ queryKey: ["workout-sessions"] });
        void qc.invalidateQueries({ queryKey: ["week-overview"] });
      } catch (e) {
        // Allow one retry on the next foreground/focus cycle.
        attemptedExpireIds.delete(session.id);
        console.log("Failed to auto-complete stale in-progress session:", e);
      } finally {
        inFlightExpireIds.delete(session.id);
      }
    })();
  }, [sessionQuery.data, qc]);

  // App foreground: refetch in-progress, and clear attempt guards for ids
  // that aren't mid-POST so a failed expire can retry once per focus.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        next === "active"
      ) {
        for (const id of [...attemptedExpireIds]) {
          if (!inFlightExpireIds.has(id)) {
            attemptedExpireIds.delete(id);
          }
        }
        void qc.invalidateQueries({ queryKey: ["in-progress-session"] });
      }
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, [qc]);

  const result = useMemo(() => {
    const session = sessionQuery.data?.[0];
    if (!session || !allExercises) return null;

    // Past-day incomplete sessions are auto-finalized by the expire
    // effect — never surface them as Continue while that runs.
    if (localDateOnly(new Date(session.startedAt)) !== localDateOnly()) {
      return null;
    }

    const libraryByName = new Map(allExercises.map((ex) => [ex.name, ex]));

    // Reconstruct a WorkoutPlan-shaped object from the session's stored
    // exercise names, using library metadata where the name matches
    // (which it always should, since exercises only ever come from the
    // seeded pool) — falls back to a generic default otherwise.
    // Always stamp WorkoutExercise.id onto the result: adaptLibraryExercise
    // would otherwise use the catalog Exercise.id, so two session rows with
    // the same name (e.g. after a double-add) share one React key.
    const exercises = session.exercises.map((se) => {
      const libEx = libraryByName.get(se.exerciseName);
      const adapted = adaptLibraryExercise(
        libEx ?? {
          id: se.id,
          name: se.exerciseName,
          muscleGroup: "core",
          movementPattern: "carry",
        },
        apiPlan?.goalId ?? "health",
      );
      const loggedSets = normalizeSets(se.sets);
      return {
        ...adapted,
        id: se.id,
        ...(loggedSets.length > 0 ? { loggedSets } : {}),
      };
    });

    // Prefer today's plan-day cover for the continue-card hero; else muscle image.
    let coverImage = "";
    if (apiPlan) {
      const todaysIndex = getTodaysPlanDayIndex(
        apiPlan.daysPerWeek,
        apiPlan.trainingDays,
      );
      if (todaysIndex != null && apiPlan.days[todaysIndex]) {
        coverImage = adaptPlanDay(
          apiPlan.days[todaysIndex],
          apiPlan.goalId,
        ).coverImage;
      }
    }
    if (!coverImage && exercises[0]?.muscleGroup) {
      coverImage = imageForMuscleGroup(exercises[0].muscleGroup);
    }

    const plan: WorkoutPlan = {
      id: session.id,
      // Render-time from session exercises — do NOT use frozen notes
      // ("Upper / Lower — Upper A") which snapshots plan.title at create time.
      title: dayTitleFromMuscleGroups(exercises),
      tag: "In progress",
      coverImage,
      exercises,
    };

    const totalMinutes = estimateMinutes(plan);
    const elapsedMinutes = Math.floor(
      (Date.now() - new Date(session.startedAt).getTime()) / 60000,
    );

    // Real set completion (Stage 1 PATCH / resume hydration) — not wall-clock.
    const totalTargetSets = plan.exercises.reduce((a, e) => a + e.sets, 0);
    const completedSets = session.exercises.reduce((a, se) => {
      return a + countCompletedSets(normalizeSets(se.sets));
    }, 0);
    const percent =
      totalTargetSets > 0
        ? Math.min(100, Math.round((completedSets / totalTargetSets) * 100))
        : 0;
    const minutesLeft = Math.max(0, totalMinutes - elapsedMinutes);
    const estCalories = Math.round(totalMinutes * 8.5);

    return {
      sessionId: session.id,
      plan,
      percent,
      minutesLeft,
      estCalories,
    };
  }, [sessionQuery.data, allExercises, apiPlan]);

  // Unknown until the session query settles — and, if today's incomplete
  // session exists, until the library is ready to build Continue (otherwise
  // callers would treat null as "no session" and flash Start).
  const rawSession = sessionQuery.data?.[0];
  const awaitingTodayContinue =
    !!rawSession &&
    rawSession.completedAt == null &&
    localDateOnly(new Date(rawSession.startedAt)) === localDateOnly() &&
    !allExercises;

  const isLoading =
    sessionQuery.isLoading ||
    (sessionQuery.isFetching && sessionQuery.data === undefined) ||
    awaitingTodayContinue;

  return { inProgress: result, isLoading };
}
