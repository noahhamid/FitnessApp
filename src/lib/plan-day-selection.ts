/**
 * Real training / rest schedule for a week.
 * Index 0 = Monday … 6 = Sunday.
 *
 * Users can pick their own weekdays (`UserProfile.trainingDays`). When they
 * haven't, the fixed pattern below applies — it spaces sessions sensibly for
 * the chosen frequency, which is what an unopinionated default should do.
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

/** Default patterns when the user hasn't picked weekdays — Mon=0 … Sun=6. */
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
 * Sorted, de-duplicated weekday indices for a frequency's default pattern.
 * Used to pre-fill the picker so the recommended spacing is the starting point.
 */
export function defaultTrainingDays(daysPerWeek: number): number[] {
  const n = clampDaysPerWeek(daysPerWeek);
  if (n <= 0) return [];
  return WEEKLY_SCHEDULE[n as 2 | 3 | 4 | 5 | 6 | 7].reduce<number[]>(
    (days, isTrain, weekdayIndex) => {
      if (isTrain) days.push(weekdayIndex);
      return days;
    },
    [],
  );
}

/**
 * Clean a user-supplied weekday list: integers 0–6, de-duplicated and sorted.
 * Returns null when nothing usable is left, so callers fall back to defaults.
 */
export function normalizeTrainingDays(
  days: readonly number[] | null | undefined,
): number[] | null {
  if (!days || days.length === 0) return null;
  const cleaned = [
    ...new Set(
      days
        .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
        .map((d) => Number(d)),
    ),
  ].sort((a, b) => a - b);
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Training/rest mask for the week.
 *
 * A custom weekday list is only honoured when it matches the plan's day count,
 * since the plan holds exactly `daysPerWeek` WorkoutPlanDay rows — a mismatched
 * list would leave a day unreachable or point past the end of the plan.
 */
export function computeWeeklySchedule(
  daysPerWeek: number,
  trainingDays?: readonly number[] | null,
): boolean[] {
  const n = clampDaysPerWeek(daysPerWeek);
  if (n <= 0) return Array<boolean>(7).fill(false);

  const custom = normalizeTrainingDays(trainingDays);
  if (custom && custom.length === n) {
    const mask = Array<boolean>(7).fill(false);
    for (const day of custom) mask[day] = true;
    return mask;
  }

  return [...WEEKLY_SCHEDULE[n as 2 | 3 | 4 | 5 | 6 | 7]];
}

export function getWeekdayMondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7; // Mon = 0 … Sun = 6
}

export type WeekSlot =
  | { kind: "train"; weekdayIndex: number; planDayIndex: number }
  | { kind: "rest"; weekdayIndex: number };

/** Monday→Sunday slots for the full-plan week view. */
export function getWeeklySlots(
  daysPerWeek: number,
  trainingDays?: readonly number[] | null,
): WeekSlot[] {
  const schedule = computeWeeklySchedule(daysPerWeek, trainingDays);
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
  trainingDays?: readonly number[] | null,
): number | null {
  const n = clampDaysPerWeek(daysPerWeek);
  if (n <= 0) return null;

  const schedule = computeWeeklySchedule(n, trainingDays);
  const weekday = getWeekdayMondayIndex(date);
  if (!schedule[weekday]) return null;

  let planIndex = 0;
  for (let d = 0; d < weekday; d++) {
    if (schedule[d]) planIndex++;
  }
  return planIndex;
}

/** Today's plan day index, or null if today is a rest day. */
export function getTodaysPlanDayIndex(
  daysPerWeek: number,
  trainingDays?: readonly number[] | null,
): number | null {
  return getPlanDayIndexForDate(new Date(), daysPerWeek, trainingDays);
}
