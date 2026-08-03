import {
  computeWeeklySchedule,
  getWeekdayMondayIndex,
} from "@/src/lib/plan-day-selection";
import { localDateOnly, parseLocalDateKey } from "./localDate";
import type { WorkoutSessionSummary } from "../hooks/useProgress";

export type LoggedSet = {
  reps?: number;
  weight?: number;
  completed?: boolean;
  durationSec?: number;
};

/** Sum weight × reps across completed sets with both values present. */
export function sessionVolumeKg(session: WorkoutSessionSummary): number {
  let total = 0;
  for (const ex of session.exercises ?? []) {
    const sets = (ex.sets as LoggedSet[]) ?? [];
    for (const set of sets) {
      if (!set.completed) continue;
      if (set.weight == null || set.reps == null) continue;
      total += set.weight * set.reps;
    }
  }
  return total;
}

export type WeekVolumePoint = {
  weekStart: string; // YYYY-MM-DD Monday
  label: string; // e.g. "Mar 3"
  volumeKg: number;
};

function mondayOnOrBefore(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  const diff = (out.getDay() + 6) % 7;
  out.setDate(out.getDate() - diff);
  return out;
}

/** Last `weekCount` Mon–Sun weeks of total volume (oldest → newest). */
export function weeklyVolumeSeries(
  sessions: WorkoutSessionSummary[],
  weekCount = 8,
): WeekVolumePoint[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisMonday = mondayOnOrBefore(today);

  const buckets = new Map<string, number>();
  for (let i = weekCount - 1; i >= 0; i--) {
    const monday = new Date(thisMonday);
    monday.setDate(monday.getDate() - i * 7);
    buckets.set(localDateOnly(monday), 0);
  }

  for (const session of sessions) {
    if (!session.completedAt) continue;
    const completed = new Date(session.completedAt);
    const monday = mondayOnOrBefore(completed);
    const key = localDateOnly(monday);
    if (!buckets.has(key)) continue;
    buckets.set(key, (buckets.get(key) ?? 0) + sessionVolumeKg(session));
  }

  return [...buckets.entries()].map(([weekStart, volumeKg]) => ({
    weekStart,
    label: parseLocalDateKey(weekStart).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    volumeKg,
  }));
}

export type MuscleGroupCount = {
  muscleGroup: string;
  label: string;
  count: number; // exercise appearances across sessions
};

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Count logged exercise appearances by muscle group over the given sessions.
 * `nameToGroup` maps exerciseName → muscleGroup from the exercise library.
 */
export function muscleGroupBalance(
  sessions: WorkoutSessionSummary[],
  nameToGroup: Map<string, string>,
  fromDate: Date,
): MuscleGroupCount[] {
  const counts = new Map<string, number>();
  for (const session of sessions) {
    if (!session.completedAt) continue;
    if (new Date(session.completedAt) < fromDate) continue;
    for (const ex of session.exercises ?? []) {
      const group = nameToGroup.get(ex.exerciseName);
      if (!group) continue;
      counts.set(group, (counts.get(group) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([muscleGroup, count]) => ({
      muscleGroup,
      label: titleCase(muscleGroup),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

/** Local YYYY-MM-DD keys with ≥1 completed session. */
export function completedDayKeys(
  sessions: WorkoutSessionSummary[],
): Set<string> {
  const set = new Set<string>();
  for (const s of sessions) {
    if (!s.completedAt) continue;
    set.add(localDateOnly(new Date(s.completedAt)));
  }
  return set;
}

/**
 * Contribution grid: `weekCount` weeks × 7 days (Mon→Sun), oldest week first.
 * `filled` = had a completed session that day.
 */
export function contributionGrid(
  completedDays: Set<string>,
  weekCount = 6,
): { date: string; filled: boolean }[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisMonday = mondayOnOrBefore(today);
  const weeks: { date: string; filled: boolean }[][] = [];

  for (let w = weekCount - 1; w >= 0; w--) {
    const monday = new Date(thisMonday);
    monday.setDate(monday.getDate() - w * 7);
    const row: { date: string; filled: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(monday);
      day.setDate(day.getDate() + d);
      const key = localDateOnly(day);
      row.push({ date: key, filled: completedDays.has(key) });
    }
    weeks.push(row);
  }
  return weeks;
}

export type AdherenceStats = {
  scheduled: number;
  completed: number;
  /** 0–1 */
  rate: number;
};

/**
 * Over the last `weekCount` full weeks through today: how many scheduled
 * training days (from computeWeeklySchedule) had ≥1 completed session.
 * Training on a rest day is ignored — not penalized.
 */
export function trainingAdherence(
  daysPerWeek: number,
  completedDays: Set<string>,
  weekCount = 4,
): AdherenceStats {
  const schedule = computeWeeklySchedule(daysPerWeek);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisMonday = mondayOnOrBefore(today);
  const start = new Date(thisMonday);
  start.setDate(start.getDate() - (weekCount - 1) * 7);

  let scheduled = 0;
  let completed = 0;
  const cursor = new Date(start);
  while (cursor <= today) {
    const weekday = getWeekdayMondayIndex(cursor);
    if (schedule[weekday]) {
      scheduled += 1;
      if (completedDays.has(localDateOnly(cursor))) completed += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    scheduled,
    completed,
    rate: scheduled === 0 ? 0 : completed / scheduled,
  };
}
