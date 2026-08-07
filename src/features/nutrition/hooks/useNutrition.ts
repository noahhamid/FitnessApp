// src/features/nutrition/hooks/useNutrition.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
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
  deleteMealEntry,
  fetchDailyTotals,
  fetchMealLog,
  fetchMealLogRange,
  fetchNutritionGoals,
  fetchSuggestion,
  fetchWater,
  fetchWeeklyTrend,
  upsertNutritionGoals,
  applyAdaptiveSuggestion,
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
      // Drop the matching local reminder so a logged meal never nags.
      void cancelReminder(mealTypeToSlot(vars.meal), vars.log_date);
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
    }, [date]),
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === "active") {
        qc.invalidateQueries({ queryKey: KEYS.water(date) });
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [date]);
}

export function useAdjustWater(date = today()) {
  const qc = useQueryClient();
  const pendingDelta = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mutationKey = ["adjustWater", date];

  const mutation = useMutation({
    mutationKey,
    mutationFn: (delta: number) => adjustWater(delta, date),

    onSuccess: (data) => {
      // Only let the most recently *sent* batch write the server's
      // authoritative value. If an earlier batch's response arrives
      // late (out of order), a newer batch is still in flight —
      // isMutating will be > 1 — so we skip writing this stale one.
      const stillMutating = qc.isMutating({ mutationKey });
      if (stillMutating === 1) {
        qc.setQueryData(KEYS.water(date), data);
      }
    },

    onError: (_err, sentDelta) => {
      qc.setQueryData<{ glasses: number }>(KEYS.water(date), (old) => ({
        glasses: Math.max(0, (old?.glasses ?? 0) - sentDelta),
      }));
    },
  });

  const add = useCallback(
    (delta: number) => {
      qc.setQueryData<{ glasses: number }>(KEYS.water(date), (old) => ({
        glasses: Math.max(0, (old?.glasses ?? 0) + delta),
      }));

      pendingDelta.current += delta;

      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const toSend = pendingDelta.current;
        pendingDelta.current = 0;
        mutation.mutate(toSend);
      }, 500);
    },
    [date],
  );

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