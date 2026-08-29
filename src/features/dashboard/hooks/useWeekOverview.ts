import { useMemo } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { api } from "@/src/lib/api";

const WEEKDAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export interface WeekDay {
  label: string;
  date: number; // day-of-month, matches CalendarDay's shape
  fullDate: string; // ISO YYYY-MM-DD — for looking up which real date got tapped
  hasWorkout: boolean;
  hasMeal: boolean;
}

function mondayOfThisWeek(): Date {
  const d = new Date();
  const day = d.getDay(); // 0 = Sunday
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function useWeekOverview() {
  const mondayMs = useMemo(() => mondayOfThisWeek().getTime(), []);
  const weekDates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(mondayMs);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [mondayMs],
  );

  const weekStart = toDateStr(weekDates[0]);
  const weekEnd = toDateStr(weekDates[5]);

  // One query for the whole week's workout sessions.
  const workoutQuery = useQuery({
    queryKey: ["week-overview", "workouts", weekStart, weekEnd],
    queryFn: () =>
      api.get<{ completedAt: string | null }[]>(
        `/api/workouts?completed=true&from=${weekStart}&to=${weekEnd}&limit=20`,
      ),
  });

  // One lightweight query per day for meal presence — nutrition's API
  // only supports a single-date lookup, not a range, so this fans out
  // 6 parallel requests rather than one bulk call.
  const mealQueries = useQueries({
    queries: weekDates.map((d) => ({
      queryKey: ["week-overview", "meals", toDateStr(d)],
      queryFn: () => api.get<{ id: string }[]>(`/api/nutrition/log?date=${toDateStr(d)}`),
    })),
  });

  const isLoading = workoutQuery.isLoading || mealQueries.some((q) => q.isLoading);

  const workoutDatesWithSession = new Set(
    (workoutQuery.data ?? [])
      .filter((s) => s.completedAt)
      .map((s) => s.completedAt!.slice(0, 10)),
  );

  const days: WeekDay[] = weekDates.map((d, i) => {
    const fullDate = toDateStr(d);
    return {
      label: WEEKDAY_LABELS[i],
      date: d.getDate(),
      fullDate,
      hasWorkout: workoutDatesWithSession.has(fullDate),
      hasMeal: (mealQueries[i]?.data?.length ?? 0) > 0,
    };
  });

  return { days, isLoading };
}