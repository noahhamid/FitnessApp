// src/features/nutrition/hooks/useNutrition.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useFocusEffect } from "expo-router";
import type {
  DailyTotals,
  MealLogEntry,
  NutritionGoals,
  NutritionSuggestion,
  WeeklyTrend,
} from "../types/nutrition.types";
import {
  addMealEntry,
  adjustWater,
  applyAdaptiveSuggestion,
  deleteMealEntry,
  fetchAdaptiveSuggestion,
  fetchDailyTotals,
  fetchMealLog,
  fetchMealLogRange,
  fetchNutritionGoals,
  fetchSuggestion,
  fetchWater,
  fetchWeeklyTrend,
  updateMealEntry,
  upsertNutritionGoals,
} from "../services/nutrition.service";
import {
  cancelReminder,
  mealTypeToSlot,
} from "@/src/lib/meal-workout-reminders";

const KEYS = {
  goals: ["nutrition", "goals"] as const,
  log: (date: string) => ["nutrition", "log", date] as const,
  logRange: (from: string, to: string) =>
    ["nutrition", "log-range", from, to] as const,
  totals: (date: string) => ["nutrition", "totals", date] as const,
  water: (date: string) => ["nutrition", "water", date] as const,
  weekly: (date: string) => ["nutrition", "weekly", date] as const,
  adaptive: ["nutrition", "adaptive-suggestion"] as const,
};

function today(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

export function useNutritionGoals() {
  return useQuery<NutritionGoals | null>({ queryKey: KEYS.goals, queryFn: fetchNutritionGoals });
}

export function useUpdateGoals() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertNutritionGoals,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.goals }),
  });
}

export function useAdaptiveSuggestion() {
  return useQuery({
    queryKey: KEYS.adaptive,
    queryFn: fetchAdaptiveSuggestion,
  });
}

export function useApplyAdaptiveSuggestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (suggestedCalories: number) =>
      applyAdaptiveSuggestion(suggestedCalories),
    onSuccess: (updated) => {
      qc.setQueryData(KEYS.goals, updated);
      qc.invalidateQueries({ queryKey: KEYS.goals });
      qc.invalidateQueries({ queryKey: KEYS.adaptive });
      qc.invalidateQueries({ queryKey: ["nutrition", "weekly"] });
    },
  });
}

export function useMealLog(date = today()) {
  return useQuery<MealLogEntry[]>({ queryKey: KEYS.log(date), queryFn: () => fetchMealLog(date) });
}

/** Date-range meal logs — mirrors useWorkoutHistory(from, to). */
export function useMealLogRange(from: string, to: string) {
  return useQuery<MealLogEntry[]>({
    queryKey: KEYS.logRange(from, to),
    queryFn: () => fetchMealLogRange(from, to),
    enabled: !!from && !!to,
  });
}

export function useDailyTotals(date = today()) {
  return useQuery<DailyTotals>({ queryKey: KEYS.totals(date), queryFn: () => fetchDailyTotals(date) });
}

export function useAddMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addMealEntry,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: KEYS.log(vars.log_date) });
      qc.invalidateQueries({ queryKey: KEYS.totals(vars.log_date) });
      qc.invalidateQueries({ queryKey: ["nutrition", "weekly"] });
      qc.invalidateQueries({ queryKey: ["nutrition", "log-range"] });
      qc.invalidateQueries({ queryKey: ["week-overview", "meals"] });
      qc.invalidateQueries({ queryKey: ["nutrition", "suggestion"] });
      // Drop the matching local reminder so a logged meal never nags.
      void cancelReminder(mealTypeToSlot(vars.meal), vars.log_date);
    },
  });
}

export function useUpdateMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...entry
    }: { id: string } & Partial<
      Pick<MealLogEntry, "log_date" | "meal" | "name" | "cal" | "protein" | "carbs" | "fat">
    >) => updateMealEntry(id, entry),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: KEYS.log(row.log_date) });
      qc.invalidateQueries({ queryKey: KEYS.totals(row.log_date) });
      qc.invalidateQueries({ queryKey: ["nutrition", "weekly"] });
      qc.invalidateQueries({ queryKey: ["nutrition", "log-range"] });
      qc.invalidateQueries({ queryKey: ["week-overview", "meals"] });
    },
  });
}

export function useDeleteMeal(date = today()) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMealEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.log(date) });
      qc.invalidateQueries({ queryKey: KEYS.totals(date) });
      qc.invalidateQueries({ queryKey: ["nutrition", "weekly"] });
      qc.invalidateQueries({ queryKey: ["nutrition", "log-range"] });
      qc.invalidateQueries({ queryKey: ["week-overview", "meals"] });
      qc.invalidateQueries({ queryKey: ["nutrition", "suggestion"] });
    },
  });
}

export function useWater(date = today()) {
  return useQuery<{ glasses: number }>({ queryKey: KEYS.water(date), queryFn: () => fetchWater(date) });
}

export function useWaterResync(date: string) {
  const qc = useQueryClient();
  const appState = useRef(AppState.currentState);

  useFocusEffect(
    useCallback(() => {
      qc.invalidateQueries({ queryKey: KEYS.water(date) });
    }, [date, qc]),
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === "active") {
        qc.invalidateQueries({ queryKey: KEYS.water(date) });
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [date, qc]);
}

export function useAdjustWater(date = today(), maxGlasses = 8) {
  const qc = useQueryClient();
  const pendingDelta = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mutationKey = ["adjustWater", date];

  const mutation = useMutation({
    mutationKey,
    mutationFn: (delta: number) => adjustWater(delta, date),

    onSuccess: (data) => {
      // Never clobber UI with a stale server total while more taps are
      // still queued (debounce) or another batch is in flight.
      const inFlight = qc.isMutating({ mutationKey });
      if (inFlight > 1) return;
      if (pendingDelta.current !== 0 || timer.current != null) {
        const merged = Math.max(
          0,
          Math.min(
            maxGlasses,
            (data.glasses ?? 0) + pendingDelta.current,
          ),
        );
        qc.setQueryData(KEYS.water(date), { ...data, glasses: merged });
        return;
      }
      const glasses = Math.max(
        0,
        Math.min(maxGlasses, data.glasses ?? 0),
      );
      qc.setQueryData(KEYS.water(date), { ...data, glasses });
    },

    onError: (_err, sentDelta) => {
      qc.setQueryData<{ glasses: number }>(KEYS.water(date), (old) => ({
        glasses: Math.max(
          0,
          Math.min(maxGlasses, (old?.glasses ?? 0) - sentDelta),
        ),
      }));
    },
  });

  const add = useCallback(
    (delta: number) => {
      const current =
        qc.getQueryData<{ glasses: number }>(KEYS.water(date))?.glasses ?? 0;
      const next = Math.max(0, Math.min(maxGlasses, current + delta));
      const applied = next - current;
      if (applied === 0) return;

      qc.setQueryData(KEYS.water(date), { glasses: next });
      pendingDelta.current += applied;

      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const toSend = pendingDelta.current;
        pendingDelta.current = 0;
        timer.current = null;
        if (toSend !== 0) mutation.mutate(toSend);
      }, 450);
    },
    [date, maxGlasses, mutation, qc],
  );

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      const leftover = pendingDelta.current;
      pendingDelta.current = 0;
      if (leftover !== 0) {
        void adjustWater(leftover, date).catch(() => undefined);
      }
    };
  }, [date]);

  return { ...mutation, mutate: add };
}

export function useSuggestion(date = today()) {
  return useQuery<NutritionSuggestion | null>({
    queryKey: ["nutrition", "suggestion", date],
    queryFn: () => fetchSuggestion(date),
  });
}

export function useWeeklyTrend(date = today()) {
  return useQuery<WeeklyTrend>({ queryKey: KEYS.weekly(date), queryFn: () => fetchWeeklyTrend(date) });
}