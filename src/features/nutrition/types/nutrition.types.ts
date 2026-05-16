// src/features/nutrition/types/nutrition.types.ts

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export type NutritionGoals = {
  id: string;
  user_id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  updated_at: string;
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
};

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
