import { MEAL_LOG } from "@/src/features/nutrition/services/nutrition.service";
import { useState } from "react";

export function useNutritionLog() {
  const [meals] = useState(MEAL_LOG);
  return { meals };
}
