// Real hooks live in useProgress.ts. The old useProgressData stub was
// deleted in the dashboard/progress refactor; this barrel previously still
// pointed at that missing file. Nothing in the app imports from here today
// (call sites use @/src/features/progress/hooks/useProgress directly).
export {
  useWeightLog,
  useAddWeightLog,
  useWeightGoal,
  useWorkoutHistory,
  usePersonalRecords,
} from "./hooks/useProgress";

export type {
  WeightLogEntry,
  WeightGoalEntry,
  WorkoutSessionSummary,
  PersonalRecord,
} from "./hooks/useProgress";
