/**
 * Adaptive nutrition suggestion — pure calc, no I/O.
 *
 * Compares recent WeightLog trend vs the weekly % bodyweight change implied
 * by the user's goalId, then proposes a daily calorie delta (never applied
 * here — callers only surface a suggestion).
 *
 * All rate units are kg/week unless named otherwise.
 */

import type { GoalId } from "./nutrition-calc";

// ── Constants ───────────────────────────────────────────────────────────────

/** Lookback window for weight samples. */
export const ADAPTIVE_WINDOW_DAYS = 14;

/** Minimum distinct weigh-ins inside the window before we compute a trend. */
export const MIN_WEIGHT_ENTRIES = 4;

/**
 * Rule-of-thumb energy density of body mass used for deficit/surplus math.
 * (~3500 kcal/lb ≈ 7700 kcal/kg). Coarse heuristic, not individual RMR.
 */
export const KCAL_PER_KG = 7700;

/** Cap |daily calorie suggestion| at this fraction of current target. */
export const MAX_ADJUSTMENT_FRACTION = 0.1;

/**
 * How close the client's suggestedCalories must be to a freshly recomputed
 * server suggestion when applying. Larger drift means weights/goal changed
 * since fetch — reject as stale rather than applying a dated number.
 */
export const APPLY_SUGGESTION_TOLERANCE_KCAL = 25;

/**
 * Absolute floor for suggested daily calories.
 *
 * REVIEW BEFORE SHIPPING TO REAL USERS — this is a conservative engineering
 * fallback, NOT a verified medical / dietetic minimum. Individual needs vary
 * (sex, size, age, lean mass). Do not treat 1500 as clinically endorsed.
 */
export const MINIMUM_SAFE_CALORIES_FALLBACK = 1500;

/**
 * Expected weekly change as a FRACTION of current bodyweight (not flat kg).
 * Midpoints of the bands in the product brief:
 *   lose:  -0.5% … -0.75%  → midpoint -0.625%
 *   build: +0.25% … +0.40% → midpoint +0.30%
 *   health / endure: ~0% (maintenance)
 */
const EXPECTED_PCT_PER_WEEK: Record<GoalId, number> = {
  lose: -0.00625,
  build: 0.003,
  endure: 0, // treated as maintain (same as health)
  health: 0,
};

/**
 * For maintenance goals: |actualRatePct| below this → "on track".
 * (±0.15% bodyweight / week)
 */
const MAINTAIN_TOLERANCE_PCT = 0.0015;

/**
 * For lose/build: actual is "on track" if within this fraction of |expected|.
 * e.g. 0.30 → actual may deviate up to 30% from the expected kg/week rate.
 */
const RATE_TOLERANCE_FRACTION = 0.3;

// ── Types ───────────────────────────────────────────────────────────────────

export type WeightSample = {
  /** YYYY-MM-DD */
  logDate: string;
  weightKg: number;
};

export type TrendSummary = {
  windowDays: number;
  entriesCounted: number;
  startAvgKg: number;
  endAvgKg: number;
  /** Calendar span between start-cohort first day and end-cohort last day ÷ 7. */
  weeksInWindow: number;
  /** (endAvg − startAvg) / weeksInWindow */
  actualRateKgPerWeek: number;
  /** currentWeight × expectedPct (midpoint for the goal) */
  expectedRateKgPerWeek: number;
  /** Signed fraction, e.g. -0.00625 for lose */
  expectedRatePctPerWeek: number;
  goalId: GoalId;
  currentWeightKg: number;
};

export type AdaptiveSuggestion =
  | {
      eligible: false;
      reason:
        | "insufficient_data"
        | "missing_profile"
        | "missing_nutrition_goal"
        | "invalid_goal";
      entriesFound?: number;
      entriesNeeded?: number;
    }
  | {
      eligible: true;
      adjustmentNeeded: false;
      currentTrendSummary: TrendSummary;
    }
  | {
      eligible: true;
      adjustmentNeeded: true;
      currentTrendSummary: TrendSummary;
      currentCalories: number;
      /** Suggested new daily calorie target (after cap + floor). */
      suggestedCalories: number;
      /** Signed daily kcal change applied after cap/floor (suggested − current). */
      delta: number;
      /** Raw daily kcal from gap math, before ±10% cap and before floor. */
      uncappedDelta: number;
      deltaDirection: "increase" | "decrease";
      explanation: string;
      /** True if ±10% cap shrunk |uncappedDelta|. */
      capApplied: boolean;
      /**
       * True if suggested calories were raised to
       * MINIMUM_SAFE_CALORIES_FALLBACK after other math.
       */
      floorApplied: boolean;
    };

// ── Math helpers ────────────────────────────────────────────────────────────

function average(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function parseUtcDay(iso: string): number {
  return new Date(`${iso}T00:00:00.000Z`).getTime();
}

/**
 * How many weigh-ins to average at each end of the series.
 * Prefer 4 when we have enough samples; otherwise 3; with only 4–5 entries
 * use half so start/end cohorts don't fully collapse into one set.
 */
function cohortSize(entryCount: number): number {
  if (entryCount >= 8) return 4;
  if (entryCount >= 6) return 3;
  return Math.floor(entryCount / 2); // 2 when n === 4 or 5
}

function isMaintainGoal(goalId: GoalId): boolean {
  return goalId === "health" || goalId === "endure";
}

/**
 * Gap in kg/week that calories should close:
 *   gap = expectedRate − actualRate
 *
 * Examples (lose, expected ≈ −0.5 kg/wk):
 *   actual 0 (stable)     → gap −0.5 → need more loss → cut calories
 *   actual −1.5 (too fast)→ gap +1.0 → slow loss     → add calories
 */
function rateOnTrack(
  goalId: GoalId,
  actualRateKgPerWeek: number,
  expectedRateKgPerWeek: number,
  currentWeightKg: number,
): boolean {
  if (isMaintainGoal(goalId)) {
    const band = currentWeightKg * MAINTAIN_TOLERANCE_PCT;
    return Math.abs(actualRateKgPerWeek) <= band;
  }

  const tol = Math.abs(expectedRateKgPerWeek) * RATE_TOLERANCE_FRACTION;
  return Math.abs(actualRateKgPerWeek - expectedRateKgPerWeek) <= tol;
}

function buildExplanation(
  goalId: GoalId,
  actualRateKgPerWeek: number,
  expectedRateKgPerWeek: number,
  deltaDirection: "increase" | "decrease",
): string {
  const actual = actualRateKgPerWeek;
  const pretty = (kg: number) =>
    `${kg >= 0 ? "+" : ""}${kg.toFixed(2)} kg/week`;

  if (goalId === "lose") {
    if (deltaDirection === "decrease") {
      return `Your weight has been ${pretty(actual)}, but your goal expects about ${pretty(expectedRateKgPerWeek)}. A small calorie reduction would help close that gap.`;
    }
    return `You've been losing faster than the planned ~${pretty(expectedRateKgPerWeek)} (${pretty(actual)}). A small calorie increase would slow the pace toward a safer rate.`;
  }

  if (goalId === "build") {
    if (deltaDirection === "increase") {
      return `Your weight has been ${pretty(actual)}, but muscle-gain targets expect about ${pretty(expectedRateKgPerWeek)}. A small calorie increase would help close that gap.`;
    }
    return `You've been gaining faster than the planned ~${pretty(expectedRateKgPerWeek)} (${pretty(actual)}). A small calorie reduction would slow surplus fat gain.`;
  }

  // health / endure (maintain)
  if (deltaDirection === "decrease") {
    return `Your weight has been drifting up (${pretty(actual)}) while your goal is maintenance. A small calorie reduction would help stabilize.`;
  }
  return `Your weight has been drifting down (${pretty(actual)}) while your goal is maintenance. A small calorie increase would help stabilize.`;
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Compute an adaptive calorie suggestion from recent weigh-ins.
 *
 * @param entries - WeightLog rows (any order); filtered to `asOf`−14d here.
 * @param goalId - lose | build | endure | health
 * @param currentCalories - NutritionGoal.calories (current daily target)
 * @param asOf - YYYY-MM-DD end of window (defaults handled by caller)
 */
export function computeAdaptiveSuggestion(input: {
  entries: WeightSample[];
  goalId: GoalId | string | null | undefined;
  currentCalories: number | null | undefined;
  asOf: string; // YYYY-MM-DD
}): AdaptiveSuggestion {
  const { entries, asOf } = input;

  // ── Guards that skip math entirely ──────────────────────────────────────
  if (!input.goalId) {
    return { eligible: false, reason: "missing_profile" };
  }
  if (
    input.goalId !== "lose" &&
    input.goalId !== "build" &&
    input.goalId !== "endure" &&
    input.goalId !== "health"
  ) {
    return { eligible: false, reason: "invalid_goal" };
  }
  const goalId = input.goalId;

  if (
    input.currentCalories == null ||
    !Number.isFinite(input.currentCalories) ||
    input.currentCalories <= 0
  ) {
    return { eligible: false, reason: "missing_nutrition_goal" };
  }
  const currentCalories = Math.round(input.currentCalories);

  // ── 1. Minimum data check ───────────────────────────────────────────────
  const windowStartMs =
    parseUtcDay(asOf) - (ADAPTIVE_WINDOW_DAYS - 1) * 86_400_000;
  const windowEndMs = parseUtcDay(asOf);

  const inWindow = entries
    .filter((e) => {
      const t = parseUtcDay(e.logDate);
      return t >= windowStartMs && t <= windowEndMs && e.weightKg > 0;
    })
    .sort((a, b) => parseUtcDay(a.logDate) - parseUtcDay(b.logDate));

  if (inWindow.length < MIN_WEIGHT_ENTRIES) {
    return {
      eligible: false,
      reason: "insufficient_data",
      entriesFound: inWindow.length,
      entriesNeeded: MIN_WEIGHT_ENTRIES - inWindow.length,
    };
  }

  // ── 2. Trend — smooth start/end averages ────────────────────────────────
  //
  //   startAvg = mean of first K weigh-ins in the window
  //   endAvg   = mean of last  K weigh-ins in the window
  //
  //   weeksInWindow = (lastDayOfEndCohort − firstDayOfStartCohort) / 7
  //   actualRate    = (endAvg − startAvg) / weeksInWindow     [kg/week]
  //
  const k = cohortSize(inWindow.length);
  const startCohort = inWindow.slice(0, k);
  const endCohort = inWindow.slice(inWindow.length - k);

  const startAvgKg = average(startCohort.map((e) => e.weightKg));
  const endAvgKg = average(endCohort.map((e) => e.weightKg));

  const spanDays =
    (parseUtcDay(endCohort[endCohort.length - 1].logDate) -
      parseUtcDay(startCohort[0].logDate)) /
    86_400_000;
  // Avoid divide-by-zero if every sample shares one calendar day.
  const weeksInWindow = Math.max(spanDays / 7, 1 / 7);

  const actualRateKgPerWeek = (endAvgKg - startAvgKg) / weeksInWindow;

  // ── 3. Expected rate from goal × current bodyweight ─────────────────────
  //
  //   expectedPct        = midpoint % from EXPECTED_PCT_PER_WEEK[goal]
  //   currentWeight      ≈ endAvg (most recent smoothed weight)
  //   expectedRateKg/wk  = currentWeight × expectedPct
  //
  const currentWeightKg = endAvgKg;
  const expectedRatePctPerWeek = EXPECTED_PCT_PER_WEEK[goalId];
  const expectedRateKgPerWeek = currentWeightKg * expectedRatePctPerWeek;

  const currentTrendSummary: TrendSummary = {
    windowDays: ADAPTIVE_WINDOW_DAYS,
    entriesCounted: inWindow.length,
    startAvgKg: round2(startAvgKg),
    endAvgKg: round2(endAvgKg),
    weeksInWindow: round3(weeksInWindow),
    actualRateKgPerWeek: round3(actualRateKgPerWeek),
    expectedRateKgPerWeek: round3(expectedRateKgPerWeek),
    expectedRatePctPerWeek,
    goalId,
    currentWeightKg: round2(currentWeightKg),
  };

  // ── 4. Gap check — on track? ────────────────────────────────────────────
  if (
    rateOnTrack(
      goalId,
      actualRateKgPerWeek,
      expectedRateKgPerWeek,
      currentWeightKg,
    )
  ) {
    return {
      eligible: true,
      adjustmentNeeded: false,
      currentTrendSummary,
    };
  }

  // ── 5. Calorie delta from gap ───────────────────────────────────────────
  //
  //   gapKg/wk     = expectedRate − actualRate
  //   uncappedDelta (kcal/day) = gapKg/wk × 7700 / 7
  //
  //   Cap |delta| at 10% of currentCalories, then apply floor.
  //
  const gapKgPerWeek = expectedRateKgPerWeek - actualRateKgPerWeek;
  const uncappedDelta = (gapKgPerWeek * KCAL_PER_KG) / 7;

  const maxAbsDelta = currentCalories * MAX_ADJUSTMENT_FRACTION;
  const cappedDelta = clamp(uncappedDelta, -maxAbsDelta, maxAbsDelta);
  const capApplied = Math.abs(uncappedDelta) > Math.abs(cappedDelta) + 1e-9;

  let suggestedCalories = Math.round(currentCalories + cappedDelta);
  let floorApplied = false;

  // ── 6. Safety floor ─────────────────────────────────────────────────────
  if (suggestedCalories < MINIMUM_SAFE_CALORIES_FALLBACK) {
    suggestedCalories = MINIMUM_SAFE_CALORIES_FALLBACK;
    floorApplied = true;
  }

  const delta = suggestedCalories - currentCalories;
  // If floor or rounding produced a no-op, treat as no adjustment.
  if (delta === 0) {
    return {
      eligible: true,
      adjustmentNeeded: false,
      currentTrendSummary,
    };
  }

  const deltaDirection: "increase" | "decrease" =
    delta > 0 ? "increase" : "decrease";

  return {
    eligible: true,
    adjustmentNeeded: true,
    currentTrendSummary,
    currentCalories,
    suggestedCalories,
    delta,
    uncappedDelta: Math.round(uncappedDelta),
    deltaDirection,
    explanation: buildExplanation(
      goalId,
      actualRateKgPerWeek,
      expectedRateKgPerWeek,
      deltaDirection,
    ),
    capApplied,
    floorApplied,
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function round3(n: number) {
  return Math.round(n * 1000) / 1000;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}
