// src/features/nutrition/hooks/useNutrition.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DailyTotals,
  FoodLibraryItem,
  MealLogEntry,
  NutritionGoals,
} from "../types/nutrition.types";
import {
  addMealEntry,
  deleteMealEntry,
  fetchDailyTotals,
  fetchMealLog,
  fetchNutritionGoals,
  searchFoods,
  upsertNutritionGoals,
} from "../services/nutrition.service";

const KEYS = {
  goals: ["nutrition", "goals"] as const,
  log: (date: string) => ["nutrition", "log", date] as const,
  totals: (date: string) => ["nutrition", "totals", date] as const,
  search: (q: string) => ["nutrition", "search", q] as const,
};

/** Calendar day in device local TZ (aligned with workout logs). */
function today(): string {
  const n = new Date();
  const y = n.getFullYear();
  const m = String(n.getMonth() + 1).padStart(2, "0");
  const d = String(n.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function useNutritionGoals() {
  return useQuery<NutritionGoals | null>({
    queryKey: KEYS.goals,
    queryFn: fetchNutritionGoals,
  });
}

export function useUpdateGoals() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertNutritionGoals,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.goals }),
  });
}

export function useMealLog(date = today()) {
  return useQuery<MealLogEntry[]>({
    queryKey: KEYS.log(date),
    queryFn: () => fetchMealLog(date),
  });
}

export function useDailyTotals(date = today()) {
  return useQuery<DailyTotals>({
    queryKey: KEYS.totals(date),
    queryFn: () => fetchDailyTotals(date),
  });
}

export function useAddMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addMealEntry,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: KEYS.log(vars.log_date) });
      qc.invalidateQueries({ queryKey: KEYS.totals(vars.log_date) });
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
    },
  });
}

export function useFoodSearch(query: string) {
  return useQuery<FoodLibraryItem[]>({
    queryKey: KEYS.search(query),
    queryFn: () => searchFoods(query),
    enabled: query.length > 1,
  });
}
