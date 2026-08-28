import type { WorkoutPlan, Exercise, ExerciseType } from "@/src/features/workout/data/workouts";
import { imageForExercise } from "@/src/features/workout/constants/exercise-images";
import { dayTitleFromMuscleGroups } from "@/src/lib/plan-day-title";
import { resolveAssetUri } from "@/src/lib/resolve-asset";

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
  blockLabel?: string | null;
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

// Shared local assets — do not use dataset GIFs/images (copyrighted).
// Resolve lazily: EAS's Android eager bundle also evaluates this module in
// Node (web.output: "server"), where Image.resolveAssetSource is missing.
const PUSH_DAY_COVER = require("../../assets/images/push-day-cover.jpg");
const PULL_DAY_COVER = require("../../assets/images/pull-day-cover.jpg");
const LEGS_DAY_COVER = require("../../assets/images/legs-day-cover.jpg");
const UPPER_DAY_COVER = require("../../assets/images/upper-day-cover.jpg");
const FULL_BODY_COVER = require("../../assets/images/full-body-cover.jpg");

function resolveLocalAssetUri(asset: number): string {
  return resolveAssetUri(asset);
}

type LazyAssetUri = { asset: number; uri?: string };

function resolveLazyAssetUri(slot: LazyAssetUri): string {
  if (slot.uri === undefined) {
    slot.uri = resolveLocalAssetUri(slot.asset);
  }
  return slot.uri;
}

const defaultCover: LazyAssetUri = { asset: FULL_BODY_COVER };

const COVER_BY_LABEL_HINT: { match: RegExp; slot: LazyAssetUri }[] = [
  { match: /push|chest|triceps|shoulder/i, slot: { asset: PUSH_DAY_COVER } },
  { match: /pull|back|biceps/i, slot: { asset: PULL_DAY_COVER } },
  { match: /leg|quad|hamstring|glute|calf|lower/i, slot: { asset: LEGS_DAY_COVER } },
  { match: /upper/i, slot: { asset: UPPER_DAY_COVER } },
  { match: /full body/i, slot: { asset: FULL_BODY_COVER } },
];

/** Prefer per-exercise soft-3D art; unknown names use Push-up art. */
export { imageForExercise };

function coverImageForDay(title: string, storedLabel: string): string {
  const hit = COVER_BY_LABEL_HINT.find(
    (h) => h.match.test(title) || h.match.test(storedLabel),
  );
  return resolveLazyAssetUri(hit?.slot ?? defaultCover);
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
const DURATION_NAME_HINTS = [
  "plank",
  "wall sit",
  "hold",
  "stretch",
  "pose",
  "carry",
  "cat-cow",
  "legs-up",
];

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
      : { durationSec: ex.targetRepsMin || 40 }),
    restSec: REST_SEC_BY_GOAL[goalId] ?? 60,
    imageUrl: imageForExercise(ex.exerciseName),
    instructions:
      CUE_BY_PATTERN[ex.movementPattern] ??
      "Focus on controlled form and full range of motion.",
    muscleGroup: ex.muscleGroup,
    blockLabel: ex.blockLabel ?? undefined,
  };
}

/** Same minute estimate Train and Home use for a planned session. */
export function estimateWorkoutMinutes(
  exercises: {
    type?: string;
    sets: number;
    reps?: number;
    durationSec?: number;
    restSec: number;
  }[],
): number {
  const seconds = exercises.reduce((sum, ex) => {
    const work =
      ex.type === "duration"
        ? (ex.durationSec ?? 0)
        : (ex.reps ?? 10) * 3;
    return sum + (work + ex.restSec) * ex.sets;
  }, 0);
  return Math.round(seconds / 60);
}

export function adaptPlanDay(day: ApiPlanDay, goalId: string): WorkoutPlan {
  const sorted = [...day.exercises].sort((a, b) => a.orderIndex - b.orderIndex);
  // Render-time title from actual muscles so stored "Upper A" / "Push" labels
  // update immediately without regenerating the plan.
  const title = dayTitleFromMuscleGroups(
    sorted.filter((ex) => !ex.blockLabel),
  );

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
    imageUrl: imageForExercise(ex.name),
    instructions:
      ex.instructions?.trim() ||
      CUE_BY_PATTERN[ex.movementPattern] ||
      "Focus on controlled form and full range of motion.",
    muscleGroup: ex.muscleGroup,
  };
}
