import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/src/lib/api";

// ── Weight log ──────────────────────────────────────────────────────────────

export interface WeightLogEntry {
  id: string;
  logDate: string; // YYYY-MM-DD
  weight: number; // kg
  userId: string;
}

export function useWeightLog(from?: string, to?: string) {
  return useQuery({
    queryKey: ["weight-log", from ?? "all", to ?? "all"],
    queryFn: () => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const qs = params.toString();
      return api.get<WeightLogEntry[]>(`/api/weight/log${qs ? `?${qs}` : ""}`);
    },
  });
}

export function useAddWeightLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { weight: number; logDate?: string }) =>
      api.post<WeightLogEntry>("/api/weight/log", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weight-log"] }),
  });
}

// ── Weight goal ─────────────────────────────────────────────────────────────

export interface WeightGoalEntry {
  id: string;
  goalWeight: number;
  startWeight: number;
  userId: string;
  updatedAt: string;
}

export function useWeightGoal() {
  return useQuery({
    queryKey: ["weight-goal"],
    queryFn: () => api.get<WeightGoalEntry | null>("/api/weight/goal"),
  });
}

// ── Workout history (for calendar) ──────────────────────────────────────────

export interface WorkoutSessionSummary {
  id: string;
  startedAt: string;
  completedAt: string | null;
  notes: string | null;
  /** `id` is WorkoutExercise row id from the API serializeSession payload. */
  exercises: { id: string; exerciseName: string; sets: unknown }[];
}

export function useWorkoutHistory(from: string, to: string) {
  return useQuery({
    queryKey: ["workout-history", from, to],
    queryFn: () =>
      api.get<WorkoutSessionSummary[]>(
        `/api/workouts?completed=true&from=${from}&to=${to}&limit=100`,
      ),
  });
}

// ── Personal records ─────────────────────────────────────────────────────────

export interface PersonalRecord {
  exerciseName: string;
  heaviestWeight: number;
  repsAtHeaviest: number;
  estimatedOneRepMax: number;
  achievedAt: string;
}

export function usePersonalRecords() {
  return useQuery({
    queryKey: ["personal-records"],
    queryFn: () => api.get<PersonalRecord[]>("/api/workouts/personal-records"),
  });
}

export type ProgressionDirection = "increase" | "maintain" | "no_data";

export interface ProgressionSuggestion {
  exerciseName: string;
  lastWeight: number | null;
  suggestedWeight: number | null;
  direction: ProgressionDirection;
}

export function useProgressionSuggestions() {
  return useQuery({
    queryKey: ["progression"],
    queryFn: () => api.get<ProgressionSuggestion[]>("/api/workouts/progression"),
  });
}