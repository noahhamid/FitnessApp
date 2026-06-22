import { api } from "@/src/lib/api";

export const GEMINI_MODEL = "gemini-2.5-flash";

export type GeminiFoodScan = {
  name: string;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export function requestFoodScanFromImage(
  base64: string,
  mimeType: string,
): Promise<GeminiFoodScan> {
  return api.post<GeminiFoodScan>("/api/ai/food-scan", { base64, mimeType });
}
