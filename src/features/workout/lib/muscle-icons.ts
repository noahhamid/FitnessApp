import type { ComponentType } from "react";
import {
  Dumbbell,
  PersonStanding,
  CircleDot,
  Layers,
  type LucideProps,
} from "lucide-react-native";

/** Shared muscle-group → icon map (ContinueWorkoutCard chips, library rows). */
export const MUSCLE_ICON: Record<string, ComponentType<LucideProps>> = {
  chest: Dumbbell,
  back: Layers,
  shoulders: CircleDot,
  quads: PersonStanding,
  hamstrings: PersonStanding,
  glutes: PersonStanding,
  calves: PersonStanding,
  biceps: Dumbbell,
  triceps: Dumbbell,
  core: CircleDot,
};

export function muscleIconFor(
  muscleGroup: string | undefined,
): ComponentType<LucideProps> {
  if (!muscleGroup) return Dumbbell;
  return MUSCLE_ICON[muscleGroup.toLowerCase()] ?? Dumbbell;
}

/** Short human labels for movementPattern values from the exercise schema. */
const MOVEMENT_LABEL: Record<string, string> = {
  horizontal_push: "Push",
  vertical_push: "Push",
  horizontal_pull: "Pull",
  vertical_pull: "Pull",
  squat: "Squat",
  hinge: "Hinge",
  isolation: "Isolation",
  core: "Core",
  carry: "Carry",
};

export function formatMuscleGroup(muscleGroup: string): string {
  if (!muscleGroup) return "";
  return muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1);
}

export function formatMovementPattern(pattern: string): string {
  if (!pattern) return "";
  return (
    MOVEMENT_LABEL[pattern] ??
    pattern
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}
