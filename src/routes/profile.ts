import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ok } from "../lib/response";
import { parseJson } from "../lib/validate";
import { getUser, requireAuth } from "../middleware/requireAuth";
import { computeNutritionTargets } from "../lib/nutrition-calc";
import { generateWorkoutPlan } from "../lib/workout-plan-generator";
import type { AppEnv } from "../types/hono";

const genderEnum = z.enum(["male", "female"]);
const experienceEnum = z.enum(["novice", "intermediate", "advanced"]);
const equipmentEnum = z.enum(["full_gym", "home_dumbbells", "bodyweight"]);
const goalEnum = z.enum(["lose", "build", "endure", "health"]);

const profileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  goalId: goalEnum.nullable().optional(),
  weightKg: z.number().positive().nullable().optional(),
  heightCm: z.number().int().positive().nullable().optional(),
  age: z.number().int().positive().nullable().optional(),
  gender: genderEnum.nullable().optional(),
  daysPerWeek: z.number().int().min(2).max(6).nullable().optional(),
  experience: experienceEnum.nullable().optional(),
  equipment: equipmentEnum.nullable().optional(),
});

function serializeProfile(row: {
  id: string;
  userId: string;
  goalId: string | null;
  weightKg: { toString(): string } | null;
  heightCm: number | null;
  age: number | null;
  gender: string | null;
  daysPerWeek: number | null;
  experience: string | null;
  equipment: string | null;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    userId: row.userId,
    goalId: row.goalId,
    weightKg: row.weightKg != null ? Number(row.weightKg.toString()) : null,
    heightCm: row.heightCm,
    age: row.age,
    gender: row.gender,
    daysPerWeek: row.daysPerWeek,
    experience: row.experience,
    equipment: row.equipment,
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
  const data = parsed.data;

  const user = getUser(c);

  if (data.name !== undefined) {
    await prisma.user.update({
      where: { id: user.id },
      data: { name: data.name },
    });
  }

  const fieldsToSet = {
    ...(data.goalId !== undefined && { goalId: data.goalId }),
    ...(data.weightKg !== undefined && { weightKg: data.weightKg }),
    ...(data.heightCm !== undefined && { heightCm: data.heightCm }),
    ...(data.age !== undefined && { age: data.age }),
    ...(data.gender !== undefined && { gender: data.gender }),
    ...(data.daysPerWeek !== undefined && { daysPerWeek: data.daysPerWeek }),
    ...(data.experience !== undefined && { experience: data.experience }),
    ...(data.equipment !== undefined && { equipment: data.equipment }),
  };

  const profile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...fieldsToSet },
    update: fieldsToSet,
  });

  const profileComplete =
    profile.gender &&
    profile.weightKg != null &&
    profile.heightCm != null &&
    profile.age != null &&
    profile.goalId &&
    profile.daysPerWeek != null;

  // --- Nutrition targets ---
  if (profileComplete) {
    const targets = computeNutritionTargets({
      gender: profile.gender as "male" | "female",
      weightKg: Number(profile.weightKg),
      heightCm: profile.heightCm!,
      age: profile.age!,
      goalId: profile.goalId as "lose" | "build" | "endure" | "health",
      daysPerWeek: profile.daysPerWeek!,
    });

    const goalFields = {
      calories: targets.calories,
      protein: targets.protein,
      carbs: targets.carbs,
      fat: targets.fat,
    };

    await prisma.nutritionGoal.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...goalFields },
      update: goalFields,
    });
  }

  // --- Workout plan (needs experience + equipment too, which nutrition doesn't) ---
  const workoutInputsComplete = profileComplete && profile.experience && profile.equipment;

  if (workoutInputsComplete) {
    const plan = await generateWorkoutPlan({
      daysPerWeek: profile.daysPerWeek!,
      experience: profile.experience as "novice" | "intermediate" | "advanced",
      equipment: profile.equipment as "full_gym" | "home_dumbbells" | "bodyweight",
      goalId: profile.goalId as "lose" | "build" | "endure" | "health",
    });

    await prisma.$transaction(async (tx) => {
      // Regenerating replaces the plan entirely — delete old days
      // (cascades to their exercises) before writing the new ones.
      const existingPlan = await tx.workoutPlan.findUnique({
        where: { userId: user.id },
      });
      if (existingPlan) {
        await tx.workoutPlanDay.deleteMany({ where: { planId: existingPlan.id } });
      }

      const savedPlan = await tx.workoutPlan.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          splitLabel: plan.splitLabel,
          daysPerWeek: plan.daysPerWeek,
          goalId: profile.goalId!,
          experience: profile.experience!,
          equipment: profile.equipment!,
        },
        update: {
          splitLabel: plan.splitLabel,
          daysPerWeek: plan.daysPerWeek,
          goalId: profile.goalId!,
          experience: profile.experience!,
          equipment: profile.equipment!,
        },
      });

      for (const day of plan.days) {
        const savedDay = await tx.workoutPlanDay.create({
          data: {
            planId: savedPlan.id,
            dayIndex: day.dayIndex,
            label: day.label,
          },
        });

        await tx.workoutPlanExercise.createMany({
          data: day.exercises.map((ex) => ({
            dayId: savedDay.id,
            exerciseId: ex.exerciseId,
            orderIndex: ex.orderIndex,
            targetSets: ex.targetSets,
            targetRepsMin: ex.targetRepsMin,
            targetRepsMax: ex.targetRepsMax,
          })),
        });
      }
    });
  }

  return ok(c, serializeProfile(profile));
});