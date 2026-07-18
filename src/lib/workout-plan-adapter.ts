import type { WorkoutPlan, Exercise, ExerciseType } from "../data/workouts";

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

// Generic per-muscle-group images, reusing the same Unsplash convention
// already used elsewhere in this app (see data/workouts.ts PLANS array).
// These are placeholders shared across exercises in the same muscle group
// until/unless real per-exercise photos exist.
const IMAGE_BY_MUSCLE_GROUP: Record<string, string> = {
  chest: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  back: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
  shoulders: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  biceps: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&q=80",
  triceps: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&q=80",
  quads: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=600&q=80",
  hamstrings: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&q=80",
  glutes: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  calves: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&q=80",
  core: "https://images.unsplash.com/photo-1566241142248-38d0b3527c8e?w=600&q=80",
};

const COVER_BY_LABEL_HINT: { match: RegExp; url: string }[] = [
  { match: /push/i, url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80" },
  { match: /pull/i, url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80" },
  { match: /leg/i, url: "https://hips.hearstapps.com/hmg-prod/images/muscular-shirtless-man-exercising-with-weights-in-royalty-free-image-1700572250.jpg?crop=0.88847xw:1xh;center,top&resize=1200:*" },
  { match: /upper/i, url: "https://i.pinimg.com/736x/22/72/88/2272887bd04a94150dc8f84bddd4d87a.jpg" },
  { match: /lower/i, url: "https://hips.hearstapps.com/hmg-prod/images/muscular-shirtless-man-exercising-with-weights-in-royalty-free-image-1700572250.jpg?crop=0.88847xw:1xh;center,top&resize=1200:*" },
  { match: /full body/i, url: "https://muscleevo.net/wp-content/uploads/2020/08/full-body-workout.jpg" },
];
const DEFAULT_COVER = "https://muscleevo.net/wp-content/uploads/2020/08/full-body-workout.jpg";

function coverImageForDay(label: string): string {
  const hit = COVER_BY_LABEL_HINT.find((h) => h.match.test(label));
  return hit?.url ?? DEFAULT_COVER;
}

// Generic form cues by movement pattern — placeholders until/unless real
// per-exercise instructions get added (e.g. via an admin-editable Exercise
// table field, or AI-generated copy per exercise name).
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
    imageUrl: IMAGE_BY_MUSCLE_GROUP[ex.muscleGroup] ?? DEFAULT_COVER,
    instructions:
      CUE_BY_PATTERN[ex.movementPattern] ??
      "Focus on controlled form and full range of motion.",
  };
}

export function adaptPlanDay(day: ApiPlanDay, goalId: string): WorkoutPlan {
  return {
    id: day.id,
    title: day.label,
    tag: goalId.charAt(0).toUpperCase() + goalId.slice(1),
    coverImage: coverImageForDay(day.label),
    exercises: day.exercises
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((ex) => adaptExercise(ex, goalId)),
  };
}