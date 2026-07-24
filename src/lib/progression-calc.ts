/**
 * computeProgressionSuggestion — pure function, no I/O.
 *
 * Rule (v1, deliberately simple):
 *   - Hit the TOP of the target rep range on every logged set last time
 *     → suggest increasing weight next session
 *   - Anything else (missed top, incomplete sets, no history)
 *     → maintain current weight, no suggestion pressure
 *
 * v2 candidate (not built): consistently missing the BOTTOM of the range
 * across 2+ sessions → suggest a deload. Left out per current scope —
 * this only handles the "going well" direction for now.
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
  lastSessionSets: LoggedSet[]; // sets from the most recent completed session for this exercise
}

export type ProgressionDirection = "increase" | "maintain" | "no_data";

export interface ProgressionSuggestion {
  exerciseName: string;
  lastWeight: number | null;
  suggestedWeight: number | null;
  direction: ProgressionDirection;
}

// Standard small-plate increment. Could eventually vary by exercise
// (upper body isolation vs. compound lower body movements often use
// different increment sizes in real programming), but one flat value
// is a reasonable v1 default.
const WEIGHT_INCREMENT_KG = 2.5;

export function computeProgressionSuggestion(
  input: ProgressionInput,
): ProgressionSuggestion {
  const { exerciseName, targetRepsMax, lastSessionSets } = input;

  const completedSets = lastSessionSets.filter((s) => s.completed);

  if (completedSets.length === 0) {
    return {
      exerciseName,
      lastWeight: null,
      suggestedWeight: null,
      direction: "no_data",
    };
  }

  const lastWeight = completedSets[completedSets.length - 1].weight ?? null;

  const hitTopEverySet = completedSets.every(
    (s) => (s.reps ?? 0) >= targetRepsMax,
  );

  if (hitTopEverySet && lastWeight !== null) {
    return {
      exerciseName,
      lastWeight,
      suggestedWeight: Math.round((lastWeight + WEIGHT_INCREMENT_KG) * 2) / 2, // round to nearest 0.5
      direction: "increase",
    };
  }

  return {
    exerciseName,
    lastWeight,
    suggestedWeight: lastWeight,
    direction: "maintain",
  };
}