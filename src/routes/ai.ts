import { Hono } from "hono";
import { z } from "zod";
import {
  IMAGE_TOO_LARGE_MESSAGE,
  MAX_IMAGE_BASE64_CHARS,
} from "../lib/image-limits";
import { err, ok } from "../lib/response";
import { consumeUsage, FOOD_SCAN_QUOTA } from "../lib/usage-limit";
import { isParseFail, parseJson } from "../lib/validate";
import { getUser, requireAuth } from "../middleware/requireAuth";
import { requirePremium } from "../middleware/requirePremium";
import type { AppEnv } from "../types/hono";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const foodScanSchema = z.object({
  base64: z
    .string()
    .trim()
    .min(1)
    .max(MAX_IMAGE_BASE64_CHARS, IMAGE_TOO_LARGE_MESSAGE),
  mimeType: z
    .string()
    .trim()
    .regex(/^image\/[a-z0-9.+-]+$/i, "mimeType must be image/*"),
});

type GeminiPayload = {
  error?: { message?: string };
  candidates?: {
    content?: { parts?: { text?: string }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
};

type FoodScanResponse = {
  name: string;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
};

type GeminiGenerationConfig = {
  temperature: number;
  topP: number;
  maxOutputTokens: number;
};

const FOOD_SCAN_PROMPT = `You are an expert nutritionist analyzing a food photo.

Analyze the image and respond with ONLY this JSON object, no other text, no markdown, no code blocks:
{"name":"food name","cal":000,"protein":00,"carbs":00,"fat":00}

Rules:
- name: short descriptive name of the food or meal
- cal: total estimated calories as an integer
- protein, carbs, fat: grams as integers
- Use realistic USDA-based values
- If multiple items are visible, sum everything into one total
- Return ONLY the JSON, nothing else`;

async function requestGemini(
  parts: Record<string, unknown>[],
  config?: GeminiGenerationConfig,
): Promise<GeminiPayload> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Missing GEMINI_API_KEY");
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
    console.error("Gemini error:", payload.error?.message, "status:", response.status);
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

function parseFoodScan(raw: string): FoodScanResponse | null {
  try {
    let text = raw.trim();
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/u, "").trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (match) text = match[0];
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const name = typeof parsed.name === "string" ? parsed.name.trim() : "";
    const cal = Number(parsed.cal);
    const protein = Number(parsed.protein);
    const carbs = Number(parsed.carbs);
    const fat = Number(parsed.fat);
    if (!name || !Number.isFinite(cal) || cal < 0) return null;
    return {
      name,
      cal: Math.round(cal),
      protein: Number.isFinite(protein) ? Math.round(protein) : 0,
      carbs: Number.isFinite(carbs) ? Math.round(carbs) : 0,
      fat: Number.isFinite(fat) ? Math.round(fat) : 0,
    };
  } catch {
    return null;
  }
}

export const aiRouter = new Hono<AppEnv>().use("*", requireAuth);

// POST /api/ai/food-scan
// Body: { base64: string, mimeType: string }
// Response: { name, cal, protein, carbs, fat }
aiRouter.post("/food-scan", requirePremium, async (c) => {
  const user = getUser(c);

  // Fail closed: if the counter is unreachable we can't prove the user is
  // under quota, and each scan past it is a billed Gemini call.
  try {
    const { allowed } = await consumeUsage(FOOD_SCAN_QUOTA, user.id);
    if (!allowed) {
      return err(c, "Too many scans. Try again in an hour.", 429);
    }
  } catch (e) {
    console.error("[food-scan] usage limit check failed:", e);
    return err(c, "Scanning is unavailable right now. Try again shortly.", 503);
  }

  const parsedBody = await parseJson(c, foodScanSchema);
  if (isParseFail(parsedBody)) {
    return parsedBody.response;
  }

  const { base64, mimeType } = parsedBody.data;

  try {
    const payload = await requestGemini(
      [
        { text: FOOD_SCAN_PROMPT },
        { inlineData: { mimeType, data: base64 } },
      ],
      {
        temperature: 0.1,
        topP: 0.8,
        maxOutputTokens: 1024,
      },
    );
    const text = extractCandidateText(payload);
    if (!text) return err(c, "Unable to parse image", 400);
    const food = parseFoodScan(text);
    if (!food) return err(c, "Unable to parse image", 400);
    return ok(c, food);
  } catch (e) {
    console.error("[food-scan] error:", e);
    return err(c, "AI unavailable", 500);
  }
});
