/**
 * computeNutritionTargets — pure function, no I/O.
 *
 * Implements:
 *   1. BMR (Mifflin-St Jeor)
 *   2. TDEE (non-exercise activity level + a per-session training bump)
 *   3. Calorie target (adjusted by goal)
 *   4. Macros (protein by g/kg lean mass, fat as % of calories, carbs = remainder)
 *
 * Unit-testable in isolation — no Prisma, no Hono, just numbers in,
 * numbers out.
 */

import { estimateLeanMassKg } from "./body-composition";

export type Gender = "male" | "female";
export type GoalId = "lose" | "build" | "endure" | "health";
export type Pace = "slow" | "moderate" | "aggressive";

/** Daily movement outside of training — job, commute, steps. */
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";

export interface NutritionInput {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  age: number;
  goalId: GoalId;
  daysPerWeek: number; // 2-7 training sessions
  /** Lifestyle activity outside training. Defaults to `light`. */
  activityLevel?: ActivityLevel;
  /** Onboarding pace choice — only changes the calorie factor for lose/build. */
  pace?: Pace;
  /** Used as a safety floor: never deficit below what's needed to reach it sensibly. */
  targetWeightKg?: number;
  /** Measured BF% when known — sharpens the lean-mass protein target. */
  bodyFatPercent?: number;
}

export interface NutritionTargets {
  bmr: number;
  tdee: number;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

/**
 * Non-exercise physical activity level (NEAT). Training is added separately in
 * `activityMultiplier` — the old table keyed the whole multiplier off training
 * days alone, so a desk worker and a labourer training twice a week landed on
 * an identical TDEE.
 */
const NON_EXERCISE_PAL: Record<ActivityLevel, number> = {
  sedentary: 1.25,
  light: 1.35,
  moderate: 1.45,
  active: 1.55,
};

/**
 * Added per weekly training session. A resistance session is roughly
 * 250–350 kcal, which spread over a week is a few percent of BMR.
 */
const PAL_PER_TRAINING_DAY = 0.03;

/** Ceiling so 7 sessions on an active job can't produce an absurd TDEE. */
const MAX_PAL = 1.9;

/**
 * Until onboarding asks about daily activity, assume `light` — this keeps the
 * combined multiplier close to the previous table for a typical 3-day user.
 */
const DEFAULT_ACTIVITY_LEVEL: ActivityLevel = "light";

const GOAL_CALORIE_FACTOR: Record<GoalId, number> = {
  lose: 0.8, // 20% deficit (moderate pace default)
  build: 1.1, // 10% surplus (moderate pace default)
  endure: 1.0, // maintenance
  health: 1.0, // maintenance
};

/** Pace only changes the deficit/surplus size for weight-driven goals. */
const PACE_CALORIE_FACTOR: Record<"lose" | "build", Record<Pace, number>> = {
  lose: { slow: 0.9, moderate: 0.8, aggressive: 0.72 },
  build: { slow: 1.05, moderate: 1.1, aggressive: 1.15 },
};

/** Never let a deficit push calories below this multiple of BMR. */
const SAFE_CALORIE_FLOOR_OF_BMR = 1.2;

/**
 * Protein per kg of LEAN mass, not total bodyweight. Scaling off total weight
 * sizes protein for fat mass the user is trying to lose, which overshoots badly
 * at high body fat and squeezes carbs to nothing.
 */
const PROTEIN_G_PER_KG_LBM: Record<GoalId, number> = {
  lose: 2.4, // highest — protein spares lean mass in a deficit
  build: 2.3,
  endure: 2.0,
  health: 1.9,
};

/** Fallback g/kg of bodyweight when body composition can't be estimated. */
const PROTEIN_G_PER_KG_BODYWEIGHT: Record<GoalId, number> = {
  lose: 2.0,
  build: 2.0,
  endure: 1.6,
  health: 1.6,
};

const FAT_PERCENT_OF_CALORIES = 0.25;

function clampDaysPerWeek(days: number): number {
  return Math.min(7, Math.max(1, Math.round(days)));
}

/**
 * Combined activity multiplier: lifestyle movement plus weekly training load.
 */
export function activityMultiplier(input: {
  daysPerWeek: number;
  activityLevel?: ActivityLevel;
}): number {
  const days = clampDaysPerWeek(input.daysPerWeek);
  const base = NON_EXERCISE_PAL[input.activityLevel ?? DEFAULT_ACTIVITY_LEVEL];
  const pal = base + days * PAL_PER_TRAINING_DAY;
  return Math.min(MAX_PAL, Math.round(pal * 1000) / 1000);
}

/**
 * Macro split used by initial targets AND adaptive apply.
 * Protein is g/kg lean mass (goal-dependent) when body composition can be
 * estimated, else g/kg bodyweight; fat is 25% of calories; carbs fill the
 * remainder. Keep this as the single source of truth.
 */
export function macrosForCalorieTarget(input: {
  calories: number;
  weightKg: number;
  goalId: GoalId;
  /** Supply these to size protein off lean mass instead of total weight. */
  gender?: Gender;
  age?: number;
  heightCm?: number;
  bodyFatPercent?: number;
}): { protein: number; carbs: number; fat: number } {
  const { calories, weightKg, goalId, gender, age, heightCm } = input;

  const canEstimateLeanMass =
    gender != null &&
    age != null &&
    heightCm != null &&
    age > 0 &&
    heightCm > 0 &&
    weightKg > 0;

  const protein = canEstimateLeanMass
    ? Math.round(
        estimateLeanMassKg({
          gender,
          age,
          heightCm,
          weightKg,
          bodyFatPercent: input.bodyFatPercent,
        }) * PROTEIN_G_PER_KG_LBM[goalId],
      )
    : Math.round(weightKg * PROTEIN_G_PER_KG_BODYWEIGHT[goalId]);

  const fat = Math.round((calories * FAT_PERCENT_OF_CALORIES) / 9);
  const carbsRaw = (calories - protein * 4 - fat * 9) / 4;
  const carbs = Math.max(0, Math.round(carbsRaw));
  return { protein, carbs, fat };
}

export function computeNutritionTargets(
  input: NutritionInput,
): NutritionTargets {
  const { gender, weightKg, heightCm, age, goalId, pace, targetWeightKg } = input;
  const days = clampDaysPerWeek(input.daysPerWeek);

  // 1. BMR — Mifflin-St Jeor
  const bmrBase = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = gender === "male" ? bmrBase + 5 : bmrBase - 161;

  // 2. TDEE — lifestyle activity plus training load
  const tdee =
    bmr * activityMultiplier({ daysPerWeek: days, activityLevel: input.activityLevel });

  // 3. Calorie target — pace only bends the factor for weight-driven goals,
  // and a target weight above/below current can veto a factor that would
  // push the wrong direction (e.g. "lose" with a target above current kg).
  const calorieFactor =
    (goalId === "lose" || goalId === "build") && pace
      ? PACE_CALORIE_FACTOR[goalId][pace]
      : GOAL_CALORIE_FACTOR[goalId];
  let calories = Math.round(tdee * calorieFactor);

  // Safety floor: never let an aggressive deficit go below a sane minimum,
  // regardless of how far targetWeightKg is from the current weight.
  if (goalId === "lose") {
    const floor = Math.round(bmr * SAFE_CALORIE_FLOOR_OF_BMR);
    calories = Math.max(calories, floor);
  }
  if (targetWeightKg != null && goalId === "lose" && targetWeightKg >= weightKg) {
    // Target isn't actually below current weight — don't run a deficit.
    calories = Math.round(tdee);
  }
  if (targetWeightKg != null && goalId === "build" && targetWeightKg <= weightKg) {
    calories = Math.round(tdee);
  }

  // 4. Macros (shared with adaptive apply)
  const { protein, carbs, fat } = macrosForCalorieTarget({
    calories,
    weightKg,
    goalId,
    gender,
    age,
    heightCm,
    bodyFatPercent: input.bodyFatPercent,
  });

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories,
    protein,
    carbs,
    fat,
  };
}
