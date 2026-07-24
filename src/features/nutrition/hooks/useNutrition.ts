// src/features/nutrition/hooks/useNutrition.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  fetchNutritionGoals,
  fetchSuggestion,
  fetchWater,
  fetchWeeklyTrend,
  upsertNutritionGoals,
} from "../services/nutrition.service";

const KEYS = {
  goals: ["nutrition", "goals"] as const,
  log: (date: string) => ["nutrition", "log", date] as const,
  totals: (date: string) => ["nutrition", "totals", date] as const,
  water: (date: string) => ["nutrition", "water", date] as const,
  weekly: (date: string) => ["nutrition", "weekly", date] as const,
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

export function useMealLog(date = today()) {
  return useQuery<MealLogEntry[]>({ queryKey: KEYS.log(date), queryFn: () => fetchMealLog(date) });
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
    },
  });
}

export function useWater(date = today()) {
  return useQuery<{ glasses: number }>({ queryKey: KEYS.water(date), queryFn: () => fetchWater(date) });
}

export function useAdjustWater(date = today()) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (delta: number) => adjustWater(delta, date),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.water(date) }),
  });
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