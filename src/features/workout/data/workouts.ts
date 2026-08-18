export type ExerciseType = "reps" | "duration";

/** Per-set log from a live / resumed session (API setSchema). Distinct from `sets` (target count). */
export type ExerciseLoggedSet = {
  reps?: number;
  weight?: number;
  durationSec?: number;
  completed?: boolean;
};

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  sets: number;
  reps?: number;
  durationSec?: number;
  restSec: number;
  imageUrl: string;
  instructions: string;
  muscleGroup?: string;   // <-- ADD THIS LINE
  /** Set when this row belongs to an appended goal-detail / issue block. */
  blockLabel?: string;
  /** Saved mid-session sets from the backend — used to hydrate resume UI. */
  loggedSets?: ExerciseLoggedSet[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  tag: string;
  coverImage: string;
  exercises: Exercise[];
}
