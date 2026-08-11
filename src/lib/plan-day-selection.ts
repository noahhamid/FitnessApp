/**
 * Real training / rest schedule for a week.
 * Index 0 = Monday … 6 = Sunday.
 */

export const WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const WEEKDAY_LABELS_SHORT = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

/**
 * Valid selectable range: the onboarding schedule step offers DAYS = [2…7] and
 * the profile API zod is `.min(2).max(7)`, matching clampDays in
 * src/lib/workout-plan-generator.ts. Keep these three in sync.
 */
function clampDaysPerWeek(daysPerWeek: number): number {
  if (!Number.isFinite(daysPerWeek) || daysPerWeek <= 0) return 0;
  return Math.min(7, Math.max(2, Math.round(daysPerWeek)));
}

/** Fixed real-world patterns — Mon=0 … Sun=6. */
const WEEKLY_SCHEDULE: Record<2 | 3 | 4 | 5 | 6 | 7, readonly boolean[]> = {
  // Mon, Thu
  2: [true, false, false, true, false, false, false],
  // Mon, Wed, Fri
  3: [true, false, true, false, true, false, false],
  // Mon, Tue, Thu, Fri — rest Wed + weekend
  4: [true, true, false, true, true, false, false],
  // Mon–Fri — rest weekend
  5: [true, true, true, true, true, false, false],
  // Mon–Sat — rest Sunday
  6: [true, true, true, true, true, true, false],
  // Every day — no scheduled rest
  7: [true, true, true, true, true, true, true],
};

/**
 * Lookup the fixed training/rest pattern for daysPerWeek (2–7).
 * Out-of-range values clamp into 2–7; ≤0 → all rest.
 */
export function computeWeeklySchedule(daysPerWeek: number): boolean[] {
  const n = clampDaysPerWeek(daysPerWeek);
  if (n <= 0) return Array<boolean>(7).fill(false);
  return [...WEEKLY_SCHEDULE[n as 2 | 3 | 4 | 5 | 6 | 7]];
}

export function getWeekdayMondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7; // Mon = 0 … Sun = 6
}

export type WeekSlot =
  | { kind: "train"; weekdayIndex: number; planDayIndex: number }
  | { kind: "rest"; weekdayIndex: number };

/** Monday→Sunday slots for the full-plan week view. */
export function getWeeklySlots(daysPerWeek: number): WeekSlot[] {
  const schedule = computeWeeklySchedule(daysPerWeek);
  let planDayIndex = 0;
  return schedule.map((isTrain, weekdayIndex) => {
    if (isTrain) {
      const slot: WeekSlot = {
        kind: "train",
        weekdayIndex,
        planDayIndex: planDayIndex++,
      };
      return slot;
    }
    return { kind: "rest", weekdayIndex };
  });
}

/**
 * Map a calendar date to a plan day index, or null on a scheduled rest day.
 * `daysPerWeek` should match the number of WorkoutPlanDay rows.
 */
export function getPlanDayIndexForDate(
  date: Date,
  daysPerWeek: number,
): number | null {
  const n = clampDaysPerWeek(daysPerWeek);
  if (n <= 0) return null;

  const schedule = computeWeeklySchedule(n);
  const weekday = getWeekdayMondayIndex(date);
  if (!schedule[weekday]) return null;

  let planIndex = 0;
  for (let d = 0; d < weekday; d++) {
    if (schedule[d]) planIndex++;
  }
  return planIndex;
}

/** Today's plan day index, or null if today is a rest day. */
export function getTodaysPlanDayIndex(daysPerWeek: number): number | null {
  return getPlanDayIndexForDate(new Date(), daysPerWeek);
}
