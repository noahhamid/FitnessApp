import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SessionSetPayload } from "../hooks/useWorkoutSession";

/** Bump the suffix if this shape changes — old payloads then fail the guard
 *  and get ignored, rather than crashing a resume with stale fields. */
const STORAGE_KEY = "active-workout-v1";

export type StoredWorkoutExercise = {
  /** WorkoutExercise row id — the same id the PATCH endpoint expects. */
  id: string;
  name: string;
  sets: SessionSetPayload[];
};

export type StoredActiveWorkout = {
  sessionId: string;
  startedAt: number;
  savedAt: number;
  exercises: StoredWorkoutExercise[];
};

function isStoredWorkout(value: unknown): value is StoredActiveWorkout {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.sessionId === "string" &&
    typeof v.startedAt === "number" &&
    typeof v.savedAt === "number" &&
    Array.isArray(v.exercises)
  );
}

export async function saveActiveWorkout(
  input: Omit<StoredActiveWorkout, "savedAt">,
): Promise<void> {
  try {
    const payload: StoredActiveWorkout = { ...input, savedAt: Date.now() };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage full or unavailable. The PATCH is still the primary path, so a
    // failed snapshot must never interrupt the workout.
  }
}

export async function loadActiveWorkout(): Promise<StoredActiveWorkout | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredWorkout(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function clearActiveWorkout(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // A leftover snapshot is filtered by sessionId and date on load anyway.
  }
}