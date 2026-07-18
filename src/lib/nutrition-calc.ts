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

export interface NutritionInput {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  age: number;
  goalId: GoalId;
  daysPerWeek: number; // 2-6, used as activity-level proxy
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
};

const GOAL_CALORIE_FACTOR: Record<GoalId, number> = {
  lose: 0.8, // 20% deficit
  build: 1.1, // 10% surplus
  endure: 1.0, // maintenance
  health: 1.0, // maintenance
};

const PROTEIN_G_PER_KG: Record<GoalId, number> = {
  lose: 2.0,
  build: 2.0,
  endure: 1.6,
  health: 1.6,
};

const FAT_PERCENT_OF_CALORIES = 0.25;

function clampDaysPerWeek(days: number): number {
  return Math.min(6, Math.max(2, Math.round(days)));
}

export function computeNutritionTargets(
  input: NutritionInput,
): NutritionTargets {
  const { gender, weightKg, heightCm, age, goalId } = input;
  const days = clampDaysPerWeek(input.daysPerWeek);

  // 1. BMR — Mifflin-St Jeor
  const bmrBase = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = gender === "male" ? bmrBase + 5 : bmrBase - 161;

  // 2. TDEE
  const tdee = bmr * ACTIVITY_MULTIPLIER[days];

  // 3. Calorie target
  const calories = Math.round(tdee * GOAL_CALORIE_FACTOR[goalId]);

  // 4. Macros
  const protein = Math.round(weightKg * PROTEIN_G_PER_KG[goalId]);
  const fat = Math.round((calories * FAT_PERCENT_OF_CALORIES) / 9);
  const carbsRaw = (calories - protein * 4 - fat * 9) / 4;
  const carbs = Math.max(0, Math.round(carbsRaw));

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories,
    protein,
    carbs,
    fat,
  };
}