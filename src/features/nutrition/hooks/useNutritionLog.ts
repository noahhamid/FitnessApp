import { useState } from "react";
import { MEAL_LOG } from "@/src/features/nutrition/services/nutrition.service";

export function useNutritionLog() {
  const [meals] = useState(MEAL_LOG);
  return { meals };
}
