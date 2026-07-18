import { canPerform, type EquipmentAccess } from "./equipment-rank";

export type MovementPattern = "push" | "pull" | "hinge" | "squat" | "carry";

export type ExercisePoolItem = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  movementPattern: MovementPattern;
  minEquipment: EquipmentAccess;
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

      const start = cursor[muscleGroup] ?? 0;
      for (let i = 0; i < exercisesPerDay; i++) {
        const pick = candidates[(start + i) % candidates.length];
        exercises.push({
          exerciseId: pick.id,
          name: pick.name,
          orderIndex: orderIndex++,
          targetSets: setsPerExercise,
          targetRepsMin: repRange.min,
          targetRepsMax: repRange.max,
        });
      }
      cursor[muscleGroup] = start + exercisesPerDay;
    }

    return { label: day.label, exercises };
  });
}