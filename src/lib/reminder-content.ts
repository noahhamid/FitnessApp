import type { ReminderState } from "@/src/features/dashboard/hooks/useDailyReminderStatus";
export interface ReminderContent {
  message: string;
  actionLabel: string; // reuses the card's "deadlineLabel" slot as a CTA label instead
  navigateTo: "/(app)/(tabs)/train" | "/log-meal";
}

export function getReminderContent(state: ReminderState): ReminderContent | null {
  switch (state.kind) {
    case "neither":
      return {
        message: "You haven't logged anything today",
        actionLabel: "Start your day",
        navigateTo: "/(app)/(tabs)/train",
      };
    case "workout_done_no_meals":
      return {
        message: "Workout logged — nice work! Don't forget your meals",
        actionLabel: "Log a meal",
        navigateTo: "/log-meal",
      };
    case "meals_done_no_workout":
      return {
        message: "Meals logged — get today's workout in",
        actionLabel: "Start workout",
        navigateTo: "/(app)/(tabs)/train",
      };
    case "none":
      return null; // both done — card doesn't render at all
  }
}