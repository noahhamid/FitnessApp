/**
 * Pure helpers for the onboarding prediction screens. No I/O, so this is safe
 * to import from both the RN app (predicted-date, revised-prediction) and,
 * later, from the server if the same math is ever needed there.
 */

export type Pace = "slow" | "moderate" | "aggressive";
export type WeightGoalId = "lose" | "build";
export type GoalId = "lose" | "build" | "endure" | "health";

/** kg/week rate per goal + pace. Only "lose"/"build" have a real weight rate. */
const RATE_KG_PER_WEEK: Record<WeightGoalId, Record<Pace, number>> = {
  lose: { slow: 0.55, moderate: 0.9, aggressive: 1.35 },
  build: { slow: 0.25, moderate: 0.4, aggressive: 0.6 },
};

/** Soft ceiling so estimates stay in a short, motivating window. */
const MAX_TIMELINE_WEEKS = 14;

export function isWeightGoal(goalId: string): goalId is WeightGoalId {
  return goalId === "lose" || goalId === "build";
}

export function paceRateKgPerWeek(
  goalId: WeightGoalId,
  pace: Pace,
): number {
  return RATE_KG_PER_WEEK[goalId][pace];
}

/**
 * More training days per week modestly speeds up the estimate — used only
 * for the post-schedule "revised prediction" screen.
 */
export function frequencyBoost(daysPerWeek: number): number {
  const clamped = Math.max(2, Math.min(7, Math.round(daysPerWeek)));
  return 0.85 + 0.05 * clamped;
}

export type TimelineEstimate =
  | { type: "weight"; weeks: number; targetDate: Date; alreadyThere: boolean }
  | { type: "generic"; weeksLow: number; weeksHigh: number };

export function estimateTimeline(
  goalId: GoalId,
  currentKg: number,
  targetKg: number,
  pace: Pace,
  daysPerWeek?: number,
): TimelineEstimate {
  if (isWeightGoal(goalId)) {
    const deltaKg = Math.abs(targetKg - currentKg);
    if (deltaKg < 0.5) {
      return {
        type: "weight",
        weeks: 0,
        targetDate: new Date(),
        alreadyThere: true,
      };
    }

    const baseRate = paceRateKgPerWeek(goalId, pace);
    const rate = daysPerWeek
      ? baseRate * frequencyBoost(daysPerWeek)
      : baseRate;
    // ceil so we don't under-promise (10.1 weeks → 11, not 10).
    const weeks =
      rate > 0
        ? Math.max(1, Math.min(MAX_TIMELINE_WEEKS, Math.ceil(deltaKg / rate)))
        : 1;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + weeks * 7);
    return { type: "weight", weeks, targetDate, alreadyThere: false };
  }

  // Endure/health goals aren't weight-delta driven — give a generic,
  // pace-flavoured milestone window instead of a fake precise date.
  const [low, high] =
    pace === "aggressive" ? [2, 4] : pace === "moderate" ? [3, 6] : [5, 8];
  return { type: "generic", weeksLow: low, weeksHigh: high };
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
  const days = Math.max(2, Math.min(7, Math.round(daysPerWeek)));

  if (days === 2) return "Full Body";
  if (days === 3) return experience === "novice" ? "Full Body" : "Push / Pull / Legs";
  if (days === 4) return "Upper / Lower";
  if (days === 5) return "Push / Pull / Legs / Upper / Lower";
  if (days === 6) return "Push / Pull / Legs ×2";
  return "Push / Pull / Legs ×2 + Full Body";
}
