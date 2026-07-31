export type ReminderState =
  | { kind: "none" } // both done, nothing to remind about
  | { kind: "neither" }
  | { kind: "workout_done_no_meals" }
  | { kind: "meals_done_no_workout" };