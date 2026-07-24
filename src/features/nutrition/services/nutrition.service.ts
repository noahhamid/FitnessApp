// src/features/nutrition/services/nutrition.service.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/src/lib/api";
import type {
  DailyTotals,
  FoodLibraryItem,
  FoodScanResult,
  MealLogEntry,
  NutritionGoals,
  NutritionSuggestion,
  WeeklyTrend,
} from "../types/nutrition.types";
import { FOOD_SEARCH_SEED } from "./food-library.seed";

const CUSTOM_FOODS_KEY = "nutrition-custom-foods";

type ApiNutritionGoal = {
  id: string;
  userId: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  updatedAt: string;
};

type ApiMealLog = {
  id: string;
  userId: string;
  logDate: string;
  loggedAt: string;
  meal: MealLogEntry["meal"];
  name: string;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl: string | null;
  source: "manual" | "scan";
};

type ApiWater = { glasses: number };

type ApiWeeklyDay = { date: string; label: string; pct: number; isToday: boolean };
type ApiWeeklyTrend = { days: ApiWeeklyDay[]; streak: number };

/** Default macro targets for dashboard fallbacks. */
export const NUTRITION_GOALS = {
  calories: 2400,
  protein: 180,
  carbs: 280,
  fat: 80,
};

function toNutritionGoals(row: ApiNutritionGoal): NutritionGoals {
  return {
    id: row.id,
    user_id: row.userId,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    updated_at: row.updatedAt,
  };
}

function toMealLogEntry(row: ApiMealLog): MealLogEntry {
  return {
    id: row.id,
    user_id: row.userId,
    logged_at: row.loggedAt,
    log_date: row.logDate,
    meal: row.meal,
    name: row.name,
    cal: row.cal,
    protein: Number(row.protein),
    carbs: Number(row.carbs),
    fat: Number(row.fat),
    quantity: 1,
    unit: "serving",
    image_url: row.imageUrl,
    source: row.source,
  };
}

function toWeeklyTrend(row: ApiWeeklyTrend): WeeklyTrend {
  return {
    days: row.days,
    streak: row.streak,
  };
}

export async function scanFoodImage(
  base64: string,
  mimeType: string,
): Promise<FoodScanResult> {
  return api.post<FoodScanResult>("/api/ai/food-scan", { base64, mimeType });
}

async function readCustomFoods(): Promise<FoodLibraryItem[]> {
  const raw = await AsyncStorage.getItem(CUSTOM_FOODS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as FoodLibraryItem[];
}

async function writeCustomFoods(foods: FoodLibraryItem[]): Promise<void> {
  await AsyncStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(foods));
}
export async function fetchSuggestion(date?: string): Promise<NutritionSuggestion | null> {
  const logDate = date ?? new Date().toISOString().split("T")[0];
  return api.get<NutritionSuggestion | null>(
    `/api/nutrition/suggestions?date=${encodeURIComponent(logDate)}`,
  );
}

export async function fetchNutritionGoals(): Promise<NutritionGoals | null> {
  const row = await api.get<ApiNutritionGoal | null>("/api/nutrition/goals");
  return row ? toNutritionGoals(row) : null;
}

export async function upsertNutritionGoals(
  goals: Partial<Omit<NutritionGoals, "id" | "user_id" | "updated_at">>,
): Promise<NutritionGoals> {
  const row = await api.put<ApiNutritionGoal>("/api/nutrition/goals", {
    calories: goals.calories ?? NUTRITION_GOALS.calories,
    protein: goals.protein ?? NUTRITION_GOALS.protein,
    carbs: goals.carbs ?? NUTRITION_GOALS.carbs,
    fat: goals.fat ?? NUTRITION_GOALS.fat,
  });
  return toNutritionGoals(row);
}

export async function fetchMealLog(date?: string): Promise<MealLogEntry[]> {
  const logDate = date ?? new Date().toISOString().split("T")[0];
  const rows = await api.get<ApiMealLog[]>(
    `/api/nutrition/log?date=${encodeURIComponent(logDate)}`,
  );
  return rows.map(toMealLogEntry);
}

export async function addMealEntry(
  entry: Omit<MealLogEntry, "id" | "user_id" | "logged_at">,
): Promise<MealLogEntry> {
  const row = await api.post<ApiMealLog>("/api/nutrition/log", {
    logDate: entry.log_date,
    meal: entry.meal,
    name: entry.name,
    cal: entry.cal,
    protein: entry.protein,
    carbs: entry.carbs,
    fat: entry.fat,
    imageUrl: entry.image_url ?? undefined,
    source: entry.source ?? "manual",
  });
  return toMealLogEntry(row);
}

export async function deleteMealEntry(id: string): Promise<void> {
  await api.delete<{ deleted: boolean }>(`/api/nutrition/log/${id}`);
}

export async function fetchDailyTotals(date?: string): Promise<DailyTotals> {
  const logDate = date ?? new Date().toISOString().split("T")[0];
  return api.get<DailyTotals>(
    `/api/nutrition/totals?date=${encodeURIComponent(logDate)}`,
  );
}

export async function fetchWater(date?: string): Promise<{ glasses: number }> {
  const logDate = date ?? new Date().toISOString().split("T")[0];
  const row = await api.get<ApiWater>(
    `/api/nutrition/water?date=${encodeURIComponent(logDate)}`,
  );
  return row;
}

export async function adjustWater(
  delta: number,
  date?: string,
): Promise<{ glasses: number }> {
  const row = await api.post<ApiWater>("/api/nutrition/water", {
    delta,
    logDate: date,
  });
  return row;
}

export async function fetchWeeklyTrend(date?: string): Promise<WeeklyTrend> {
  const qs = date ? `?date=${encodeURIComponent(date)}` : "";
  const row = await api.get<ApiWeeklyTrend>(`/api/nutrition/weekly${qs}`);
  return toWeeklyTrend(row);
}

export async function searchFoods(query: string): Promise<FoodLibraryItem[]> {
  if (query.length < 2) return [];

  const customFoods = await readCustomFoods();
  const catalog = [...FOOD_SEARCH_SEED, ...customFoods];

  return catalog.filter((food) =>
    food.name.toLowerCase().includes(query.toLowerCase()),
  );
}

export async function addCustomFood(
  food: Omit<FoodLibraryItem, "id" | "user_id" | "created_at">,
): Promise<FoodLibraryItem> {
  const customFoods = await readCustomFoods();
  const created: FoodLibraryItem = {
    ...food,
    id: `custom-${Date.now()}`,
    user_id: null,
    created_at: new Date().toISOString(),
  };

  await writeCustomFoods([created, ...customFoods]);
  return created;
}

/** Legacy static exports for components not yet on hooks. */
export const MEAL_LOG: MealLogEntry[] = [];
export const FOOD_SEARCH = FOOD_SEARCH_SEED;