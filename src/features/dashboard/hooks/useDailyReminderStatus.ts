import { useQuery } from "@tanstack/react-query";
import { api } from "@/src/lib/api";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export type ReminderState =
  | { kind: "none" } // both done, nothing to remind about
  | { kind: "neither" }
  | { kind: "workout_done_no_meals" }
  | { kind: "meals_done_no_workout" };

export function useDailyReminderStatus() {
  const today = todayStr();

  const workoutQuery = useQuery({
    queryKey: ["daily-reminder", "workout", today],
    queryFn: () =>
      api.get<{ completedAt: string | null }[]>(
        `/api/workouts?completed=true&from=${today}&to=${today}&limit=5`,
      ),
  });

  const mealsQuery = useQuery({
    queryKey: ["daily-reminder", "meals", today],
    queryFn: () => api.get<{ id: string }[]>(`/api/nutrition/log?date=${today}`),
  });

  const isLoading = workoutQuery.isLoading || mealsQuery.isLoading;

  const workoutDoneToday = (workoutQuery.data?.length ?? 0) > 0;
  const mealsLoggedToday = (mealsQuery.data?.length ?? 0) > 0;

  let state: ReminderState = { kind: "none" };
  if (!workoutDoneToday && !mealsLoggedToday) {
    state = { kind: "neither" };
  } else if (workoutDoneToday && !mealsLoggedToday) {
    state = { kind: "workout_done_no_meals" };
  } else if (!workoutDoneToday && mealsLoggedToday) {
    state = { kind: "meals_done_no_workout" };
  }
  // else both done → stays "none"

  return { state, isLoading, workoutDoneToday, mealsLoggedToday };
}