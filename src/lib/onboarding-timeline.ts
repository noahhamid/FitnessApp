/**
 * Pure helpers for the onboarding prediction screens. No I/O, so this is safe
 * to import from both the RN app (predicted-date, revised-prediction) and,
 * later, from the server if the same math is ever needed there.
 *
 * All goals use the body-recomposition simulation in body-recomp-prediction.ts.
 * Endure/health steer toward the chosen maintain weight the same way lose/build
 * steer toward a cut/bulk target.
 */

import {
  MAX_TIMELINE_WEEKS,
  projectBodyRecomposition,
  weeksToTargetFromProjection,
  type ExperienceLevel,
  type PredictionResult,
} from "./body-recomp-prediction";
import type { Gender } from "./nutrition-calc";

export type Pace = "slow" | "moderate" | "aggressive";
export type WeightGoalId = "lose" | "build";
export type GoalId = "lose" | "build" | "endure" | "health";

export type TimelineEstimate = {
  type: "weight";
  weeks: number;
  targetDate: Date;
  alreadyThere: boolean;
  /** Full simulation when demographics were available. */
  projection?: PredictionResult;
};

export type TimelineInput = {
  goalId: GoalId;
  currentKg: number;
  targetKg: number;
  pace: Pace;
  daysPerWeek?: number;
  gender?: Gender;
  age?: number;
  heightCm?: number;
  experience?: ExperienceLevel;
  bodyFatPercent?: number;
};

export function isWeightGoal(goalId: string): goalId is WeightGoalId {
  return goalId === "lose" || goalId === "build";
}

/** Map any goal + weight delta onto a cut/bulk rate table for linear fallback. */
function directedGoal(
  goalId: GoalId,
  currentKg: number,
  targetKg: number,
): WeightGoalId {
  if (goalId === "lose" || goalId === "build") return goalId;
  return targetKg < currentKg ? "lose" : "build";
}

export function paceRateKgPerWeek(
  goalId: WeightGoalId,
  pace: Pace,
): number {
  const RATE: Record<WeightGoalId, Record<Pace, number>> = {
    lose: { slow: 0.55, moderate: 0.9, aggressive: 1.35 },
    build: { slow: 0.25, moderate: 0.4, aggressive: 0.6 },
  };
  return RATE[goalId][pace];
}

export function frequencyBoost(daysPerWeek: number): number {
  const clamped = Math.max(1, Math.min(7, Math.round(daysPerWeek)));
  return 0.85 + 0.05 * clamped;
}

function fallbackLinearWeeks(
  goalId: GoalId,
  currentKg: number,
  targetKg: number,
  pace: Pace,
  daysPerWeek?: number,
): number {
  const deltaKg = Math.abs(targetKg - currentKg);
  const base = paceRateKgPerWeek(directedGoal(goalId, currentKg, targetKg), pace);
  const rate = daysPerWeek ? base * frequencyBoost(daysPerWeek) : base;
  return rate > 0
    ? Math.max(1, Math.min(MAX_TIMELINE_WEEKS, Math.ceil(deltaKg / rate)))
    : 1;
}

/** When the sim never quite hits target, extend from the late daily rate. */
function extrapolateWeeks(
  projection: PredictionResult,
  startKg: number,
  targetKg: number,
): number | null {
  const { timeline } = projection;
  if (timeline.length < 14) return null;
  const last = timeline[timeline.length - 1]!;
  const earlier = timeline[timeline.length - 15]!;
  const moved = last.projectedWeight - earlier.projectedWeight;
  const towardTarget =
    (targetKg - startKg) * moved > 0 ||
    Math.abs(targetKg - last.projectedWeight) <
      Math.abs(targetKg - startKg);
  if (!towardTarget) return null;

  const ratePerDay = Math.abs(moved) / 14;
  if (ratePerDay < 0.005) return null;

  const remaining = Math.abs(targetKg - last.projectedWeight);
  const extraDays = remaining / ratePerDay;
  const totalDays = last.day + extraDays;
  return Math.max(
    1,
    Math.min(MAX_TIMELINE_WEEKS, Math.ceil(totalDays / 7)),
  );
}

export function estimateTimeline(
  goalIdOrInput: GoalId | TimelineInput,
  currentKg?: number,
  targetKg?: number,
  pace?: Pace,
  daysPerWeek?: number,
): TimelineEstimate {
  const input: TimelineInput =
    typeof goalIdOrInput === "object"
      ? goalIdOrInput
      : {
          goalId: goalIdOrInput,
          currentKg: currentKg ?? 70,
          targetKg: targetKg ?? currentKg ?? 70,
          pace: pace ?? "moderate",
          daysPerWeek,
        };

  const {
    goalId,
    currentKg: startKg,
    targetKg: endKg,
    pace: paceChoice,
    daysPerWeek: trainingDays,
    gender,
    age,
    heightCm,
    experience,
    bodyFatPercent,
  } = input;

  const deltaKg = Math.abs(endKg - startKg);
  if (deltaKg < 0.5) {
    return {
      type: "weight",
      weeks: 0,
      targetDate: new Date(),
      alreadyThere: true,
    };
  }

  const canSimulate =
    gender != null &&
    age != null &&
    heightCm != null &&
    Number.isFinite(age) &&
    Number.isFinite(heightCm);

  let weeks: number;
  let projection: PredictionResult | undefined;

  if (canSimulate) {
    projection = projectBodyRecomposition({
      gender,
      age: age!,
      heightCm: heightCm!,
      weightKg: startKg,
      targetWeightKg: endKg,
      goalId,
      pace: paceChoice,
      daysPerWeek: trainingDays ?? 3,
      experience: experience ?? "intermediate",
      horizonDays: MAX_TIMELINE_WEEKS * 7 + 21,
      bodyFatPercent,
    });
    const fromSim = weeksToTargetFromProjection(projection);
    if (fromSim != null) {
      weeks = fromSim;
    } else {
      weeks =
        extrapolateWeeks(projection, startKg, endKg) ??
        fallbackLinearWeeks(
          goalId,
          startKg,
          endKg,
          paceChoice,
          trainingDays,
        );
    }
  } else {
    weeks = fallbackLinearWeeks(
      goalId,
      startKg,
      endKg,
      paceChoice,
      trainingDays,
    );
  }

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + weeks * 7);
  return {
    type: "weight",
    weeks,
    targetDate,
    alreadyThere: false,
    projection,
  };
}

export function formatTargetDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Split-label preview only (no exercise selection), duplicated intentionally
 * from the server-side generator so the RN bundle never imports Prisma.
 * Keep in sync with getSplitTemplate in src/lib/workout-plan-generator.ts.
 */
export function previewSplitLabel(
  daysPerWeek: number,
  experience: "novice" | "intermediate" | "advanced",
): string {
  const days = Math.max(1, Math.min(7, Math.round(daysPerWeek)));

  if (days === 1) return "Full Body";
  if (days === 2) return "Full Body";
  if (days === 3) return experience === "novice" ? "Full Body" : "Push / Pull / Legs";
  if (days === 4) return "Upper / Lower";
  if (days === 5) return "Push / Pull / Legs / Upper / Lower";
  if (days === 6) return "Push / Pull / Legs ×2";
  return "Push / Pull / Legs ×2 + Full Body";
}
