import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Hono } from "hono";
import { z } from "zod";
import { parseLogDate, todayLogDate } from "../lib/dates";
import { prisma } from "../lib/prisma";
import { err, ok } from "../lib/response";
import { parseJson, parseQuery } from "../lib/validate";
import { getUser, requireAuth } from "../middleware/requireAuth";
import type { AppEnv } from "../types/hono";
import { GYM_FOODS } from "../lib/gymFoods";
import {
  ADAPTIVE_WINDOW_DAYS,
  APPLY_SUGGESTION_TOLERANCE_KCAL,
  computeAdaptiveSuggestion,
  type AdaptiveSuggestion,
} from "../lib/adaptive-nutrition";
import {
  macrosForCalorieTarget,
  type GoalId,
} from "../lib/nutrition-calc";
import { publicApiBase } from "../lib/public-api-url";

const mealEnum = z.enum(["Breakfast", "Lunch", "Dinner", "Snack"]);

const goalsSchema = z.object({
  calories: z.number().int().positive(),
  protein: z.number().int().positive(),
  carbs: z.number().int().positive(),
  fat: z.number().int().positive(),
});

const applySuggestionSchema = z.object({
  /** Calorie target the client received from GET /adaptive-suggestion. */
  suggestedCalories: z.number().int().positive(),
});

const waterAdjustSchema = z.object({
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  delta: z.number().int(), // +1 to add a glass, -1 to remove
});

// ?? update mealLogSchema to accept the new fields ??????????????????????????
const mealLogSchema = z.object({
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meal: mealEnum,
  name: z.string().min(1),
  cal: z.number().int().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  imageUrl: z.string().url().optional(),
  source: z.enum(["manual", "scan"]).default("manual"),
});

const mealPhotoSchema = z.object({
  base64: z.string().trim().min(1),
  mimeType: z
    .string()
    .trim()
    .regex(/^image\/(jpeg|jpg|png|webp)$/i, "mimeType must be image/jpeg|png|webp"),
});

const mealLogUpdateSchema = mealLogSchema.partial();

const logDateQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  // Range params mirror GET /api/workouts?from=&to= (additive ? single-day
  // `date` remains the default when neither from nor to is supplied).
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

function serializeMealLog(entry: {
  id: string;
  logDate: Date;
  loggedAt: Date;
  meal: string;
  name: string;
  cal: number;
  protein: { toString(): string };
  carbs: { toString(): string };
  fat: { toString(): string };
  imageUrl: string | null;
  source: string;
  userId: string;
}) {
  return {
    ...entry,
    logDate: entry.logDate.toISOString().slice(0, 10),
    loggedAt: entry.loggedAt.toISOString(),
    protein: Number(entry.protein),
    carbs: Number(entry.carbs),
    fat: Number(entry.fat),
  };
}

export const nutritionRouter = new Hono<AppEnv>().use("*", requireAuth);

nutritionRouter.get("/goals", async (c) => {
  const user = getUser(c);
  const goal = await prisma.nutritionGoal.findUnique({
    where: { userId: user.id },
  });

  return ok(c, goal);
});

nutritionRouter.put("/goals", async (c) => {
  const parsed = await parseJson(c, goalsSchema);
  if (parsed.success === false) return parsed.response;

  const user = getUser(c);
  const goal = await prisma.nutritionGoal.upsert({
    where: { userId: user.id },
    update: parsed.data,
    create: { userId: user.id, ...parsed.data },
  });

  return ok(c, goal);
});

nutritionRouter.delete("/goals", async (c) => {
  const user = getUser(c);

  const existing = await prisma.nutritionGoal.findUnique({
    where: { userId: user.id },
  });
  if (!existing) return err(c, "Nutrition goal not found", 404);

  await prisma.nutritionGoal.delete({ where: { userId: user.id } });
  return ok(c, { deleted: true });
});

nutritionRouter.get("/log", async (c) => {
  const query = parseQuery(c, logDateQuerySchema);
  if (query.success === false) return query.response;

  const user = getUser(c);
  const { from: fromStr, to: toStr, date: dateStr } = query.data;

  // Range mode ? same from/to validation style as workouts listSessions.
  if (fromStr || toStr) {
    const from = fromStr ? parseLogDate(fromStr) : null;
    const to = toStr ? parseLogDate(toStr) : null;
    if (fromStr && !from) return err(c, "Invalid from date format", 400);
    if (toStr && !to) return err(c, "Invalid to date format", 400);

    const meals = await prisma.mealLog.findMany({
      where: {
        userId: user.id,
        logDate: {
          ...(from ? { gte: from } : {}),
          ...(to ? { lte: to } : {}),
        },
      },
      orderBy: [{ logDate: "asc" }, { loggedAt: "asc" }],
    });

    return ok(c, meals.map(serializeMealLog));
  }

  // Single-day mode (unchanged) ? defaults to today when date omitted.
  const singleStr = dateStr ?? todayLogDate();
  const logDate = parseLogDate(singleStr);
  if (!logDate) return err(c, "Invalid date format", 400);

  const meals = await prisma.mealLog.findMany({
    where: { userId: user.id, logDate },
    orderBy: { id: "asc" },
  });

  return ok(c, meals.map(serializeMealLog));
});

/**
 * Persist a meal-scan photo to disk and return a fetchable URL for MealLog.imageUrl.
 * No cloud storage in this app — files live under /uploads/meals and are served
 * statically from the API host (unguessable filenames; GET is public so <Image>
 * can load without auth headers).
 */
nutritionRouter.post("/meal-photo", async (c) => {
  const parsed = await parseJson(c, mealPhotoSchema);
  if (parsed.success === false) return parsed.response;

  const user = getUser(c);
  const mime = parsed.data.mimeType.toLowerCase();
  const ext =
    mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
  const filename = `${user.id.slice(0, 8)}-${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "uploads", "meals");

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(
      path.join(dir, filename),
      Buffer.from(parsed.data.base64, "base64"),
    );
  } catch (e) {
    console.error("[meal-photo] write failed:", e);
    return err(c, "Could not save photo", 500);
  }

  const url = `${publicApiBase()}/uploads/meals/${filename}`;
  return ok(c, { url }, 201);
});

nutritionRouter.post("/log", async (c) => {
  const parsed = await parseJson(c, mealLogSchema);
  if (parsed.success === false) return parsed.response;

  const logDate = parseLogDate(parsed.data.logDate);
  if (!logDate) return err(c, "Invalid logDate", 400);

  const user = getUser(c);
  const entry = await prisma.mealLog.create({
    data: {
      userId: user.id,
      logDate,
      meal: parsed.data.meal,
      name: parsed.data.name,
      cal: parsed.data.cal,
      protein: parsed.data.protein,
      carbs: parsed.data.carbs,
      fat: parsed.data.fat,
      imageUrl: parsed.data.imageUrl,
      source: parsed.data.source,
    },
  });

  return ok(c, serializeMealLog(entry), 201);
});

nutritionRouter.patch("/log/:id", async (c) => {
  const parsed = await parseJson(c, mealLogUpdateSchema);
  if (parsed.success === false) return parsed.response;

  const user = getUser(c);
  const id = c.req.param("id");

  const existing = await prisma.mealLog.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return err(c, "Meal log not found", 404);

  const logDate =
    parsed.data.logDate !== undefined
      ? parseLogDate(parsed.data.logDate)
      : undefined;
  if (parsed.data.logDate !== undefined && !logDate) {
    return err(c, "Invalid logDate", 400);
  }

  const entry = await prisma.mealLog.update({
    where: { id },
    data: {
      ...(parsed.data.meal !== undefined && { meal: parsed.data.meal }),
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.cal !== undefined && { cal: parsed.data.cal }),
      ...(parsed.data.protein !== undefined && {
        protein: parsed.data.protein,
      }),
      ...(parsed.data.carbs !== undefined && { carbs: parsed.data.carbs }),
      ...(parsed.data.fat !== undefined && { fat: parsed.data.fat }),
      ...(logDate && { logDate }),
    },
  });

  return ok(c, serializeMealLog(entry));
});

nutritionRouter.delete("/log/:id", async (c) => {
  const user = getUser(c);
  const id = c.req.param("id");

  const existing = await prisma.mealLog.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return err(c, "Meal log not found", 404);

  await prisma.mealLog.delete({ where: { id } });
  return ok(c, { deleted: true });
});

nutritionRouter.get("/totals", async (c) => {
  const query = parseQuery(c, logDateQuerySchema);
  if (query.success === false) return query.response;

  const dateStr = query.data.date ?? todayLogDate();
  const logDate = parseLogDate(dateStr);
  if (!logDate) return err(c, "Invalid date format", 400);

  const user = getUser(c);
  const result = await prisma.mealLog.aggregate({
    where: { userId: user.id, logDate },
    _sum: { cal: true, protein: true, carbs: true, fat: true },
  });

  return ok(c, {
    cal: result._sum.cal ?? 0,
    protein: Number(result._sum.protein ?? 0),
    carbs: Number(result._sum.carbs ?? 0),
    fat: Number(result._sum.fat ?? 0),
  });

  
});

nutritionRouter.get("/water", async (c) => {
  const query = parseQuery(c, logDateQuerySchema);
  if (query.success === false) return query.response;

  const dateStr = query.data.date ?? todayLogDate();
  const logDate = parseLogDate(dateStr);
  if (!logDate) return err(c, "Invalid date format", 400);

  const user = getUser(c);
  const log = await prisma.waterLog.findUnique({
    where: { userId_logDate: { userId: user.id, logDate } },
  });

  return ok(c, { glasses: log?.glasses ?? 0 });
});

nutritionRouter.post("/water", async (c) => {
  const parsed = await parseJson(c, waterAdjustSchema);
  if (parsed.success === false) return parsed.response;

  const dateStr = parsed.data.logDate ?? todayLogDate();
  const logDate = parseLogDate(dateStr);
  if (!logDate) return err(c, "Invalid logDate", 400);

  const user = getUser(c);
  const existing = await prisma.waterLog.findUnique({
    where: { userId_logDate: { userId: user.id, logDate } },
  });
  const nextGlasses = Math.max(0, (existing?.glasses ?? 0) + parsed.data.delta);

  const log = await prisma.waterLog.upsert({
    where: { userId_logDate: { userId: user.id, logDate } },
    update: { glasses: nextGlasses },
    create: { userId: user.id, logDate, glasses: nextGlasses },
  });

  return ok(c, { glasses: log.glasses });
});

// ?? Weekly trend + streak ???????????????????????????????????????????????
function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

nutritionRouter.get("/weekly", async (c) => {
  const query = parseQuery(c, logDateQuerySchema);
  if (query.success === false) return query.response;

  const endStr = query.data.date ?? todayLogDate();
  const end = parseLogDate(endStr);
  if (!end) return err(c, "Invalid date format", 400);

  const user = getUser(c);
  const goal = await prisma.nutritionGoal.findUnique({ where: { userId: user.id } });
  const calorieGoal = goal?.calories ?? 2000;

  const start = new Date(end);
  start.setDate(start.getDate() - 6);

  const logs = await prisma.mealLog.groupBy({
    by: ["logDate"],
    where: { userId: user.id, logDate: { gte: start, lte: end } },
    _sum: { cal: true },
  });

  const byDate = new Map(logs.map((l) => [isoDate(l.logDate), l._sum.cal ?? 0]));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = isoDate(d);
    const cal = byDate.get(key) ?? 0;
    return {
      date: key,
      label: d.toLocaleDateString("en-US", { weekday: "narrow" }),
      pct: cal === 0 ? 0 : Math.min(100, Math.round((cal / calorieGoal) * 100)),
      isToday: key === endStr,
    };
  });

  // streak: consecutive days with a log, counting back from today
  let streak = 0;
  const cursor = new Date(end);
  while (true) {
    const key = isoDate(cursor);
    const has = byDate.get(key);
    if (!has) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return ok(c, { days, streak });
});

nutritionRouter.get("/suggestions", async (c) => {
  const query = parseQuery(c, logDateQuerySchema);
  if (query.success === false) return query.response;

  const dateStr = query.data.date ?? todayLogDate();
  const logDate = parseLogDate(dateStr);
  if (!logDate) return err(c, "Invalid date format", 400);

  const user = getUser(c);

  const [goal, totalsResult] = await Promise.all([
    prisma.nutritionGoal.findUnique({ where: { userId: user.id } }),
    prisma.mealLog.aggregate({
      where: { userId: user.id, logDate },
      _sum: { cal: true, protein: true, carbs: true, fat: true },
    }),
  ]);

  const calGoal = goal?.calories ?? 2400;
  const proteinGoal = goal?.protein ?? 150;

  const consumedCal = totalsResult._sum.cal ?? 0;
  const consumedProtein = Number(totalsResult._sum.protein ?? 0);

  const remainingCal = Math.max(0, calGoal - consumedCal);
  const remainingProtein = Math.max(0, proteinGoal - consumedProtein);

  if (remainingProtein < 5 || remainingCal < 50) {
    return ok(c, null);
  }

  const buffer = 60;
  let candidates = GYM_FOODS.filter((f) => f.cal <= remainingCal + buffer);
  if (candidates.length === 0) {
    candidates = [...GYM_FOODS].sort((a, b) => a.cal - b.cal).slice(0, 5);
  }

  const ranked = [...candidates].sort((a, b) => b.protein - a.protein);
  const picks = ranked.slice(0, 2);

  const headline = `You've got ${Math.round(remainingProtein)}g of protein left today.`;
  const body =
    picks.length === 2
      ? `${picks[0].name} or ${picks[1].name.toLowerCase()} closes the gap without blowing your calorie budget.`
      : `${picks[0]?.name ?? "A protein-forward meal"} closes the gap without blowing your calorie budget.`;

  return ok(c, {
    headline,
    body,
    suggestions: picks.map((f) => ({ label: f.name, calories: f.cal })),
  });
});

/** Fresh adaptive suggestion for a user ? shared by GET and apply. */
async function freshAdaptiveSuggestion(userId: string): Promise<
  | { ok: false; reason: "missing_profile" | "missing_nutrition_goal" }
  | {
      ok: true;
      suggestion: AdaptiveSuggestion;
      nutritionGoal: {
        id: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        bmr: number;
        tdee: number;
        userId: string;
        updatedAt: Date;
      };
      goalId: GoalId;
      weightKg: number;
      /** Body-composition inputs so recomputed protein can use lean mass. */
      gender: "male" | "female" | undefined;
      age: number | undefined;
      heightCm: number | undefined;
      bodyFatPercent: number | undefined;
    }
> {
  const [profile, nutritionGoal] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.nutritionGoal.findUnique({ where: { userId } }),
  ]);

  if (!profile?.goalId) {
    return { ok: false, reason: "missing_profile" };
  }
  if (!nutritionGoal) {
    return { ok: false, reason: "missing_nutrition_goal" };
  }

  const asOf = todayLogDate();
  const windowStart = parseLogDate(asOf)!;
  windowStart.setUTCDate(
    windowStart.getUTCDate() - (ADAPTIVE_WINDOW_DAYS - 1),
  );

  const logs = await prisma.weightLog.findMany({
    where: {
      userId,
      logDate: { gte: windowStart, lte: parseLogDate(asOf)! },
    },
    orderBy: { logDate: "asc" },
  });

  const suggestion = computeAdaptiveSuggestion({
    entries: logs.map((row) => ({
      logDate: row.logDate.toISOString().slice(0, 10),
      weightKg: Number(row.weight),
    })),
    goalId: profile.goalId,
    currentCalories: nutritionGoal.calories,
    asOf,
  });

  const weightKg =
    profile.weightKg != null
      ? Number(profile.weightKg)
      : suggestion.eligible
        ? suggestion.currentTrendSummary.currentWeightKg
        : 0;

  return {
    ok: true,
    suggestion,
    nutritionGoal,
    goalId: profile.goalId as GoalId,
    weightKg,
    gender: (profile.gender as "male" | "female" | null) ?? undefined,
    age: profile.age ?? undefined,
    heightCm: profile.heightCm ?? undefined,
    bodyFatPercent:
      profile.bodyFatPercent != null
        ? Number(profile.bodyFatPercent)
        : undefined,
  };
}

// Adaptive calorie suggestion (read-only; never mutates NutritionGoal).
nutritionRouter.get("/adaptive-suggestion", async (c) => {
  const user = getUser(c);
  const fresh = await freshAdaptiveSuggestion(user.id);

  if (fresh.ok === false) {
    return ok(c, {
      eligible: false as const,
      reason: fresh.reason,
    });
  }

  return ok(c, fresh.suggestion);
});

/**
 * Accept an adaptive suggestion. Recomputes server-side with fresh weight
 * data; rejects if the client's suggestedCalories no longer matches within
 * APPLY_SUGGESTION_TOLERANCE_KCAL (stale / no longer valid).
 */
nutritionRouter.patch("/goals/apply-suggestion", async (c) => {
  const parsed = await parseJson(c, applySuggestionSchema);
  if (parsed.success === false) return parsed.response;

  const user = getUser(c);
  const clientSuggested = parsed.data.suggestedCalories;

  const fresh = await freshAdaptiveSuggestion(user.id);
  if (fresh.ok === false) {
    return err(
      c,
      fresh.reason === "missing_profile"
        ? "Profile incomplete ? cannot apply suggestion"
        : "Nutrition goal not found",
      400,
    );
  }

  const {
    suggestion,
    nutritionGoal,
    goalId,
    weightKg,
    gender,
    age,
    heightCm,
    bodyFatPercent,
  } = fresh;

  if (suggestion.eligible === false) {
    return err(
      c,
      `Suggestion no longer eligible (${suggestion.reason}). Fetch a fresh adaptive suggestion.`,
      409,
    );
  }

  if (!suggestion.adjustmentNeeded) {
    return err(
      c,
      "No adjustment needed with current weight trend. Fetch a fresh adaptive suggestion.",
      409,
    );
  }

  const drift = Math.abs(suggestion.suggestedCalories - clientSuggested);
  if (drift > APPLY_SUGGESTION_TOLERANCE_KCAL) {
    return err(
      c,
      `Suggestion is stale (server now suggests ${suggestion.suggestedCalories} kcal, client sent ${clientSuggested}). Fetch a fresh adaptive suggestion.`,
      409,
    );
  }

  // Prefer the freshly recomputed target (authoritative), not the client number.
  const newCalories = suggestion.suggestedCalories;
  const oldCalories = nutritionGoal.calories;

  if (weightKg <= 0) {
    return err(c, "Cannot recompute macros without a body weight", 400);
  }

  const macros = macrosForCalorieTarget({
    calories: newCalories,
    weightKg,
    goalId,
    gender,
    age,
    heightCm,
    bodyFatPercent,
  });

  const [updated] = await prisma.$transaction([
    prisma.nutritionGoal.update({
      where: { userId: user.id },
      data: {
        calories: newCalories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
        // bmr/tdee unchanged ? those are profile-derived maintenance estimates
      },
    }),
    prisma.nutritionAdjustmentLog.create({
      data: {
        userId: user.id,
        oldCalories,
        newCalories,
        explanation: suggestion.explanation,
      },
    }),
  ]);

  return ok(c, updated);
});
