/**
 * Maps a given date's weekday onto a rotating position within the plan's split.
 * A 3-day plan cycles Mon→Day0, Tue→Day1, Wed→Day2, Thu→Day0 again, etc.
 * Resets every Monday rather than tracking "days since last workout" —
 * simple, predictable, no session-history dependency.
 */
export function getPlanDayIndexForDate(date: Date, totalPlanDays: number): number {
  if (totalPlanDays <= 0) return 0;
  const jsDay = date.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  const mondayStartIndex = (jsDay + 6) % 7; // shift so Monday = 0
  return mondayStartIndex % totalPlanDays;
}

/**
 * Back-compat wrapper — keeps any existing "today" callers working.
 */
export function getTodaysPlanDayIndex(totalPlanDays: number): number {
  return getPlanDayIndexForDate(new Date(), totalPlanDays);
}