export type ReminderState =
  | { kind: "none" } // both done, nothing to remind about
  | { kind: "neither" }
  | { kind: "workout_done_no_meals" }
  | { kind: "meals_done_no_workout" };

export function dailyReminderStatus(input: {
  workoutDone: boolean;
  mealsLogged: boolean;
  reminderEnabled?: boolean | null;
}): ReminderState {
  if (input.reminderEnabled === false) return { kind: "none" };
  if (input.workoutDone && input.mealsLogged) return { kind: "none" };
  if (input.workoutDone) return { kind: "workout_done_no_meals" };
  if (input.mealsLogged) return { kind: "meals_done_no_workout" };
  return { kind: "neither" };
}

/** Same derivation as a hook so callers can stay on the existing name. */
export function useDailyReminderStatus(input: {
  workoutDone: boolean;
  mealsLogged: boolean;
  reminderEnabled?: boolean | null;
}): ReminderState {
  return dailyReminderStatus(input);
}
