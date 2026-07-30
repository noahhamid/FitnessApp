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
  // keyed by week anchor, not the tapped date — see weekAnchor() below
  weekly: (weekStart: string) => ["nutrition", "weekly", weekStart] as const,
};

function today(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

// Monday of the week containing `dateStr` — the stable anchor for the
// weekly-trend query. Tapping a different day inside the same week must
// NOT refetch or shift the 7-day window; only crossing into a different
// week should. Passing selectedDate straight through (the old behavior)
// meant every tap requested a brand-new rolling window ending on whatever
// day was tapped — hence the blank flash (query briefly undefined) and
// the dates visibly shifting after each tap.
function weekAnchor(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay(); // 0 = Sun ... 6 = Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

// Anchored to the Monday of THIS week (today), never to whichever day is
// tapped. The day-selector should show one stationary week; tapping a day
// only moves the highlight. If the window were anchored to selectedDate,
// tapping a day in a different week (e.g. a few days out) would silently
// swap the entire 7-day view to that other week instead of just
// highlighting a day inside the current one.
export function useWeeklyTrend() {
  const anchor = weekAnchor(today());
  return useQuery<WeeklyTrend>({
    queryKey: KEYS.weekly(anchor),
    queryFn: () => fetchWeeklyTrend(anchor),
  });
}