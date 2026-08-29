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
  imageForExercise,
} from "@/src/lib/workout-plan-adapter";
import { dayTitleFromMuscleGroups } from "@/src/lib/plan-day-title";
import { getTodaysPlanDayIndex } from "@/src/lib/plan-day-selection";
import type { ExerciseLoggedSet, WorkoutPlan } from "../data/workouts";
import { CONDITIONING_SESSION_NOTES } from "../services/conditioning-run.service";
import { useUserProfile } from "@/src/features/profile/hooks/useUserProfile";

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

const STALE_CARDIO_MS = 15_000;

export async function fetchInProgressSessions() {
  const sessions = await api.get<RawSession[]>(
    "/api/workouts?completed=false&limit=10",
  );
  const lifting: RawSession[] = [];
  for (const session of sessions) {
    if (session.notes === CONDITIONING_SESSION_NOTES) {
      const age = Date.now() - new Date(session.startedAt).getTime();
      if (age > STALE_CARDIO_MS) {
        void api.delete(`/api/workouts/${session.id}`).catch(() => {});
      }
      continue;
    }
    lifting.push(session);
  }
  return lifting;
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

/** Module-scoped — shared across every useInProgressSession mount (Dashboard
 * + Workout) so two hook instances can't double-DELETE the same stale id. */
const attemptedExpireIds = new Set<string>();
const inFlightExpireIds = new Set<string>();

export function useInProgressSession() {
  const qc = useQueryClient();
  const { data: apiPlan } = useWorkoutPlan();
  const { data: profile } = useUserProfile();
  const { data: allExercises } = useExerciseLibrary(); // unfiltered — need name lookups across all muscle groups

  const sessionQuery = useQuery({
    queryKey: inProgressSessionQueryKey,
    queryFn: fetchInProgressSessions,
  });

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Past-day incomplete sessions are abandoned — delete them. Never POST
  // /complete (that counted abandoned work as finished for streaks).
  useEffect(() => {
    const session = sessionQuery.data?.[0];
    if (!session || session.completedAt != null) return;

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
        await api.delete(`/api/workouts/${session.id}`);
        qc.setQueryData<RawSession[] | undefined>(
          ["in-progress-session"],
          (old) => {
            if (!old?.length) return old;
            if (old[0]?.id === session.id) return [];
            return old.filter((s) => s.id !== session.id);
          },
        );
        void qc.invalidateQueries({ queryKey: ["in-progress-session"] });
      } catch {
        // Allow one retry after the next failed-guard clear (foreground).
        attemptedExpireIds.delete(session.id);
      } finally {
        inFlightExpireIds.delete(session.id);
      }
    })();
  }, [sessionQuery.data, qc]);

  // App foreground: refetch in-progress. Only re-arm expire for sessions
  // that are still present and not mid-delete (failed deletes already clear
  // their own attempt id in catch).
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        next === "active"
      ) {
        void qc.invalidateQueries({ queryKey: ["in-progress-session"] });
      }
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, [qc]);

  const result = useMemo(() => {
    const session = sessionQuery.data?.[0];
    if (!session || !allExercises) return null;

    // Past-day incomplete sessions are deleted by the expire effect —
    // never surface them as Continue while that runs.
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
        profile?.gender,
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
          profile?.gender,
        ).coverImage;
      }
    }
    if (!coverImage && exercises[0]?.name) {
      coverImage = imageForExercise(exercises[0].name, profile?.gender);
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
      startedAt: session.startedAt,
      plan,
      percent,
      minutesLeft,
      estCalories,
    };
  }, [sessionQuery.data, allExercises, apiPlan, profile?.gender]);

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
