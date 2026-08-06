import { localDateOnly } from "@/src/features/progress/lib/localDate";

/** Monday (local midnight) of the week `weekOffset` weeks from this one. */
export function mondayOfWeek(weekOffset: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const diff = (d.getDay() + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff + weekOffset * 7);
  return d;
}

/**
 * Mon–Sun window for a week offset. `weekEnd` is Sunday *inclusive* — the
 * DaySelector week row depends on that (Sunday-visibility fix).
 */
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
