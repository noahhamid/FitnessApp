import { api } from "@/src/lib/api";

export const GEMINI_MODEL = "gemini-2.5-flash";

export type GeminiNutritionProfileInput = {
  weightKg: number | null;
  heightCm: number | null;
  age: number | null;
  goalId: string;
};

export type GeminiNutritionGoals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note?: string;
};

export type GeminiFoodScan = {
  name: string;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export async function requestNutritionGoalsFromGemini(
  profile: GeminiNutritionProfileInput,
): Promise<GeminiNutritionGoals> {
  if (!profile.weightKg && !profile.heightCm && !profile.age) {
    throw new Error("Profile data incomplete");
  }

  return api.post<GeminiNutritionGoals>("/api/ai/nutrition-goals", {
    weightKg: profile.weightKg ?? 0,
    heightCm: profile.heightCm ?? 0,
    age: profile.age ?? 0,
    goalId: profile.goalId,
  });
}

export function requestFoodScanFromImage(
  base64: string,
  mimeType: string,
): Promise<GeminiFoodScan> {
  return api.post<GeminiFoodScan>("/api/ai/food-scan", { base64, mimeType });
}
