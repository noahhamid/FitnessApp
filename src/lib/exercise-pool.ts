/**
 * Static curated exercise pool. No DB table for this in v1 — it's a
 * fixed reference list, cheap to keep as code and iterate on directly.
 * If this needs to grow into something admin-editable later, promote
 * it to a real Exercise table with the same shape.
 */

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core";

export type MovementPattern =
  | "horizontal_push"
  | "horizontal_pull"
  | "vertical_push"
  | "vertical_pull"
  | "squat"
  | "hinge"
  | "isolation"
  | "core";

export type EquipmentAccess = "full_gym" | "home_dumbbells" | "bodyweight";

export interface ExerciseDef {
  name: string;
  muscleGroup: MuscleGroup;
  pattern: MovementPattern;
  // which equipment tiers CAN perform this exercise
  equipment: EquipmentAccess[];
}

export const EXERCISE_POOL: ExerciseDef[] = [
  // --- Chest ---
  { name: "Barbell Bench Press", muscleGroup: "chest", pattern: "horizontal_push", equipment: ["full_gym"] },
  { name: "Dumbbell Bench Press", muscleGroup: "chest", pattern: "horizontal_push", equipment: ["full_gym", "home_dumbbells"] },
  { name: "Incline Dumbbell Press", muscleGroup: "chest", pattern: "horizontal_push", equipment: ["full_gym", "home_dumbbells"] },
  { name: "Push-Up", muscleGroup: "chest", pattern: "horizontal_push", equipment: ["full_gym", "home_dumbbells", "bodyweight"] },
  { name: "Cable Fly", muscleGroup: "chest", pattern: "isolation", equipment: ["full_gym"] },
  { name: "Dumbbell Fly", muscleGroup: "chest", pattern: "isolation", equipment: ["full_gym", "home_dumbbells"] },

  // --- Back ---
  { name: "Barbell Row", muscleGroup: "back", pattern: "horizontal_pull", equipment: ["full_gym"] },
  { name: "Dumbbell Row", muscleGroup: "back", pattern: "horizontal_pull", equipment: ["full_gym", "home_dumbbells"] },
  { name: "Lat Pulldown", muscleGroup: "back", pattern: "vertical_pull", equipment: ["full_gym"] },
  { name: "Pull-Up", muscleGroup: "back", pattern: "vertical_pull", equipment: ["full_gym", "bodyweight"] },
  { name: "Inverted Row", muscleGroup: "back", pattern: "horizontal_pull", equipment: ["full_gym", "bodyweight"] },
  { name: "Seated Cable Row", muscleGroup: "back", pattern: "horizontal_pull", equipment: ["full_gym"] },

  // --- Shoulders ---
  { name: "Overhead Barbell Press", muscleGroup: "shoulders", pattern: "vertical_push", equipment: ["full_gym"] },
  { name: "Dumbbell Shoulder Press", muscleGroup: "shoulders", pattern: "vertical_push", equipment: ["full_gym", "home_dumbbells"] },
  { name: "Pike Push-Up", muscleGroup: "shoulders", pattern: "vertical_push", equipment: ["full_gym", "home_dumbbells", "bodyweight"] },
  { name: "Lateral Raise", muscleGroup: "shoulders", pattern: "isolation", equipment: ["full_gym", "home_dumbbells"] },
  { name: "Rear Delt Fly", muscleGroup: "shoulders", pattern: "isolation", equipment: ["full_gym", "home_dumbbells"] },

  // --- Biceps ---
  { name: "Barbell Curl", muscleGroup: "biceps", pattern: "isolation", equipment: ["full_gym"] },
  { name: "Dumbbell Curl", muscleGroup: "biceps", pattern: "isolation", equipment: ["full_gym", "home_dumbbells"] },
  { name: "Chin-Up", muscleGroup: "biceps", pattern: "vertical_pull", equipment: ["full_gym", "bodyweight"] },

  // --- Triceps ---
  { name: "Cable Triceps Pushdown", muscleGroup: "triceps", pattern: "isolation", equipment: ["full_gym"] },
  { name: "Dumbbell Overhead Extension", muscleGroup: "triceps", pattern: "isolation", equipment: ["full_gym", "home_dumbbells"] },
  { name: "Diamond Push-Up", muscleGroup: "triceps", pattern: "horizontal_push", equipment: ["full_gym", "home_dumbbells", "bodyweight"] },
  { name: "Bench Dip", muscleGroup: "triceps", pattern: "isolation", equipment: ["full_gym", "home_dumbbells", "bodyweight"] },

  // --- Quads ---
  { name: "Barbell Back Squat", muscleGroup: "quads", pattern: "squat", equipment: ["full_gym"] },
  { name: "Goblet Squat", muscleGroup: "quads", pattern: "squat", equipment: ["full_gym", "home_dumbbells"] },
  { name: "Bodyweight Squat", muscleGroup: "quads", pattern: "squat", equipment: ["full_gym", "home_dumbbells", "bodyweight"] },
  { name: "Walking Lunge", muscleGroup: "quads", pattern: "squat", equipment: ["full_gym", "home_dumbbells", "bodyweight"] },
  { name: "Leg Press", muscleGroup: "quads", pattern: "squat", equipment: ["full_gym"] },
  { name: "Bulgarian Split Squat", muscleGroup: "quads", pattern: "squat", equipment: ["full_gym", "home_dumbbells"] },

  // --- Hamstrings / Glutes ---
  { name: "Barbell Romanian Deadlift", muscleGroup: "hamstrings", pattern: "hinge", equipment: ["full_gym"] },
  { name: "Dumbbell Romanian Deadlift", muscleGroup: "hamstrings", pattern: "hinge", equipment: ["full_gym", "home_dumbbells"] },
  { name: "Glute Bridge", muscleGroup: "glutes", pattern: "hinge", equipment: ["full_gym", "home_dumbbells", "bodyweight"] },
  { name: "Hip Thrust", muscleGroup: "glutes", pattern: "hinge", equipment: ["full_gym", "home_dumbbells"] },
  { name: "Single-Leg Glute Bridge", muscleGroup: "glutes", pattern: "hinge", equipment: ["full_gym", "home_dumbbells", "bodyweight"] },
  { name: "Nordic Curl / Leg Curl", muscleGroup: "hamstrings", pattern: "isolation", equipment: ["full_gym"] },

  // --- Calves ---
  { name: "Standing Calf Raise", muscleGroup: "calves", pattern: "isolation", equipment: ["full_gym"] },
  { name: "Dumbbell Calf Raise", muscleGroup: "calves", pattern: "isolation", equipment: ["full_gym", "home_dumbbells"] },
  { name: "Bodyweight Calf Raise", muscleGroup: "calves", pattern: "isolation", equipment: ["full_gym", "home_dumbbells", "bodyweight"] },

  // --- Core ---
  { name: "Hanging Leg Raise", muscleGroup: "core", pattern: "core", equipment: ["full_gym"] },
  { name: "Plank", muscleGroup: "core", pattern: "core", equipment: ["full_gym", "home_dumbbells", "bodyweight"] },
  { name: "Cable Crunch", muscleGroup: "core", pattern: "core", equipment: ["full_gym"] },
  { name: "Dead Bug", muscleGroup: "core", pattern: "core", equipment: ["full_gym", "home_dumbbells", "bodyweight"] },
  { name: "Russian Twist", muscleGroup: "core", pattern: "core", equipment: ["full_gym", "home_dumbbells", "bodyweight"] },
];

export function exercisesFor(
  muscleGroup: MuscleGroup,
  equipment: EquipmentAccess,
): ExerciseDef[] {
  return EXERCISE_POOL.filter(
    (e) => e.muscleGroup === muscleGroup && e.equipment.includes(equipment),
  );
}