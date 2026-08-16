// src/features/nutrition/types/nutrition.types.ts

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export type NutritionGoals = {
  id: string;
  user_id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  bmr: number;
  tdee: number;
  updated_at: string;
};
export type FoodScanResult = {
  name: string;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type WeeklyTrendDay = {
  date: string;
  label: string;
  pct: number;
  isToday: boolean;
};

export type WeeklyTrend = {
  days: WeeklyTrendDay[];
  streak: number;
};

export type MealLogEntry = {
  id: string;
  user_id: string;
  logged_at: string;
  log_date: string;
  meal: MealType;
  name: string;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
  image_url: string | null;   // NEW
  source: "manual" | "scan";  // NEW
};

export type NutritionSuggestion = {
  headline: string;
  body: string;
  suggestions: {
    label: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
};

/** Local food catalog item (seed + device AsyncStorage custom foods). */
export type FoodLibraryItem = {
  id: string;
  user_id: string | null;
  name: string;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: number | null;
  serving_unit: string | null;
  barcode: string | null;
  created_at: string;
};

export type DailyTotals = {
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
};
