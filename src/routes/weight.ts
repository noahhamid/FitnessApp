import { Hono } from "hono";
import { z } from "zod";
import { parseLogDate, todayLogDate } from "../lib/dates";
import { prisma } from "../lib/prisma";
import { err, ok } from "../lib/response";
import { parseJson, parseQuery } from "../lib/validate";
import { getUser, requireAuth } from "../middleware/requireAuth";
import type { AppEnv } from "../types/hono";

const weightLogSchema = z.object({
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  weight: z.number().positive(),
});

const weightLogUpdateSchema = z.object({
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  weight: z.number().positive().optional(),
});

const weightGoalSchema = z.object({
  goalWeight: z.number().positive(),
  startWeight: z.number().positive(),
});

const logDateQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

function serializeWeightLog(entry: {
  id: string;
  logDate: Date;
  weight: { toString(): string };
  userId: string;
}) {
  return {
    ...entry,
    logDate: entry.logDate.toISOString().slice(0, 10),
    weight: Number(entry.weight),
  };
}

function serializeWeightGoal(entry: {
  id: string;
  goalWeight: { toString(): string };
  startWeight: { toString(): string };
  updatedAt: Date;
  userId: string;
}) {
  return {
    ...entry,
    goalWeight: Number(entry.goalWeight),
    startWeight: Number(entry.startWeight),
  };
}

export const weightRouter = new Hono<AppEnv>().use("*", requireAuth);

weightRouter.get("/log", async (c) => {
  const query = parseQuery(c, logDateQuerySchema);
  if (!query.success) return query.response;

  const user = getUser(c);
  const from = query.data.from ? parseLogDate(query.data.from) : null;
  const to = query.data.to ? parseLogDate(query.data.to) : null;

  if (query.data.from && !from) return err(c, "Invalid from date", 400);
  if (query.data.to && !to) return err(c, "Invalid to date", 400);

  const logs = await prisma.weightLog.findMany({
    where: {
      userId: user.id,
      ...(from || to
        ? {
            logDate: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    orderBy: { logDate: "asc" },
  });

  return ok(c, logs.map(serializeWeightLog));
});

weightRouter.post("/log", async (c) => {
  const parsed = await parseJson(c, weightLogSchema);
  if (!parsed.success) return parsed.response;

  const dateStr = parsed.data.logDate ?? todayLogDate();
  const logDate = parseLogDate(dateStr);
  if (!logDate) return err(c, "Invalid logDate", 400);

  const user = getUser(c);
  const entry = await prisma.weightLog.create({
    data: {
      userId: user.id,
      logDate,
      weight: parsed.data.weight,
    },
  });

  return ok(c, serializeWeightLog(entry), 201);
});

weightRouter.patch("/log/:id", async (c) => {
  const parsed = await parseJson(c, weightLogUpdateSchema);
  if (!parsed.success) return parsed.response;

  const user = getUser(c);
  const id = c.req.param("id");

  const existing = await prisma.weightLog.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return err(c, "Weight log not found", 404);

  const logDate =
    parsed.data.logDate !== undefined
      ? parseLogDate(parsed.data.logDate)
      : undefined;
  if (parsed.data.logDate !== undefined && !logDate) {
    return err(c, "Invalid logDate", 400);
  }

  const entry = await prisma.weightLog.update({
    where: { id },
    data: {
      ...(parsed.data.weight !== undefined && { weight: parsed.data.weight }),
      ...(logDate && { logDate }),
    },
  });

  return ok(c, serializeWeightLog(entry));
});

weightRouter.delete("/log/:id", async (c) => {
  const user = getUser(c);
  const id = c.req.param("id");

  const existing = await prisma.weightLog.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return err(c, "Weight log not found", 404);

  await prisma.weightLog.delete({ where: { id } });
  return ok(c, { deleted: true });
});

weightRouter.get("/goal", async (c) => {
  const user = getUser(c);
  const goal = await prisma.weightGoal.findUnique({
    where: { userId: user.id },
  });

  return ok(c, goal ? serializeWeightGoal(goal) : null);
});

weightRouter.put("/goal", async (c) => {
  const parsed = await parseJson(c, weightGoalSchema);
  if (!parsed.success) return parsed.response;

  const user = getUser(c);
  const goal = await prisma.weightGoal.upsert({
    where: { userId: user.id },
    update: {
      goalWeight: parsed.data.goalWeight,
      startWeight: parsed.data.startWeight,
    },
    create: {
      userId: user.id,
      goalWeight: parsed.data.goalWeight,
      startWeight: parsed.data.startWeight,
    },
  });

  return ok(c, serializeWeightGoal(goal));
});

weightRouter.delete("/goal", async (c) => {
  const user = getUser(c);

  const existing = await prisma.weightGoal.findUnique({
    where: { userId: user.id },
  });
  if (!existing) return err(c, "Weight goal not found", 404);

  await prisma.weightGoal.delete({ where: { userId: user.id } });
  return ok(c, { deleted: true });
});
