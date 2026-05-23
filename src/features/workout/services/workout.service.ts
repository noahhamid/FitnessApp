import { api } from "@/src/lib/api";

export const MUSCLE_GROUPS = [
  "All",
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
  "Cardio",
];

export const EXERCISES = [
  { id: "e1", name: "Bench Press", muscle: "Chest", icon: "🏋️", tag: "Compound" },
  { id: "e2", name: "Incline DB Press", muscle: "Chest", icon: "💪", tag: "Compound" },
  { id: "e3", name: "Cable Fly", muscle: "Chest", icon: "🔁", tag: "Isolation" },
  { id: "e4", name: "Push-Up", muscle: "Chest", icon: "⬆️", tag: "Bodyweight" },
  { id: "e5", name: "Deadlift", muscle: "Back", icon: "🏋️", tag: "Compound" },
  { id: "e6", name: "Pull-Up", muscle: "Back", icon: "⬆️", tag: "Bodyweight" },
  { id: "e7", name: "Barbell Row", muscle: "Back", icon: "💪", tag: "Compound" },
  { id: "e8", name: "Lat Pulldown", muscle: "Back", icon: "🔁", tag: "Machine" },
  { id: "e9", name: "OHP", muscle: "Shoulders", icon: "🏋️", tag: "Compound" },
  { id: "e10", name: "Lateral Raise", muscle: "Shoulders", icon: "🔁", tag: "Isolation" },
  { id: "e11", name: "Face Pull", muscle: "Shoulders", icon: "🔁", tag: "Isolation" },
  { id: "e12", name: "Barbell Curl", muscle: "Arms", icon: "💪", tag: "Isolation" },
  { id: "e13", name: "Tricep Pushdown", muscle: "Arms", icon: "🔁", tag: "Isolation" },
  { id: "e14", name: "Hammer Curl", muscle: "Arms", icon: "💪", tag: "Isolation" },
  { id: "e15", name: "Squat", muscle: "Legs", icon: "🏋️", tag: "Compound" },
  { id: "e16", name: "Romanian Deadlift", muscle: "Legs", icon: "🏋️", tag: "Compound" },
  { id: "e17", name: "Leg Press", muscle: "Legs", icon: "🔁", tag: "Machine" },
  { id: "e18", name: "Lunges", muscle: "Legs", icon: "⬆️", tag: "Compound" },
  { id: "e19", name: "Plank", muscle: "Core", icon: "⬆️", tag: "Bodyweight" },
  { id: "e20", name: "Cable Crunch", muscle: "Core", icon: "🔁", tag: "Isolation" },
  { id: "e21", name: "Hanging Leg Raise", muscle: "Core", icon: "⬆️", tag: "Bodyweight" },
  { id: "e22", name: "Treadmill Run", muscle: "Cardio", icon: "🏃", tag: "Cardio" },
  { id: "e23", name: "Rowing Machine", muscle: "Cardio", icon: "🚣", tag: "Cardio" },
  { id: "e24", name: "Jump Rope", muscle: "Cardio", icon: "🪢", tag: "Cardio" },
];

export const VOLUME_SPARKLINE = [6200, 8400, 7100, 12600, 6800, 8200];

export const WORKOUT_TEMPLATES = [
  { id: "t1", name: "PUSH DAY", tag: "Chest · Shoulders · Triceps", icon: "💪" },
  { id: "t2", name: "PULL DAY", tag: "Back · Biceps", icon: "🏋️" },
  { id: "t3", name: "LEG DAY", tag: "Quads · Hamstrings · Glutes", icon: "🦵" },
  { id: "t4", name: "FULL BODY", tag: "All Muscle Groups", icon: "⚡" },
];

export const PHOTO_PLACEHOLDERS = [
  { id: "p1", date: "May 1", uri: null as string | null, label: "Front" },
  { id: "p2", date: "May 1", uri: null as string | null, label: "Side" },
  { id: "p3", date: "Apr 15", uri: null as string | null, label: "Front" },
];

// ─── Live workout API (used by dashboard / workout screen) ────────────────────

/** Session shape returned from `GET /api/workouts`. */
export type ApiWorkoutSession = {
  id: string;
  startedAt: string;
  completedAt: string | null;
  notes: string | null;
  exercises?: Array<{
    id: string;
    exerciseName: string;
    sets: unknown;
  }>;
};

export type WorkoutHistoryRow = {
  id: string;
  date: string;
  name: string;
  duration: string;
  volume: string;
  sets: number;
  exercises: string[];
};

function countSets(raw: unknown): number {
  if (!Array.isArray(raw)) return 0;
  return raw.length;
}

function volumeFromExerciseSets(raw: unknown): number {
  if (!Array.isArray(raw)) return 0;
  let kg = 0;
  for (const row of raw) {
    if (
      row &&
      typeof row === "object" &&
      "weight" in row &&
      "reps" in row
    ) {
      const weight = Number((row as { weight?: number }).weight ?? 0);
      const reps = Number((row as { reps?: number }).reps ?? 0);
      kg += weight * reps;
    }
  }
  return kg;
}

function durationLabel(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return "—";
  const m = Math.max(
    1,
    Math.round(
      (new Date(completedAt).getTime() - new Date(startedAt).getTime()) /
        60000,
    ),
  );
  return `${m} min`;
}

function formatHistoryDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

/** Map GET /api/workouts rows for HistoryCard / dashboard. */
export function mapApiSessionToHistoryRow(s: ApiWorkoutSession): WorkoutHistoryRow {
  const ex = s.exercises ?? [];
  const names = ex.map((e) => e.exerciseName);
  const setCount = ex.reduce((acc, e) => acc + countSets(e.sets), 0);
  const volumeKg = ex.reduce((acc, e) => acc + volumeFromExerciseSets(e.sets), 0);
  const name =
    (s.notes && s.notes.trim()) ||
    names[0] ||
    "Workout";
  return {
    id: s.id,
    date: formatHistoryDate(s.completedAt ?? s.startedAt),
    name,
    duration: durationLabel(s.startedAt, s.completedAt),
    volume: `${Math.round(volumeKg).toLocaleString()} kg`,
    sets: setCount,
    exercises: names,
  };
}

export async function fetchWorkoutSessions(query: string): Promise<ApiWorkoutSession[]> {
  return api.get<ApiWorkoutSession[]>(`/api/workouts${query}`);
}

/** Completed sessions newest-first, mapped for UI lists. */
export async function fetchWorkoutHistory(limit = 50): Promise<WorkoutHistoryRow[]> {
  try {
    const rows = await fetchWorkoutSessions(
      `?limit=${limit}&completed=true`,
    );
    const completed = rows.filter((r) => r.completedAt != null);
    return completed.map(mapApiSessionToHistoryRow);
  } catch {
    return [];
  }
}

export function sessionCoversUtcDate(session: ApiWorkoutSession, ymd: string): boolean {
  const end = session.completedAt ?? session.startedAt;
  try {
    return end.slice(0, 10) === ymd || session.startedAt.slice(0, 10) === ymd;
  } catch {
    return false;
  }
}

/** Local-calendar YYYY-MM-DD for workouts / streaks aligned with logs. */
export function todayLocalYmd(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Local-calendar day derived from ISO timestamp (sessions & logs). */
export function localCalendarYmdFromIso(iso: string): string {
  return todayLocalYmd(new Date(iso));
}

/** Month calendar week Mon → Sun local YYYY-MM-DD keys (aligns dashboard weekly bars). */
export function calendarWeekDatesMonSunLocal(ref = new Date()): string[] {
  const cursor = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const dow = cursor.getDay();
  const toMon = dow === 0 ? -6 : 1 - dow;
  cursor.setDate(cursor.getDate() + toMon);
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(cursor);
    x.setDate(cursor.getDate() + i);
    out.push(todayLocalYmd(x));
  }
  return out;
}

const TODAY_PLAN_TAG_COLORS = ["#C8F135", "#FF8A00", "#3D8EFF"];

export function mapIncompleteToTodayPlan(
  session: ApiWorkoutSession,
  slotIndex: number,
) {
  const exerciseCount = session.exercises?.length ?? 0;
  const elapsedMin = Math.max(
    1,
    Math.round(
      (Date.now() - new Date(session.startedAt).getTime()) / 60000,
    ),
  );
  const label =
    (session.notes && session.notes.trim()) ||
    session.exercises?.[0]?.exerciseName ||
    "Workout";
  return {
    title: label,
    duration: `${elapsedMin}`,
    sets: `${exerciseCount} exercises`,
    tag: exerciseCount >= 8 ? "STRENGTH" : exerciseCount <= 3 ? "QUICK" : "SESSION",
    tagColor:
      TODAY_PLAN_TAG_COLORS[slotIndex % TODAY_PLAN_TAG_COLORS.length],
  };
}
