/**
 * computeNutritionTargets — pure function, no I/O.
 *
 * Implements:
 *   1. BMR (Mifflin-St Jeor)
 *   2. TDEE (activity multiplier keyed off daysPerWeek, since we don't
 *      collect a separate daily-activity question yet)
 *   3. Calorie target (adjusted by goal)
 *   4. Macros (protein by g/kg, fat as % of calories, carbs = remainder)
 *
 * Unit-testable in isolation — no Prisma, no Hono, just numbers in,
 * numbers out.
 */

export type Gender = "male" | "female";
export type GoalId = "lose" | "build" | "endure" | "health";
export type Pace = "slow" | "moderate" | "aggressive";

export interface NutritionInput {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  age: number;
  goalId: GoalId;
  daysPerWeek: number; // 2-7, used as activity-level proxy
  /** Onboarding pace choice — only changes the calorie factor for lose/build. */
  pace?: Pace;
  /** Used as a safety floor: never deficit below what's needed to reach it sensibly. */
  targetWeightKg?: number;
}

export interface NutritionTargets {
  bmr: number;
  tdee: number;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

const ACTIVITY_MULTIPLIER: Record<number, number> = {
  2: 1.35,
  3: 1.45,
  4: 1.55,
  5: 1.65,
  6: 1.75,
  7: 1.8,
};

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

const PROTEIN_G_PER_KG: Record<GoalId, number> = {
  lose: 2.0,
  build: 2.0,
  endure: 1.6,
  health: 1.6,
};

const FAT_PERCENT_OF_CALORIES = 0.25;

function clampDaysPerWeek(days: number): number {
  return Math.min(7, Math.max(2, Math.round(days)));
}

/**
 * Macro split used by initial targets AND adaptive apply.
 * Protein is g/kg bodyweight (goal-dependent); fat is 25% of calories;
 * carbs fill the remainder. Keep this as the single source of truth.
 */
export function macrosForCalorieTarget(input: {
  calories: number;
  weightKg: number;
  goalId: GoalId;
}): { protein: number; carbs: number; fat: number } {
  const { calories, weightKg, goalId } = input;
  const protein = Math.round(weightKg * PROTEIN_G_PER_KG[goalId]);
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

  // 2. TDEE
  const tdee = bmr * ACTIVITY_MULTIPLIER[days];

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
