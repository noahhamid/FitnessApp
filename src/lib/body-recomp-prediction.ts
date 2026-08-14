/**
 * Body recomposition prediction engine.
 *
 * Day-by-day simulation of fat mass (FM) and lean body mass (LBM) under a
 * paced calorie target — used by onboarding weight timelines (and reusable
 * anywhere else that needs a non-linear projection).
 *
 * Pure functions only: no I/O, safe in RN + Node.
 */

import {
  activityMultiplier as combinedActivityMultiplier,
  type ActivityLevel,
  type Gender,
  type GoalId,
  type Pace,
} from "./nutrition-calc";
import {
  estimateBodyFatPercent,
  navyBodyFatPercent,
  resolveBodyFatPercent as resolveBodyFat,
} from "./body-composition";

export { estimateBodyFatPercent, navyBodyFatPercent };

export type ExperienceLevel = "novice" | "intermediate" | "advanced";

export type PredictionInput = {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  goalId: GoalId;
  pace: Pace;
  /** Training days/week. Defaults to 3. */
  daysPerWeek?: number;
  /** Lifestyle activity outside training. Defaults to `light`. */
  activityLevel?: ActivityLevel;
  /** Affects tissue partitioning. Defaults to intermediate. */
  experience?: ExperienceLevel;
  /** Optional measured BF%. If omitted, estimated from BMI + demographics. */
  bodyFatPercent?: number;
  /** Optional U.S. Navy circumference inputs (cm). */
  waistCm?: number;
  neckCm?: number;
  hipCm?: number;
  /** Simulation horizon. Default 90. */
  horizonDays?: number;
};

export type DayProjection = {
  day: number;
  projectedWeight: number;
  leanMass: number;
  fatMass: number;
  caloricTarget: number;
};

export type PredictionResult = {
  bmr: number;
  tdee: number;
  baselineBodyFatPercent: number;
  baselineLeanMass: number;
  baselineFatMass: number;
  /** Daily (or weekly-sampled) series. */
  timeline: DayProjection[];
  /** First day projected weight is within 0.3 kg of target, or null. */
  dayReachedTarget: number | null;
  warnings: string[];
};

const KCAL_PER_KG_FAT = 7700;
const KCAL_PER_KG_LEAN = 1800;

const PACE_CALORIE_FACTOR: Record<"lose" | "build", Record<Pace, number>> = {
  lose: { slow: 0.9, moderate: 0.8, aggressive: 0.72 },
  build: { slow: 1.05, moderate: 1.1, aggressive: 1.15 },
};

const SAFE_CALORIE_FLOOR_OF_BMR = 1.2;
const MAX_TIMELINE_WEEKS = 14;
const TARGET_TOLERANCE_KG = 0.3;

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function clampDays(days: number): number {
  return clamp(Math.round(days), 2, 7);
}

/** Mifflin–St Jeor BMR (kcal/day). */
export function mifflinStJeorBmr(input: {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  age: number;
}): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  return input.gender === "male" ? base + 5 : base - 161;
}

export function activityMultiplier(
  daysPerWeek: number,
  activityLevel?: ActivityLevel,
): number {
  return combinedActivityMultiplier({
    daysPerWeek: clampDays(daysPerWeek),
    activityLevel,
  });
}

export function resolveBodyFatPercent(input: PredictionInput): number {
  return resolveBodyFat({
    gender: input.gender,
    age: input.age,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    bodyFatPercent: input.bodyFatPercent,
    waistCm: input.waistCm,
    neckCm: input.neckCm,
    hipCm: input.hipCm,
  });
}

function effectiveCalorieGoal(
  goalId: GoalId,
  weightKg: number,
  targetWeightKg: number,
): GoalId {
  if (goalId === "lose" || goalId === "build") return goalId;
  // Endure / health still pick a maintain weight — if it differs from
  // current, steer calories like a soft cut or bulk toward that mark.
  if (targetWeightKg < weightKg - 0.5) return "lose";
  if (targetWeightKg > weightKg + 0.5) return "build";
  return goalId;
}

function calorieFactorFor(
  goalId: GoalId,
  pace: Pace,
  weightKg: number,
  targetWeightKg: number,
): number {
  const effective = effectiveCalorieGoal(goalId, weightKg, targetWeightKg);
  if (effective === "lose" || effective === "build") {
    if (effective === "lose" && targetWeightKg >= weightKg) return 1;
    if (effective === "build" && targetWeightKg <= weightKg) return 1;
    return PACE_CALORIE_FACTOR[effective][pace];
  }
  return 1;
}

function caloricTargetKcal(input: {
  bmr: number;
  tdee: number;
  goalId: GoalId;
  pace: Pace;
  weightKg: number;
  targetWeightKg: number;
}): number {
  const factor = calorieFactorFor(
    input.goalId,
    input.pace,
    input.weightKg,
    input.targetWeightKg,
  );
  let calories = Math.round(input.tdee * factor);
  const effective = effectiveCalorieGoal(
    input.goalId,
    input.weightKg,
    input.targetWeightKg,
  );
  if (effective === "lose") {
    calories = Math.max(calories, Math.round(input.bmr * SAFE_CALORIE_FLOOR_OF_BMR));
  }
  return calories;
}

/**
 * Fraction of tissue change that comes from fat mass (rest from lean).
 * Positive energy balance → surplus partitioning; negative → deficit.
 */
export function fatPartitionRatio(input: {
  energyDeltaKcal: number;
  bodyFatPercent: number;
  experience: ExperienceLevel;
  pace: Pace;
}): number {
  const { energyDeltaKcal, bodyFatPercent, experience, pace } = input;
  const bf = bodyFatPercent / 100;
  const expBias =
    experience === "novice" ? 0.08 : experience === "advanced" ? -0.08 : 0;
  const paceBias =
    pace === "aggressive" ? -0.06 : pace === "slow" ? 0.04 : 0;

  if (energyDeltaKcal < 0) {
    // Deficit: higher BF / newer lifters → more fat loss, protect lean.
    // Low BF + advanced + aggressive → more lean risk.
    let fatFrac = 0.72 + bf * 0.35 + expBias + paceBias;
    if (bf < 0.12 && experience === "advanced") fatFrac -= 0.12;
    if (bf > 0.28 && experience === "novice") fatFrac += 0.08;
    return clamp(fatFrac, 0.45, 0.95);
  }

  if (energyDeltaKcal > 0) {
    // Surplus: novices gain more lean share; advanced mostly fat.
    // fatFrac here = share of *gain* that is fat.
    let fatFrac = 0.55 - expBias * 1.2 + (pace === "aggressive" ? 0.08 : 0);
    if (experience === "novice") fatFrac -= 0.1;
    if (experience === "advanced") fatFrac += 0.12;
    if (bf > 0.25) fatFrac += 0.05;
    return clamp(fatFrac, 0.35, 0.9);
  }

  return 0.7;
}

/**
 * Metabolic adaptation: prolonged deficit + lighter body → lower expenditure.
 * Returns a multiplier applied to TDEE (1 = none, down to ~0.88).
 */
function adaptationMultiplier(
  day: number,
  cumulativeDeficitKcal: number,
  startWeightKg: number,
  currentWeightKg: number,
): number {
  const prolonged = clamp(day / 90, 0, 1);
  const deficitLoad = clamp(Math.abs(cumulativeDeficitKcal) / (7700 * 8), 0, 1);
  const massLoss = clamp((startWeightKg - currentWeightKg) / startWeightKg, 0, 0.2);
  const down = 0.12 * prolonged * 0.5 + 0.08 * deficitLoad + 0.15 * massLoss;
  return clamp(1 - down, 0.86, 1);
}

/**
 * Early glycogen / water shift (kg). Deficit: sharp drop days 1–14.
 * Surplus: small early water bump.
 */
function glycogenWaterDeltaKg(
  day: number,
  energyDeltaKcal: number,
): number {
  if (day > 14 || energyDeltaKcal === 0) return 0;
  const phase = day <= 7 ? 1 : 0.45;
  if (energyDeltaKcal < 0) {
    // Spread ~1.6 kg water loss over two weeks, front-loaded.
    return -((1.6 * phase) / 7);
  }
  // Mild glycogen refill on surplus.
  return (0.6 * phase) / 7;
}

function splitEnergyToTissue(
  energyDeltaKcal: number,
  fatFrac: number,
): { dFatKg: number; dLeanKg: number } {
  if (energyDeltaKcal === 0) return { dFatKg: 0, dLeanKg: 0 };

  const losing = energyDeltaKcal < 0;
  const absKcal = Math.abs(energyDeltaKcal);

  if (losing) {
    const fatKcal = absKcal * fatFrac;
    const leanKcal = absKcal * (1 - fatFrac);
    return {
      dFatKg: -(fatKcal / KCAL_PER_KG_FAT),
      dLeanKg: -(leanKcal / KCAL_PER_KG_LEAN),
    };
  }

  const fatKcal = absKcal * fatFrac;
  const leanKcal = absKcal * (1 - fatFrac);
  return {
    dFatKg: fatKcal / KCAL_PER_KG_FAT,
    dLeanKg: leanKcal / KCAL_PER_KG_LEAN,
  };
}

/**
 * Novices in a modest deficit with higher BF can accrue tiny LBM if training
 * (recomp). Model as a small lean offset opposing lean loss.
 */
function recompLeanBonusKg(input: {
  energyDeltaKcal: number;
  experience: ExperienceLevel;
  bodyFatPercent: number;
  daysPerWeek: number;
}): number {
  if (input.energyDeltaKcal >= 0) return 0;
  if (input.experience !== "novice") return 0;
  if (input.bodyFatPercent < 18) return 0;
  const training = clamp(input.daysPerWeek / 5, 0.4, 1.2);
  // ~20–40 g lean / day early in a cut for new lifters — optimistic but bounded.
  return 0.025 * training;
}

export function projectBodyRecomposition(
  input: PredictionInput,
): PredictionResult {
  const warnings: string[] = [];
  const daysPerWeek = clampDays(input.daysPerWeek ?? 3);
  const experience = input.experience ?? "intermediate";
  const horizon = clamp(Math.round(input.horizonDays ?? 90), 14, 180);

  const weight0 = clamp(input.weightKg, 35, 250);
  const target = clamp(input.targetWeightKg, 35, 250);
  const age = clamp(input.age, 14, 90);
  const heightCm = clamp(input.heightCm, 120, 230);

  if (Math.abs(target - weight0) > 40) {
    warnings.push(
      "Target is far from current weight — projection capped; consider a nearer milestone.",
    );
  }

  const bf0 = resolveBodyFatPercent({
    ...input,
    weightKg: weight0,
    age,
    heightCm,
  });
  let fatMass = (bf0 / 100) * weight0;
  let leanMass = weight0 - fatMass;

  const bmr0 = mifflinStJeorBmr({
    gender: input.gender,
    weightKg: weight0,
    heightCm,
    age,
  });
  const tdee0 = bmr0 * activityMultiplier(daysPerWeek, input.activityLevel);

  const timeline: DayProjection[] = [];
  let cumulativeDeficit = 0;
  let dayReachedTarget: number | null =
    Math.abs(weight0 - target) <= TARGET_TOLERANCE_KG ? 0 : null;

  for (let day = 1; day <= horizon; day++) {
    const weight = leanMass + fatMass;
    const bfPct = (fatMass / Math.max(weight, 1)) * 100;

    const bmr = mifflinStJeorBmr({
      gender: input.gender,
      weightKg: weight,
      heightCm,
      age,
    });
    const rawTdee = bmr * activityMultiplier(daysPerWeek, input.activityLevel);
    const adapted =
      rawTdee *
      adaptationMultiplier(day, cumulativeDeficit, weight0, weight);

    const calories = caloricTargetKcal({
      bmr,
      tdee: adapted,
      goalId: input.goalId,
      pace: input.pace,
      weightKg: weight,
      targetWeightKg: target,
    });

    const energyDelta = calories - adapted;
    if (energyDelta < 0) cumulativeDeficit += -energyDelta;

    // Extreme deficit warning (model still runs with floor applied).
    const effectiveGoal = effectiveCalorieGoal(
      input.goalId,
      weight,
      target,
    );
    if (calories < bmr * 1.15 && effectiveGoal === "lose" && day === 1) {
      warnings.push(
        "Calorie target is near the safe floor — lean-mass loss risk is elevated.",
      );
    }

    const fatFrac = fatPartitionRatio({
      energyDeltaKcal: energyDelta,
      bodyFatPercent: bfPct,
      experience,
      pace: input.pace,
    });

    const { dFatKg, dLeanKg } = splitEnergyToTissue(energyDelta, fatFrac);
    const water = glycogenWaterDeltaKg(day, energyDelta);
    const leanBonus = recompLeanBonusKg({
      energyDeltaKcal: energyDelta,
      experience,
      bodyFatPercent: bfPct,
      daysPerWeek,
    });

    fatMass = Math.max(2, fatMass + dFatKg);
    // Water shifts attributed mostly to lean compartment (glycogen).
    leanMass = Math.max(20, leanMass + dLeanKg + water + leanBonus);

    const projectedWeight = leanMass + fatMass;

    timeline.push({
      day,
      projectedWeight: round1(projectedWeight),
      leanMass: round1(leanMass),
      fatMass: round1(fatMass),
      caloricTarget: Math.round(calories),
    });

    if (
      dayReachedTarget == null &&
      Math.abs(projectedWeight - target) <= TARGET_TOLERANCE_KG
    ) {
      dayReachedTarget = day;
    }

    // Stop early if we overshoot past target on a directed cut/bulk.
    const directed =
      input.goalId === "lose" ||
      input.goalId === "build" ||
      Math.abs(target - weight0) > TARGET_TOLERANCE_KG;
    if (
      directed &&
      dayReachedTarget == null &&
      target < weight0 &&
      projectedWeight < target - TARGET_TOLERANCE_KG
    ) {
      dayReachedTarget = day;
    }
    if (
      directed &&
      dayReachedTarget == null &&
      target > weight0 &&
      projectedWeight > target + TARGET_TOLERANCE_KG
    ) {
      dayReachedTarget = day;
    }
  }

  return {
    bmr: Math.round(bmr0),
    tdee: Math.round(tdee0),
    baselineBodyFatPercent: round1(bf0),
    baselineLeanMass: round1(weight0 - (bf0 / 100) * weight0),
    baselineFatMass: round1((bf0 / 100) * weight0),
    timeline,
    dayReachedTarget,
    warnings,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Sample weekly points from a daily timeline (day 7, 14, …). */
export function weeklySamples(timeline: DayProjection[]): DayProjection[] {
  return timeline.filter((p) => p.day % 7 === 0);
}

/**
 * Weeks until target from the recomposition simulation, capped for onboarding UI.
 */
export function weeksToTargetFromProjection(
  result: PredictionResult,
): number | null {
  if (result.dayReachedTarget == null) return null;
  if (result.dayReachedTarget === 0) return 0;
  const weeks = Math.ceil(result.dayReachedTarget / 7);
  return clamp(weeks, 1, MAX_TIMELINE_WEEKS);
}

export { MAX_TIMELINE_WEEKS };
