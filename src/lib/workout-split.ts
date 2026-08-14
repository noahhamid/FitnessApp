/**
 * Pure split-filling: given a weekly split and a candidate exercise pool,
 * decide which exercises land on which day, and at what sets/reps.
 *
 * Deliberately free of Prisma and React Native imports (unlike
 * workout-plan-generator.ts, which queries the Exercise table) so the same
 * logic can run in the RN bundle, in scripts, and in tests. That is also why
 * the unions below are redeclared here rather than imported from the
 * generator — importing it would drag Prisma in. Keep them in sync.
 */
import { canPerform, type EquipmentAccess } from "./equipment-rank";
import type { MuscleGroup } from "./exercise-pool";

export type MovementPattern = "push" | "pull" | "hinge" | "squat" | "carry";

/** Mirrors ExperienceLevel in src/lib/workout-plan-generator.ts. */
export type ExperienceLevel = "novice" | "intermediate" | "advanced";

/** Mirrors GoalId in src/lib/workout-plan-generator.ts. */
export type GoalId = "lose" | "build" | "endure" | "health";

export type ExercisePoolItem = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  movementPattern: MovementPattern;
  minEquipment: EquipmentAccess;
};

/** One training day of a weekly split, before exercises are chosen. */
export type SplitDay = {
  label: string;
  muscleGroups: MuscleGroup[];
};

export type PlannedExercise = {
  exerciseId: string;
  name: string;
  orderIndex: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
};

export type PlannedDay = {
  label: string;
  exercises: PlannedExercise[];
};

/** Rep targets per goal — same values as REP_RANGE_BY_GOAL in the generator. */
export const REP_RANGES: Record<GoalId, { min: number; max: number }> = {
  lose: { min: 10, max: 15 },
  build: { min: 6, max: 12 },
  endure: { min: 15, max: 20 },
  health: { min: 8, max: 15 },
};

/** Base working sets per exercise — same values as SETS_BY_EXPERIENCE. */
const SETS_BY_EXPERIENCE: Record<ExperienceLevel, number> = {
  novice: 3,
  intermediate: 4,
  advanced: 4,
};

/**
 * Small / assistance groups carry less per-session work than the big
 * compound-driven groups, so they get fewer slots on any given day.
 */
const SMALL_GROUPS = new Set<MuscleGroup>(["biceps", "triceps", "calves", "core"]);

/**
 * How many days per week each muscle group is trained, derived from the split
 * itself. Drives per-session volume: a group trained once a week needs more in
 * that one session than a group trained three times.
 */
export function computeWeeklyFrequency(
  split: SplitDay[],
): Partial<Record<MuscleGroup, number>> {
  const frequency: Partial<Record<MuscleGroup, number>> = {};

  for (const day of split) {
    // A group listed twice on one day is still one exposure for that day.
    for (const muscleGroup of new Set(day.muscleGroups)) {
      frequency[muscleGroup] = (frequency[muscleGroup] ?? 0) + 1;
    }
  }

  return frequency;
}

/**
 * Per-session prescription for one muscle group: how many exercises to give it
 * today, and how many sets each. Weekly volume is spread across however many
 * sessions the split already assigns to that group, so training a group more
 * often makes each session lighter rather than tripling total work.
 */
export function prescribeVolume(
  muscleGroup: MuscleGroup,
  weeklyFrequency: Partial<Record<MuscleGroup, number>>,
  experience: ExperienceLevel,
): { exercisesPerDay: number; setsPerExercise: number } {
  const frequency = weeklyFrequency[muscleGroup] ?? 1;

  let exercisesPerDay = SMALL_GROUPS.has(muscleGroup) ? 1 : 2;
  if (frequency <= 1) {
    // Only shot at this group all week — add a slot.
    exercisesPerDay += 1;
  } else if (frequency >= 3) {
    exercisesPerDay = Math.max(1, exercisesPerDay - 1);
  }

  let setsPerExercise = SETS_BY_EXPERIENCE[experience];
  if (frequency >= 3) {
    setsPerExercise = Math.max(2, setsPerExercise - 1);
  }

  return { exercisesPerDay, setsPerExercise };
}

export function fillSplitWithExercises(
  split: SplitDay[],
  experience: ExperienceLevel,
  userEquipment: EquipmentAccess,
  goalId: GoalId,
  exercisePool: ExercisePoolItem[],
): PlannedDay[] {
  const weeklyFrequency = computeWeeklyFrequency(split);
  const repRange = REP_RANGES[goalId];

  // Tracks how many exercises we've already used per muscle group, so if the
  // same muscle group appears on two days we advance through the pool instead
  // of silently repeating from index 0 every time.
  const cursor: Partial<Record<MuscleGroup, number>> = {};

  return split.map((day) => {
    let orderIndex = 0;
    const exercises: PlannedExercise[] = [];

    for (const muscleGroup of day.muscleGroups) {
      const { exercisesPerDay, setsPerExercise } = prescribeVolume(
        muscleGroup,
        weeklyFrequency,
        experience,
      );

      const candidates = exercisePool.filter(
        (ex) =>
          ex.muscleGroup === muscleGroup &&
          canPerform(ex.minEquipment, userEquipment),
      );

      if (candidates.length === 0) {
        // No exercise exists for this muscle group at this equipment tier —
        // skip rather than throw, so a sparse catalog degrades gracefully
        // instead of failing the whole generation.
        continue;
      }

      // Never hand the same movement to a day twice — with a thin pool the
      // wrap-around would otherwise emit "Hip Thrust" three times in a row.
      const slots = Math.min(exercisesPerDay, candidates.length);
      // When the pool can't fill every slot, add a set back rather than
      // silently shipping a fraction of the intended volume for that group.
      const targetSets =
        slots < exercisesPerDay ? setsPerExercise + 1 : setsPerExercise;

      const start = cursor[muscleGroup] ?? 0;
      for (let i = 0; i < slots; i++) {
        const pick = candidates[(start + i) % candidates.length];
        exercises.push({
          exerciseId: pick.id,
          name: pick.name,
          orderIndex: orderIndex++,
          targetSets,
          targetRepsMin: repRange.min,
          targetRepsMax: repRange.max,
        });
      }
      cursor[muscleGroup] = start + slots;
    }

    return { label: day.label, exercises };
  });
}
