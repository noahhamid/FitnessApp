import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ok } from "../lib/response";
import { parseJson } from "../lib/validate";
import { getUser, requireAuth } from "../middleware/requireAuth";
import { computeNutritionTargets } from "../lib/nutrition-calc";
import { isOnboardingProfileComplete } from "../lib/onboarding-complete";
import {
  adaptTrainingDaysToCount,
  normalizeTrainingDays,
} from "../lib/plan-day-selection";
import {
  generateWorkoutPlan,
  type FocusArea,
  type Injury,
} from "../lib/workout-plan-generator";
import type { AppEnv } from "../types/hono";

const genderEnum = z.enum(["male", "female"]);
const experienceEnum = z.enum(["novice", "intermediate", "advanced"]);
const equipmentEnum = z.enum(["full_gym", "home_dumbbells", "bodyweight"]);
const goalEnum = z.enum(["lose", "build", "endure", "health"]);
const paceEnum = z.enum(["slow", "moderate", "aggressive"]);

const profileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  goalId: goalEnum.nullable().optional(),
  goalDetail: z.string().trim().min(1).max(60).nullable().optional(),
  weightKg: z.number().positive().nullable().optional(),
  targetWeightKg: z.number().positive().nullable().optional(),
  pace: paceEnum.nullable().optional(),
  heightCm: z.number().int().positive().nullable().optional(),
  age: z.number().int().positive().nullable().optional(),
  gender: genderEnum.nullable().optional(),
  daysPerWeek: z.number().int().min(2).max(7).nullable().optional(),
  /** Monday-indexed weekdays (0=Mon … 6=Sun); [] restores the default pattern. */
  trainingDays: z.array(z.number().int().min(0).max(6)).max(7).optional(),
  experience: experienceEnum.nullable().optional(),
  equipment: equipmentEnum.nullable().optional(),
  focusAreas: z.array(z.string()).optional(),
  bodyIssues: z.array(z.string()).optional(),
  injuries: z.array(z.string()).optional(),
  reminderEnabled: z.boolean().nullable().optional(),
  reminderHour: z.number().int().min(0).max(23).nullable().optional(),
});

function serializeProfile(row: {
  id: string;
  userId: string;
  goalId: string | null;
  goalDetail: string | null;
  weightKg: { toString(): string } | null;
  targetWeightKg: { toString(): string } | null;
  pace: string | null;
  heightCm: number | null;
  age: number | null;
  gender: string | null;
  daysPerWeek: number | null;
  trainingDays: number[];
  experience: string | null;
  equipment: string | null;
  focusAreas: string[];
  bodyIssues: string[];
  injuries: string[];
  reminderEnabled: boolean | null;
  reminderHour: number | null;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    userId: row.userId,
    goalId: row.goalId,
    goalDetail: row.goalDetail,
    weightKg: row.weightKg != null ? Number(row.weightKg.toString()) : null,
    targetWeightKg:
      row.targetWeightKg != null ? Number(row.targetWeightKg.toString()) : null,
    pace: row.pace,
    heightCm: row.heightCm,
    age: row.age,
    gender: row.gender,
    daysPerWeek: row.daysPerWeek,
    trainingDays: row.trainingDays,
    experience: row.experience,
    equipment: row.equipment,
    focusAreas: row.focusAreas,
    bodyIssues: row.bodyIssues,
    injuries: row.injuries,
    reminderEnabled: row.reminderEnabled,
    reminderHour: row.reminderHour,
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
  if (parsed.success === false) return parsed.response;
  const data = parsed.data;

  const user = getUser(c);

  if (data.name !== undefined) {
    await prisma.user.update({
      where: { id: user.id },
      data: { name: data.name },
    });
  }

  // `trainingDays` and `daysPerWeek` must agree, since the plan holds exactly
  // `daysPerWeek` days and each chosen weekday maps to one of them. An explicit
  // weekday list wins and sets the count. Changing only the count resizes a
  // custom list — it does not wipe Tue/Thu/Sat back to the default pattern.
  const existing = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    select: { trainingDays: true },
  });

  const chosenDays =
    data.trainingDays !== undefined
      ? normalizeTrainingDays(data.trainingDays)
      : undefined;

  const scheduleFields =
    data.trainingDays !== undefined
      ? {
          trainingDays: chosenDays ?? [],
          ...(chosenDays && { daysPerWeek: chosenDays.length }),
        }
      : data.daysPerWeek != null
        ? {
            daysPerWeek: data.daysPerWeek,
            ...(normalizeTrainingDays(existing?.trainingDays)
              ? {
                  trainingDays: adaptTrainingDaysToCount(
                    existing?.trainingDays,
                    data.daysPerWeek,
                  ),
                }
              : {}),
          }
        : data.daysPerWeek === null
          ? { daysPerWeek: null }
          : {};

  const fieldsToSet = {
    ...scheduleFields,
    ...(data.goalId !== undefined && { goalId: data.goalId }),
    ...(data.goalDetail !== undefined && { goalDetail: data.goalDetail }),
    ...(data.weightKg !== undefined && { weightKg: data.weightKg }),
    ...(data.targetWeightKg !== undefined && {
      targetWeightKg: data.targetWeightKg,
    }),
    ...(data.pace !== undefined && { pace: data.pace }),
    ...(data.heightCm !== undefined && { heightCm: data.heightCm }),
    ...(data.age !== undefined && { age: data.age }),
    ...(data.gender !== undefined && { gender: data.gender }),
    ...(data.experience !== undefined && { experience: data.experience }),
    ...(data.equipment !== undefined && { equipment: data.equipment }),
    ...(data.focusAreas !== undefined && { focusAreas: data.focusAreas }),
    ...(data.bodyIssues !== undefined && { bodyIssues: data.bodyIssues }),
    ...(data.injuries !== undefined && { injuries: data.injuries }),
    ...(data.reminderEnabled !== undefined && {
      reminderEnabled: data.reminderEnabled,
    }),
    ...(data.reminderHour !== undefined && { reminderHour: data.reminderHour }),
  };

  const profile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...fieldsToSet },
    update: fieldsToSet,
  });

  const profileComplete = isOnboardingProfileComplete(profile);

  // --- Nutrition targets ---
  if (profileComplete) {
    const targets = computeNutritionTargets({
      gender: profile.gender as "male" | "female",
      weightKg: Number(profile.weightKg),
      heightCm: profile.heightCm!,
      age: profile.age!,
      goalId: profile.goalId as "lose" | "build" | "endure" | "health",
      daysPerWeek: profile.daysPerWeek!,
      pace: profile.pace as "slow" | "moderate" | "aggressive" | undefined,
      targetWeightKg:
        profile.targetWeightKg != null
          ? Number(profile.targetWeightKg)
          : undefined,
    });

    const goalFields = {
      calories: targets.calories,
      protein: targets.protein,
      carbs: targets.carbs,
      fat: targets.fat,
      bmr: targets.bmr,
      tdee: targets.tdee,
    };

    await prisma.nutritionGoal.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...goalFields },
      update: goalFields,
    });
  }

  if (profileComplete) {
    try {
      const plan = await generateWorkoutPlan({
        daysPerWeek: profile.daysPerWeek!,
        experience: profile.experience as "novice" | "intermediate" | "advanced",
        equipment: profile.equipment as "full_gym" | "home_dumbbells" | "bodyweight",
        goalId: profile.goalId as "lose" | "build" | "endure" | "health",
        focusAreas: profile.focusAreas as FocusArea[],
        injuries: profile.injuries as Injury[],
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
    } catch (err) {
      // Profile + nutrition still saved — don't block account creation on plan gen.
      console.error("[profile] workout plan generation failed:", err);
    }
  }

  return ok(c, serializeProfile(profile));
});