import { Hono } from "hono";
import { z } from "zod";
import { err, ok } from "../lib/response";
import { parseJson } from "../lib/validate";
import { requireAuth } from "../middleware/requireAuth";
import type { AppEnv } from "../types/hono";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const nutritionGoalsSchema = z.object({
  weightKg: z.number().nonnegative(),
  heightCm: z.number().int().nonnegative(),
  age: z.number().int().nonnegative(),
  goalId: z.string().trim().min(1),
});

const foodScanSchema = z.object({
  base64: z.string().trim().min(1),
  mimeType: z
    .string()
    .trim()
    .regex(/^image\/[a-z0-9.+-]+$/i, "mimeType must be image/*"),
});

type GeminiPayload = {
  error?: { message?: string };
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

type NutritionGoalsResponse = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note?: string;
};

type FoodScanResponse = {
  name: string;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
};

const NUTRITION_PROMPT_TEMPLATE = `You are a nutrition expert. Calculate daily macro targets for this user.
Weight: {{weightKg}}kg, Height: {{heightCm}}cm, Age: {{age}}, Goal: {{goalId}}
Goal meanings: "lose" = fat loss, "build" = muscle gain, "endure" = endurance athlete, "health" = general health.
Respond ONLY with this exact JSON structure and nothing else:
{"calories": 2000, "protein": 150, "carbs": 200, "fat": 65, "note": "One sentence explanation here"}
Replace the numbers with your calculated values. No markdown, no code blocks, just the raw JSON.`;

const FOOD_SCAN_PROMPT = `Identify the food in this image. Respond with ONLY this JSON, no other text:
{"name":"food name","cal":000,"protein":00,"carbs":00,"fat":00}
Use realistic nutrition values. Integers only.`;

const ALLOWED_GOALS = new Set(["lose", "build", "endure", "health"]);

function coerceMetric(
  value: number,
  min: number,
  max: number,
  fallback: number,
): number {
  if (!Number.isFinite(value)) return fallback;
  if (value < min || value > max) return fallback;
  return value;
}

function sanitizeNutritionInput(input: z.infer<typeof nutritionGoalsSchema>) {
  return {
    weightKg: Math.round(coerceMetric(input.weightKg, 30, 300, 70)),
    heightCm: Math.round(coerceMetric(input.heightCm, 120, 230, 170)),
    age: Math.round(coerceMetric(input.age, 13, 100, 30)),
    goalId: ALLOWED_GOALS.has(input.goalId) ? input.goalId : "health",
  };
}

function buildNutritionPrompt(input: z.infer<typeof nutritionGoalsSchema>): string {
  const safeInput = sanitizeNutritionInput(input);
  return NUTRITION_PROMPT_TEMPLATE.replace("{{weightKg}}", String(safeInput.weightKg))
    .replace("{{heightCm}}", String(safeInput.heightCm))
    .replace("{{age}}", String(safeInput.age))
    .replace("{{goalId}}", safeInput.goalId);
}

type GeminiGenerationConfig = {
  temperature: number;
  topP: number;
  maxOutputTokens: number;
};

async function requestGemini(
  parts: Array<Record<string, unknown>>,
  config?: GeminiGenerationConfig,
): Promise<GeminiPayload> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const url = `${GEMINI_ENDPOINT}?key=${encodeURIComponent(key)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      ...(config ? { generationConfig: config } : {}),
    }),
  });

  const payload = (await response.json()) as GeminiPayload;
  if (!response.ok) {
    console.error(
      "Gemini error:",
      payload.error?.message,
      "status:",
      response.status,
    );
    throw new Error(payload.error?.message ?? `Gemini request failed (${response.status})`);
  }

  return payload;
}

function extractCandidateText(payload: GeminiPayload): string | null {
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || typeof text !== "string") {
    return null;
  }
  return text;
}

function parseNutritionGoals(raw: string): NutritionGoalsResponse | null {
  try {
    let text = raw.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/u, "").trim();
    }

    const parsed = JSON.parse(text) as Record<string, unknown>;
    const calories = Number(parsed.calories);
    const protein = Number(parsed.protein);
    const carbs = Number(parsed.carbs);
    const fat = Number(parsed.fat);
    const note = typeof parsed.note === "string" ? parsed.note.trim() : "";

    if (
      !Number.isFinite(calories) ||
      !Number.isFinite(protein) ||
      !Number.isFinite(carbs) ||
      !Number.isFinite(fat)
    ) {
      return null;
    }

    return {
      calories: Math.max(0, Math.round(calories)),
      protein: Math.max(0, Math.round(protein)),
      carbs: Math.max(0, Math.round(carbs)),
      fat: Math.max(0, Math.round(fat)),
      note: note || undefined,
    };
  } catch {
    return null;
  }
}

function parseFoodScan(raw: string): FoodScanResponse | null {
  try {
    let text = raw.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/u, "").trim();
    }
    if (!text.endsWith("}")) {
      const lastComma = text.lastIndexOf(",");
      const lastBrace = text.lastIndexOf("{");
      text = text.substring(0, Math.max(lastComma, lastBrace + 1));
      if (!text.endsWith("}")) text += "}";
    }

    const parsed = JSON.parse(text) as Record<string, unknown>;
    const name = typeof parsed.name === "string" ? parsed.name.trim() : "";
    const cal = Number(parsed.cal);
    const protein = Number(parsed.protein);
    const carbs = Number(parsed.carbs);
    const fat = Number(parsed.fat);

    if (!name || !Number.isFinite(cal) || cal < 0) {
      return null;
    }

    return {
      name,
      cal,
      protein: Number.isFinite(protein) ? protein : 0,
      carbs: Number.isFinite(carbs) ? carbs : 0,
      fat: Number.isFinite(fat) ? fat : 0,
    };
  } catch {
    return null;
  }
}

export const aiRouter = new Hono<AppEnv>().use("*", requireAuth);

// POST /api/ai/nutrition-goals
// Body: { weightKg: number, heightCm: number, age: number, goalId: string }
// Response: { calories, protein, carbs, fat, note }
aiRouter.post("/nutrition-goals", async (c) => {
  const parsedBody = await parseJson(c, nutritionGoalsSchema);
  if (!parsedBody.success) return parsedBody.response;

  try {
    const payload = await requestGemini(
      [{ text: buildNutritionPrompt(parsedBody.data) }],
      { temperature: 0.2, topP: 0.9, maxOutputTokens: 512 },
    );
    const text = extractCandidateText(payload);
    if (!text) {
      throw new Error("No nutrition output from Gemini");
    }

    const nutrition = parseNutritionGoals(text);
    if (!nutrition) {
      throw new Error("Invalid nutrition JSON from Gemini");
    }

    return ok(c, nutrition);
  } catch {
    return err(c, "AI unavailable", 500);
  }
});

// POST /api/ai/food-scan
// Body: { base64: string, mimeType: string }
// Response: { name, cal, protein, carbs, fat }
aiRouter.post("/food-scan", async (c) => {
  const parsedBody = await parseJson(c, foodScanSchema);
  if (!parsedBody.success) return parsedBody.response;

  try {
    const payload = await requestGemini(
      [
        { text: FOOD_SCAN_PROMPT },
        {
          inline_data: {
            mime_type: parsedBody.data.mimeType,
            data: parsedBody.data.base64,
          },
        },
      ],
      { temperature: 0.1, topP: 0.8, maxOutputTokens: 1024 },
    );

    const text = extractCandidateText(payload);
    console.log("FOOD SCAN GEMINI TEXT:", text);
    if (!text) {
      return err(c, "Unable to parse image", 400);
    }

    const food = parseFoodScan(text);
    console.log("FOOD SCAN PARSED:", food);
    if (!food) {
      console.log("FOOD SCAN RAW TEXT THAT FAILED:", text);
      return err(c, "Unable to parse image", 400);
    }

    return ok(c, food);
  } catch {
    return err(c, "AI unavailable", 500);
  }
});
