import type { WorkoutPlan, Exercise, ExerciseType } from "@/src/features/workout/data/workouts";
import { Image } from "react-native";
import { dayTitleFromMuscleGroups } from "@/src/lib/plan-day-title";

// ── Types matching the real backend response (GET /api/workouts/plan) ──
export interface ApiPlanExercise {
  id: string;
  orderIndex: number;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  movementPattern: string;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
}

export interface ApiPlanDay {
  id: string;
  dayIndex: number;
  label: string;
  exercises: ApiPlanExercise[];
}

export interface ApiWorkoutPlan {
  id: string;
  splitLabel: string;
  daysPerWeek: number;
  /** Chosen weekdays, Monday-indexed. Empty = default pattern for daysPerWeek. */
  trainingDays: number[];
  goalId: string;
  experience: string;
  equipment: string;
  updatedAt: string;
  days: ApiPlanDay[];
}

// ── Fill-in defaults for fields the backend doesn't generate ──

// Rest time by goal — shorter rest for lose/endure (metabolic, higher rep),
// longer for build (strength-focused recovery), moderate for health.
const REST_SEC_BY_GOAL: Record<string, number> = {
  lose: 45,
  build: 90,
  endure: 30,
  health: 60,
};

// Shared local placeholder — do not use dataset GIFs/images (copyrighted).
// `require` at module scope is fine (Metro static asset); resolving to a URI
// must be lazy — Image.resolveAssetSource is unavailable during
// `expo export:embed` (Node bundling), which evaluates modules on import.
const EXERCISE_PLACEHOLDER = require("../../assets/images/exercise-placeholder.jpg");

let exercisePlaceholderUri: string | undefined;

const COVER_BY_LABEL_HINT: { match: RegExp; url: string }[] = [
  { match: /push|chest|triceps|shoulder/i, url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80" },
  { match: /pull|back|biceps/i, url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80" },
  { match: /leg|quad|hamstring|glute|calf|lower/i, url: "https://hips.hearstapps.com/hmg-prod/images/muscular-shirtless-man-exercising-with-weights-in-royalty-free-image-1700572250.jpg?crop=0.88847xw:1xh;center,top&resize=1200:*" },
  { match: /upper/i, url: "https://i.pinimg.com/736x/22/72/88/2272887bd04a94150dc8f84bddd4d87a.jpg" },
  { match: /full body/i, url: "https://muscleevo.net/wp-content/uploads/2020/08/full-body-workout.jpg" },
];
const DEFAULT_COVER = "https://muscleevo.net/wp-content/uploads/2020/08/full-body-workout.jpg";

/** Single shared local placeholder for every exercise / muscle-group tile. */
export function imageForMuscleGroup(_muscleGroup?: string): string {
  if (exercisePlaceholderUri === undefined) {
    exercisePlaceholderUri = Image.resolveAssetSource(EXERCISE_PLACEHOLDER).uri;
  }
  return exercisePlaceholderUri;
}

function coverImageForDay(title: string, storedLabel: string): string {
  const hit = COVER_BY_LABEL_HINT.find(
    (h) => h.match.test(title) || h.match.test(storedLabel),
  );
  return hit?.url ?? DEFAULT_COVER;
}

// Generic form cues by movement pattern — used when Exercise.instructions is null.
const CUE_BY_PATTERN: Record<string, string> = {
  push: "Control the lowering phase, drive through full range of motion on the way up.",
  pull: "Squeeze the target muscle at the top, avoid using momentum to move the weight.",
  squat: "Keep your chest up and core braced, drive through your heels.",
  hinge: "Hinge at the hips with a neutral spine, feel the stretch through the target muscle.",
  carry: "Brace your core and maintain steady breathing throughout.",
};

// Isometric-hold exercises (Plank, Wall Sit, etc.) get treated as duration
// type — detected by name since the backend doesn't currently tag this.
const DURATION_NAME_HINTS = ["plank", "wall sit", "hold"];

function inferExerciseType(name: string): ExerciseType {
  const lower = name.toLowerCase();
  return DURATION_NAME_HINTS.some((hint) => lower.includes(hint)) ? "duration" : "reps";
}

function adaptExercise(ex: ApiPlanExercise, goalId: string): Exercise {
  const type = inferExerciseType(ex.exerciseName);
  const midReps = Math.round((ex.targetRepsMin + ex.targetRepsMax) / 2);

  return {
    id: ex.exerciseId,
    name: ex.exerciseName,
    type,
    sets: ex.targetSets,
    ...(type === "reps"
      ? { reps: midReps }
      : { durationSec: 40 }), // generic hold duration for inferred isometric moves
    restSec: REST_SEC_BY_GOAL[goalId] ?? 60,
    imageUrl: imageForMuscleGroup(ex.muscleGroup),
    instructions:
      CUE_BY_PATTERN[ex.movementPattern] ??
      "Focus on controlled form and full range of motion.",
    muscleGroup: ex.muscleGroup,
  };
}

export function adaptPlanDay(day: ApiPlanDay, goalId: string): WorkoutPlan {
  const sorted = [...day.exercises].sort((a, b) => a.orderIndex - b.orderIndex);
  // Render-time title from actual muscles so stored "Upper A" / "Push" labels
  // update immediately without regenerating the plan.
  const title = dayTitleFromMuscleGroups(sorted);

  return {
    id: day.id,
    title,
    tag: goalId.charAt(0).toUpperCase() + goalId.slice(1),
    coverImage: coverImageForDay(title, day.label),
    exercises: sorted.map((ex) => adaptExercise(ex, goalId)),
  };
}

// ── Adapter for browsed library exercises (no plan-assigned target reps) ──
export interface LibraryExerciseInput {
  id: string;
  name: string;
  muscleGroup: string;
  movementPattern: string;
  instructions?: string | null;
}

// Default sets/reps for a manually-added exercise, since there's no
// generated target range the way there is for plan-assigned exercises.
const DEFAULT_SETS = 3;
const DEFAULT_REPS = 10;

export function adaptLibraryExercise(
  ex: LibraryExerciseInput,
  goalId: string,
): Exercise {
  const type = inferExerciseType(ex.name);

  return {
    id: ex.id,
    name: ex.name,
    type,
    sets: DEFAULT_SETS,
    ...(type === "reps" ? { reps: DEFAULT_REPS } : { durationSec: 40 }),
    restSec: REST_SEC_BY_GOAL[goalId] ?? 60,
    imageUrl: imageForMuscleGroup(ex.muscleGroup),
    instructions:
      ex.instructions?.trim() ||
      CUE_BY_PATTERN[ex.movementPattern] ||
      "Focus on controlled form and full range of motion.",
    muscleGroup: ex.muscleGroup,
  };
}
