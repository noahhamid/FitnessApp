import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/src/lib/api";

interface CompletedSessionRow {
  id: string;
  completedAt: string | null;
}

/** Local calendar day as YYYY-MM-DD. */
function localDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function prevDayKey(key: string): string {
  const d = parseDayKey(key);
  d.setDate(d.getDate() - 1);
  return localDayKey(d);
}

/**
 * Consecutive local calendar days with ≥1 completed session, ending today
 * or yesterday. Returns 0 if the streak is broken (no completion today or
 * yesterday).
 */
export function computeStreakDays(completedAts: string[]): number {
  const days = new Set(
    completedAts
      .filter(Boolean)
      .map((iso) => localDayKey(new Date(iso))),
  );
  if (days.size === 0) return 0;

  const today = localDayKey(new Date());
  const yesterday = prevDayKey(today);

  let cursor: string;
  if (days.has(today)) cursor = today;
  else if (days.has(yesterday)) cursor = yesterday;
  else return 0;

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = prevDayKey(cursor);
  }
  return streak;
}

/**
 * Derives streak from existing GET /api/workouts?completed=true — no new
 * endpoint. Hidden by callers when streak < 2 (insufficient real history).
 */
export function useWorkoutStreak(enabled = true) {
  const query = useQuery({
    queryKey: ["workout-sessions", "streak"],
    queryFn: () =>
      api.get<CompletedSessionRow[]>(
        "/api/workouts?completed=true&limit=90",
      ),
    staleTime: 1000 * 60 * 5,
    enabled,
  });

  const streakDays = useMemo(() => {
    const dates =
      query.data
        ?.map((s) => s.completedAt)
        .filter((d): d is string => !!d) ?? [];
    return computeStreakDays(dates);
  }, [query.data]);

  return {
    streakDays,
    isLoading: query.isLoading,
  };
}
