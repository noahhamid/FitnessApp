import { Hono } from "hono";
import { z } from "zod";
import { parseLogDate, todayLogDate } from "../lib/dates";
import { prisma } from "../lib/prisma";
import { err, ok } from "../lib/response";
import { parseJson, parseQuery } from "../lib/validate";
import { getUser, requireAuth } from "../middleware/requireAuth";
import type { AppEnv } from "../types/hono";

const mealEnum = z.enum(["Breakfast", "Lunch", "Dinner", "Snack"]);

const goalsSchema = z.object({
  calories: z.number().int().positive(),
  protein: z.number().int().positive(),
  carbs: z.number().int().positive(),
  fat: z.number().int().positive(),
});

const mealLogSchema = z.object({
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meal: mealEnum,
  name: z.string().min(1),
  cal: z.number().int().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
});

const mealLogUpdateSchema = mealLogSchema.partial();

const logDateQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

function serializeMealLog(entry: {
  id: string;
  logDate: Date;
  meal: string;
  name: string;
  cal: number;
  protein: { toString(): string };
  carbs: { toString(): string };
  fat: { toString(): string };
  userId: string;
}) {
  return {
    ...entry,
    logDate: entry.logDate.toISOString().slice(0, 10),
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
  if (!parsed.success) return parsed.response;

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
  if (!query.success) return query.response;

  const dateStr = query.data.date ?? todayLogDate();
  const logDate = parseLogDate(dateStr);
  if (!logDate) return err(c, "Invalid date format", 400);

  const user = getUser(c);
  const meals = await prisma.mealLog.findMany({
    where: { userId: user.id, logDate },
    orderBy: { id: "asc" },
  });

  return ok(c, meals.map(serializeMealLog));
});

nutritionRouter.post("/log", async (c) => {
  const parsed = await parseJson(c, mealLogSchema);
  if (!parsed.success) return parsed.response;

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
    },
  });

  return ok(c, serializeMealLog(entry), 201);
});

nutritionRouter.patch("/log/:id", async (c) => {
  const parsed = await parseJson(c, mealLogUpdateSchema);
  if (!parsed.success) return parsed.response;

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
  if (!query.success) return query.response;

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
