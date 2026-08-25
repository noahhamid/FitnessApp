import type { MealType } from "../types/nutrition.types";

const MEAL_SLOTS: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

export function firstRouteParam(
  value?: string | string[],
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function mealSlotFromParam(
  value?: string | string[],
  fallback: MealType = "Breakfast",
): MealType {
  const raw = firstRouteParam(value);
  return MEAL_SLOTS.includes(raw as MealType) ? (raw as MealType) : fallback;
}
