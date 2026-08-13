/**
 * computeProgressionSuggestion — pure function, no I/O.
 *
 * Double progression: reps climb inside the target range first, load only
 * moves once the top of the range is earned on every set.
 *
 *   - Top of range on every completed set     → add load, reset reps to the bottom
 *   - Inside the range (≥ bottom, < top)      → add reps at the same load
 *   - Below the bottom of the range           → deload the load
 *   - Fewer sets logged than prescribed       → repeat the same session
 *   - No completed history                    → no suggestion
 *
 * Load steps scale with the lift: a curl should not jump the same 2.5 kg as a
 * squat, so the increment is a percentage of working weight with a small
 * absolute floor (plate reality) and cap.
 */

export interface LoggedSet {
  reps?: number;
  weight?: number;
  completed?: boolean;
}

export interface ProgressionInput {
  exerciseName: string;
  targetRepsMin: number;
  targetRepsMax: number;
  /** Prescribed set count; used to detect an unfinished session. */
  targetSets?: number;
  lastSessionSets: LoggedSet[]; // sets from the most recent completed session for this exercise
}

export type ProgressionDirection =
  | "increase"
  | "add_reps"
  | "maintain"
  | "deload"
  | "no_data";

export interface ProgressionSuggestion {
  exerciseName: string;
  lastWeight: number | null;
  suggestedWeight: number | null;
  direction: ProgressionDirection;
  /** Reps to chase next session at `suggestedWeight`. */
  suggestedReps: number | null;
  /** Lowest completed rep count last session — what the decision keyed off. */
  lowestReps: number | null;
}

/**
 * Load step as a fraction of working weight, bounded by what plates allow.
 * ~5% keeps a 100 kg squat moving 5 kg while a 10 kg curl moves the minimum.
 */
const LOAD_STEP_FRACTION = 0.05;
const MIN_LOAD_STEP_KG = 1.25;
const MAX_LOAD_STEP_KG = 5;

/** Deload depth once reps fall under the prescribed range. */
const DELOAD_FRACTION = 0.1;

/** Round to the nearest half kilo — the smallest increment most gyms have. */
function roundToPlate(kg: number): number {
  return Math.round(kg * 2) / 2;
}

function loadStepKg(weight: number): number {
  const raw = weight * LOAD_STEP_FRACTION;
  return Math.min(MAX_LOAD_STEP_KG, Math.max(MIN_LOAD_STEP_KG, raw));
}

export function computeProgressionSuggestion(
  input: ProgressionInput,
): ProgressionSuggestion {
  const {
    exerciseName,
    targetRepsMin,
    targetRepsMax,
    targetSets,
    lastSessionSets,
  } = input;

  const completedSets = lastSessionSets.filter((s) => s.completed);

  if (completedSets.length === 0) {
    return {
      exerciseName,
      lastWeight: null,
      suggestedWeight: null,
      direction: "no_data",
      suggestedReps: null,
      lowestReps: null,
    };
  }

  const lastWeight = completedSets[completedSets.length - 1].weight ?? null;
  const repCounts = completedSets.map((s) => s.reps ?? 0);
  const lowestReps = Math.min(...repCounts);

  const base = {
    exerciseName,
    lastWeight,
    lowestReps,
  };

  // Bodyweight / unloaded work has no load to move — progress reps only.
  if (lastWeight === null || lastWeight <= 0) {
    const hitTop = lowestReps >= targetRepsMax;
    return {
      ...base,
      suggestedWeight: lastWeight,
      direction: hitTop ? "maintain" : "add_reps",
      suggestedReps: hitTop ? targetRepsMax : Math.min(targetRepsMax, lowestReps + 1),
    };
  }

  // Session cut short — repeat it rather than reading it as a failed set.
  if (targetSets != null && completedSets.length < targetSets) {
    return {
      ...base,
      suggestedWeight: lastWeight,
      direction: "maintain",
      suggestedReps: Math.max(targetRepsMin, lowestReps),
    };
  }

  if (lowestReps >= targetRepsMax) {
    return {
      ...base,
      suggestedWeight: roundToPlate(lastWeight + loadStepKg(lastWeight)),
      direction: "increase",
      // Fresh load starts at the bottom of the range again.
      suggestedReps: targetRepsMin,
    };
  }

  if (lowestReps < targetRepsMin) {
    const deloaded = roundToPlate(lastWeight * (1 - DELOAD_FRACTION));
    // Never "deload" into the same or a heavier number after rounding.
    const step = loadStepKg(lastWeight);
    const suggestedWeight = Math.max(0, Math.min(deloaded, lastWeight - step));
    return {
      ...base,
      suggestedWeight,
      direction: "deload",
      suggestedReps: targetRepsMin,
    };
  }

  return {
    ...base,
    suggestedWeight: lastWeight,
    direction: "add_reps",
    suggestedReps: Math.min(targetRepsMax, lowestReps + 1),
  };
}
