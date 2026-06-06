import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ok } from "../lib/response";
import { parseJson } from "../lib/validate";
import { getUser, requireAuth } from "../middleware/requireAuth";
import type { AppEnv } from "../types/hono";

const profileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  goalId: z.string().trim().min(1).nullable().optional(),
  weightKg: z.number().positive().nullable().optional(),
  heightCm: z.number().int().positive().nullable().optional(),
  age: z.number().int().positive().nullable().optional(),
});

function serializeProfile(row: {
  id: string;
  userId: string;
  goalId: string | null;
  weightKg: { toString(): string } | null;
  heightCm: number | null;
  age: number | null;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    userId: row.userId,
    goalId: row.goalId,
    weightKg: row.weightKg != null ? Number(row.weightKg.toString()) : null,
    heightCm: row.heightCm,
    age: row.age,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const profileRouter = new Hono<AppEnv>().use("*", requireAuth);

profileRouter.get("/", async (c) => {
  const user = getUser(c);
  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });
  return ok(c, profile ? serializeProfile(profile) : null);
});

profileRouter.put("/", async (c) => {
  const parsed = await parseJson(c, profileSchema);
  if (!parsed.success) return parsed.response;

  const user = getUser(c);

  if (parsed.data.name !== undefined) {
    await prisma.user.update({
      where: { id: user.id },
      data: { name: parsed.data.name },
    });
  }

  const profile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...(parsed.data.goalId !== undefined && {
        goalId: parsed.data.goalId,
      }),
      ...(parsed.data.weightKg !== undefined && {
        weightKg: parsed.data.weightKg,
      }),
      ...(parsed.data.heightCm !== undefined && {
        heightCm: parsed.data.heightCm,
      }),
      ...(parsed.data.age !== undefined && {
        age: parsed.data.age,
      }),
    },
    update: {
      ...(parsed.data.goalId !== undefined && {
        goalId: parsed.data.goalId,
      }),
      ...(parsed.data.weightKg !== undefined && {
        weightKg: parsed.data.weightKg,
      }),
      ...(parsed.data.heightCm !== undefined && {
        heightCm: parsed.data.heightCm,
      }),
      ...(parsed.data.age !== undefined && {
        age: parsed.data.age,
      }),
    },
  });

  return ok(c, serializeProfile(profile));
});
