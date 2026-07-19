import { Hono, type Context } from "hono";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { err, ok } from "../lib/response";
import { parseJson, parseQuery } from "../lib/validate";
import { getUser, requireAuth } from "../middleware/requireAuth";
import type { AppEnv } from "../types/hono";

const setSchema = z.object({
  reps: z.number().int().nonnegative().optional(),
  weight: z.number().nonnegative().optional(),
  completed: z.boolean().optional(),
  durationSec: z.number().int().positive().optional(),
});

const exerciseInputSchema = z.object({
  exerciseName: z.string().min(1),
  sets: z.array(setSchema).min(1),
});

/** Allow empty sets while a session is in progress (logged at finish via /complete). */
const exerciseCreateBodySchema = z.object({
  exerciseName: z.string().min(1),
  sets: z.array(setSchema).default([]),
});

const startSessionSchema = z.object({
  notes: z.string().optional(),
  exercises: z.array(exerciseInputSchema).optional(),
});

const updateSessionSchema = z.object({
  notes: z.string().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
});

const completeSessionSchema = z.object({
  notes: z.string().nullable().optional(),
  completedAt: z.string().datetime().optional(),
  exercises: z.array(exerciseInputSchema).min(1),
});

const exerciseUpdateSchema = z.object({
  exerciseName: z.string().min(1).optional(),
  sets: z.array(setSchema).min(1).optional(),
});

const listQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  completed: z.enum(["true", "false"]).optional(),
});

function serializeSession(session: {
  id: string;
  startedAt: Date;
  completedAt: Date | null;
  notes: string | null;
  userId: string;
  exercises?: Array<{
    id: string;
    exerciseName: string;
    sets: unknown;
    sessionId: string;
  }>;
}) {
  return {
    ...session,
    exercises: session.exercises?.map((exercise) => ({
      ...exercise,
      sets: exercise.sets,
    })),
  };
}
function serializePlan(plan: {
  id: string;
  splitLabel: string;
  daysPerWeek: number;
  goalId: string;
  experience: string;
  equipment: string;
  updatedAt: Date;
  days: Array<{
    id: string;
    dayIndex: number;
    label: string;
    exercises: Array<{
      id: string;
      orderIndex: number;
      targetSets: number;
      targetRepsMin: number;
      targetRepsMax: number;
      exercise: { id: string; name: string; muscleGroup: string; movementPattern: string };
    }>;
  }>;
}) {
  return {
    id: plan.id,
    splitLabel: plan.splitLabel,
    daysPerWeek: plan.daysPerWeek,
    goalId: plan.goalId,
    experience: plan.experience,
    equipment: plan.equipment,
    updatedAt: plan.updatedAt.toISOString(),
    days: plan.days
      .sort((a, b) => a.dayIndex - b.dayIndex)
      .map((day) => ({
        id: day.id,
        dayIndex: day.dayIndex,
        label: day.label,
        exercises: day.exercises
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((ex) => ({
            id: ex.id,
            orderIndex: ex.orderIndex,
            exerciseId: ex.exercise.id,
            exerciseName: ex.exercise.name,
            muscleGroup: ex.exercise.muscleGroup,
            movementPattern: ex.exercise.movementPattern,
            targetSets: ex.targetSets,
            targetRepsMin: ex.targetRepsMin,
            targetRepsMax: ex.targetRepsMax,
          })),
      })),
  };
}
 

async function findOwnedSession(userId: string, sessionId: string) {
  return prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
    include: { exercises: true },
  });
}

export const workoutsRouter = new Hono<AppEnv>().use("*", requireAuth);

/** POST/GET session root — register both '' and '/' so clients match /api/workouts (no trailing slash). */
const createSession = async (c: Context<AppEnv>) => {
  const parsed = await parseJson(c, startSessionSchema);
  if (!parsed.success) return parsed.response;

  const user = getUser(c);
  const { notes, exercises } = parsed.data;

  const session = await prisma.$transaction(async (tx) => {
    const created = await tx.workoutSession.create({
      data: {
        userId: user.id,
        notes: notes ?? null,
      },
    });

    if (exercises?.length) {
      await tx.workoutExercise.createMany({
        data: exercises.map((exercise) => ({
          sessionId: created.id,
          exerciseName: exercise.exerciseName,
          sets: exercise.sets,
        })),
      });
    }

    return tx.workoutSession.findUniqueOrThrow({
      where: { id: created.id },
      include: { exercises: true },
    });
  });

  return ok(c, serializeSession(session), 201);
};

const listSessions = async (c: Context<AppEnv>) => {
  const query = parseQuery(c, listQuerySchema);
  if (!query.success) return query.response;

  const user = getUser(c);
  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId: user.id,
      ...(query.data.completed === "true"
        ? { completedAt: { not: null } }
        : query.data.completed === "false"
          ? { completedAt: null }
          : {}),
    },
    include: { exercises: true },
    orderBy: { startedAt: "desc" },
    take: query.data.limit ?? 50,
  });

  return ok(c, sessions.map(serializeSession));
};

// Single path (not an array) — array form was parsed as middleware and broke requireAuth's `next`.
workoutsRouter.post("/", createSession);
workoutsRouter.get("/", listSessions);

workoutsRouter.get("/plan", async (c) => {
  const user = getUser(c);
 
  const plan = await prisma.workoutPlan.findUnique({
    where: { userId: user.id },
    include: {
      days: {
        include: {
          exercises: {
            include: { exercise: true },
          },
        },
      },
    },
  });
 
  if (!plan) return ok(c, null);
  return ok(c, serializePlan(plan));
});

// ============================================================
// ADD to src/routes/workouts.ts — register BEFORE workoutsRouter.get("/:id", ...)
// since it's a specific path, same reasoning as /plan.
// ============================================================

workoutsRouter.get("/last-performance", async (c) => {
  const user = getUser(c);

  // Pull recent completed sessions and derive the most recent set logged
  // per exercise name. Capped at last 100 sessions — plenty of history
  // without scanning someone's entire lifetime of workouts on every load.
  const sessions = await prisma.workoutSession.findMany({
    where: { userId: user.id, completedAt: { not: null } },
    include: { exercises: true },
    orderBy: { completedAt: "desc" },
    take: 100,
  });

  const lastByExercise: Record<string, { weight?: number; reps?: number }> = {};

  for (const session of sessions) {
    for (const exercise of session.exercises) {
      if (lastByExercise[exercise.exerciseName]) continue; // already found a more recent one

      const sets = exercise.sets as Array<{
        weight?: number;
        reps?: number;
        completed?: boolean;
      }>;
      const lastCompletedSet = [...sets].reverse().find((s) => s.completed);
      if (lastCompletedSet) {
        lastByExercise[exercise.exerciseName] = {
          weight: lastCompletedSet.weight,
          reps: lastCompletedSet.reps,
        };
      }
    }
  }

  return ok(c, lastByExercise);
});
 

workoutsRouter.get("/:id", async (c) => {
  const user = getUser(c);
  const session = await findOwnedSession(user.id, c.req.param("id"));

  if (!session) return err(c, "Workout session not found", 404);
  return ok(c, serializeSession(session));
});


workoutsRouter.patch("/:id", async (c) => {
  const parsed = await parseJson(c, updateSessionSchema);
  if (!parsed.success) return parsed.response;

  const user = getUser(c);
  const sessionId = c.req.param("id");

  const existing = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId: user.id },
  });
  if (!existing) return err(c, "Workout session not found", 404);

  const session = await prisma.workoutSession.update({
    where: { id: sessionId },
    data: {
      ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
      ...(parsed.data.completedAt !== undefined && {
        completedAt: parsed.data.completedAt
          ? new Date(parsed.data.completedAt)
          : null,
      }),
    },
    include: { exercises: true },
  });

  return ok(c, serializeSession(session));
});

workoutsRouter.post("/:id/complete", async (c) => {
  const parsed = await parseJson(c, completeSessionSchema);
  if (!parsed.success) return parsed.response;

  const user = getUser(c);
  const sessionId = c.req.param("id");

  const existing = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId: user.id },
  });
  if (!existing) return err(c, "Workout session not found", 404);

  const session = await prisma.$transaction(async (tx) => {
    await tx.workoutExercise.deleteMany({ where: { sessionId } });

    await tx.workoutExercise.createMany({
      data: parsed.data.exercises.map((exercise) => ({
        sessionId,
        exerciseName: exercise.exerciseName,
        sets: exercise.sets,
      })),
    });

    return tx.workoutSession.update({
      where: { id: sessionId },
      data: {
        notes: parsed.data.notes ?? existing.notes,
        completedAt: parsed.data.completedAt
          ? new Date(parsed.data.completedAt)
          : new Date(),
      },
      include: { exercises: true },
    });
  });

  return ok(c, serializeSession(session));
});

workoutsRouter.delete("/:id", async (c) => {
  const user = getUser(c);
  const sessionId = c.req.param("id");

  const existing = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId: user.id },
  });
  if (!existing) return err(c, "Workout session not found", 404);

  await prisma.workoutSession.delete({ where: { id: sessionId } });
  return ok(c, { deleted: true });
});

workoutsRouter.post("/:id/exercises", async (c) => {
  const parsed = await parseJson(c, exerciseCreateBodySchema);
  if (!parsed.success) return parsed.response;

  const user = getUser(c);
  const sessionId = c.req.param("id");

  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId: user.id },
  });
  if (!session) return err(c, "Workout session not found", 404);

  const exercise = await prisma.workoutExercise.create({
    data: {
      sessionId,
      exerciseName: parsed.data.exerciseName,
      sets: parsed.data.sets ?? [],
    },
  });

  return ok(c, exercise, 201);
});

workoutsRouter.patch("/:id/exercises/:exerciseId", async (c) => {
  const parsed = await parseJson(c, exerciseUpdateSchema);
  if (!parsed.success) return parsed.response;

  const user = getUser(c);
  const sessionId = c.req.param("id");
  const exerciseId = c.req.param("exerciseId");

  const exercise = await prisma.workoutExercise.findFirst({
    where: {
      id: exerciseId,
      session: { id: sessionId, userId: user.id },
    },
  });
  if (!exercise) return err(c, "Workout exercise not found", 404);

  const updated = await prisma.workoutExercise.update({
    where: { id: exerciseId },
    data: {
      ...(parsed.data.exerciseName !== undefined && {
        exerciseName: parsed.data.exerciseName,
      }),
      ...(parsed.data.sets !== undefined && { sets: parsed.data.sets }),
    },
  });

  return ok(c, updated);
});

workoutsRouter.delete("/:id/exercises/:exerciseId", async (c) => {
  const user = getUser(c);
  const sessionId = c.req.param("id");
  const exerciseId = c.req.param("exerciseId");

  const exercise = await prisma.workoutExercise.findFirst({
    where: {
      id: exerciseId,
      session: { id: sessionId, userId: user.id },
    },
  });
  if (!exercise) return err(c, "Workout exercise not found", 404);

  await prisma.workoutExercise.delete({ where: { id: exerciseId } });
  return ok(c, { deleted: true });
});
