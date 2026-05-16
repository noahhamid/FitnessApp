// src/features/nutrition/services/nutrition.service.ts
import { supabase } from "@/src/lib/supabase";
import type {
  DailyTotals,
  FoodLibraryItem,
  MealLogEntry,
  NutritionGoals,
} from "../types/nutrition.types";

// ─── Goals ────────────────────────────────────────────────────────────────────

export async function fetchNutritionGoals(): Promise<NutritionGoals | null> {
  const { data, error } = await supabase
    .from("nutrition_goals")
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function upsertNutritionGoals(
  goals: Partial<Omit<NutritionGoals, "id" | "user_id" | "updated_at">>,
): Promise<NutritionGoals> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("nutrition_goals")
    .upsert({
      ...goals,
      user_id: user!.id,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Meal log ─────────────────────────────────────────────────────────────────

export async function fetchMealLog(date?: string): Promise<MealLogEntry[]> {
  const logDate = date ?? new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("meal_log")
    .select("*")
    .eq("log_date", logDate)
    .order("logged_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addMealEntry(
  entry: Omit<MealLogEntry, "id" | "user_id" | "logged_at">,
): Promise<MealLogEntry> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("meal_log")
    .insert({ ...entry, user_id: user!.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMealEntry(id: string): Promise<void> {
  const { error } = await supabase.from("meal_log").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchDailyTotals(date?: string): Promise<DailyTotals> {
  const logDate = date ?? new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("meal_log")
    .select("cal, protein, carbs, fat")
    .eq("log_date", logDate);
  if (error) throw error;
  return (data ?? []).reduce(
    (acc, row) => ({
      cal: acc.cal + row.cal,
      protein: acc.protein + Number(row.protein),
      carbs: acc.carbs + Number(row.carbs),
      fat: acc.fat + Number(row.fat),
    }),
    { cal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

// ─── Food library ─────────────────────────────────────────────────────────────

export async function searchFoods(query: string): Promise<FoodLibraryItem[]> {
  const { data, error } = await supabase
    .from("food_library")
    .select("*")
    .ilike("name", `%${query}%`)
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function addCustomFood(
  food: Omit<FoodLibraryItem, "id" | "user_id" | "created_at">,
): Promise<FoodLibraryItem> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("food_library")
    .insert({ ...food, user_id: user!.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}
