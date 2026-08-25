import { localDateOnly } from "@/src/features/progress/lib/localDate";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Monday (local midnight) of the week that contains `date`. */
export function mondayContaining(date: string | Date): Date {
  const raw =
    typeof date === "string"
      ? new Date(date.includes("T") ? date : `${date}T00:00:00`)
      : new Date(date);
  const d = new Date(`${localDateOnly(raw)}T00:00:00`);
  d.setHours(0, 0, 0, 0);
  const diff = (d.getDay() + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  return d;
}

/** Monday (local midnight) of the week `weekOffset` weeks from this one. */
export function mondayOfWeek(weekOffset: number): Date {
  const monday = mondayContaining(new Date());
  monday.setDate(monday.getDate() + weekOffset * 7);
  return monday;
}

/**
 * Earliest weekOffset the user may open (signup week's Monday vs this week).
 * `0` = this week only backward; negative = past weeks allowed.
 * `null` when signup is unknown — no clamp.
 */
export function minWeekOffsetSince(
  signupAt?: string | Date | null,
): number | null {
  if (!signupAt) return null;
  const signupMonday = mondayContaining(signupAt);
  const thisMonday = mondayOfWeek(0);
  return Math.round(
    (signupMonday.getTime() - thisMonday.getTime()) / (7 * DAY_MS),
  );
}

/** Local YYYY-MM-DD for account creation. */
export function signupDateOnly(
  signupAt?: string | Date | null,
): string | null {
  if (!signupAt) return null;
  return localDateOnly(new Date(signupAt));
}

/**
 * Mon–Sun window for a week offset. `weekEnd` is Sunday *inclusive* — the
 * DaySelector week row depends on that (Sunday-visibility fix).
 */
/** How many weeks `dateStr` is from this week (0 = this week, -1 = last). */
export function weekOffsetForDate(dateStr: string): number {
  const selectedMonday = mondayContaining(dateStr);
  const thisMonday = mondayOfWeek(0);
  return Math.round(
    (selectedMonday.getTime() - thisMonday.getTime()) / (7 * DAY_MS),
  );
}

export function weekDatesFor(weekOffset: number): {
  weekStart: string;
  weekEnd: string;
  weekDates: Date[];
} {
  const monday = mondayOfWeek(weekOffset);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
  return {
    weekStart: localDateOnly(weekDates[0]),
    weekEnd: localDateOnly(weekDates[6]),
    weekDates,
  };
}

export function shiftDateStr(iso: string, deltaDays: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + deltaDays);
  return localDateOnly(d);
}

export function formatWeekLabel(
  weekStart: string,
  weekEnd: string,
  weekOffset: number,
): string {
  if (weekOffset === 0) return "This week";
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(`${weekEnd}T00:00:00`);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
}

export function dayLabel(dateStr: string): string {
  return new Date(dateStr + "T00:00:00")
    .toLocaleDateString("en-US", { weekday: "short" })
    .toUpperCase();
}

/** Weekday plus date, e.g. "Wednesday, 12 Aug". Device locale. */
export function fullDayLabel(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

/** "Today" / "Yesterday" / "Tomorrow" when it applies, else null. */
export function relativeDayName(
  dateStr: string,
  today = localDateOnly(),
): string | null {
  if (dateStr === today) return "Today";
  if (dateStr === shiftDateStr(today, -1)) return "Yesterday";
  if (dateStr === shiftDateStr(today, 1)) return "Tomorrow";
  return null;
}

/**
 * Caption for a picked day: leads with Today/Yesterday/Tomorrow when relevant,
 * always spells out the weekday and date behind it.
 */
export function dayCaption(dateStr: string, today = localDateOnly()): string {
  const relative = relativeDayName(dateStr, today);
  const full = fullDayLabel(dateStr);
  return relative ? `${relative} · ${full}` : full;
}
