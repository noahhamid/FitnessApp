import {
  defaultTrainingDays,
  WEEKDAY_LABELS_SHORT,
} from "@/src/lib/plan-day-selection";

export type ScheduleSuggestion = {
  id: string;
  days: number[];
  frequency: number;
  title: string;
  reason: string;
};

type RecInput = {
  goalId?: string;
  goalDetail?: string;
  experience?: string;
  age?: number;
  pace?: string;
  injuries?: string[];
  bodyIssues?: string[];
  equipment?: string;
};

function clampFreq(n: number): number {
  return Math.max(2, Math.min(5, Math.round(n)));
}

function keyOf(days: number[]): string {
  return days.slice().sort((a, b) => a - b).join(",");
}

function formatDays(days: number[]): string {
  return days.map((d) => WEEKDAY_LABELS_SHORT[d] ?? "").filter(Boolean).join(" · ");
}

/** How many days/week this profile should train — capped at 5. */
export function recommendedFrequency(input: RecInput): number {
  let n = 3;
  if (input.experience === "intermediate") n = 4;
  if (input.experience === "advanced") {
    n = input.goalId === "build" ? 5 : 4;
  }

  if (input.pace === "aggressive") n += 1;
  if (input.pace === "slow") n -= 1;

  if (input.age != null && Number.isFinite(input.age)) {
    if (input.age >= 65) n -= 2;
    else if (input.age >= 50) n -= 1;
  }

  const injuries = (input.injuries ?? []).filter((i) => i && i !== "none");
  if (injuries.length > 0) n -= 1;

  if (input.goalId === "endure" || input.goalDetail === "event") n = Math.max(n, 4);
  if (input.goalDetail === "aggressive_cut") n = Math.max(n, 4);
  if ((input.bodyIssues ?? []).includes("sitting")) n = Math.max(n, 4);
  if (input.equipment === "bodyweight") n = Math.min(n, 4);

  return clampFreq(n);
}

function weekendLean(freq: number): number[] {
  const byFreq: Record<number, number[]> = {
    2: [5, 6],
    3: [1, 3, 5],
    4: [0, 2, 4, 5],
    5: [0, 1, 3, 5, 6],
  };
  return byFreq[freq] ?? defaultTrainingDays(freq);
}

function earlyWeek(freq: number): number[] {
  const byFreq: Record<number, number[]> = {
    2: [0, 2],
    3: [0, 1, 3],
    4: [0, 1, 2, 4],
    5: [0, 1, 2, 3, 4],
  };
  return byFreq[freq] ?? defaultTrainingDays(freq);
}

function reasonFor(input: RecInput, freq: number, variant: string): string {
  const bits: string[] = [`${freq} days`];
  if (variant === "primary") {
    if (input.experience === "novice") bits.push("recovery-friendly");
    else if (input.experience === "advanced") bits.push("matches your level");
    if (input.age != null && input.age >= 50) bits.push("easier on joints");
    if ((input.injuries ?? []).some((i) => i && i !== "none")) {
      bits.push("spaces sessions");
    }
  } else if (variant === "weekend") {
    bits.push("weekend room");
  } else if (variant === "easier") {
    bits.push("lighter week");
  } else if (variant === "harder") {
    bits.push("more volume");
  } else if (variant === "weekday") {
    bits.push("weekdays only");
  }
  return bits.join(" · ");
}

/**
 * Up to 5 ranked day-patterns. Rank 1 is the best match for this profile.
 */
export function recommendTrainingSchedules(input: RecInput): ScheduleSuggestion[] {
  const freq = recommendedFrequency(input);
  const easier = clampFreq(freq - 1);
  const harder = clampFreq(freq + 1);

  const candidates: { days: number[]; reason: string }[] = [
    {
      days: defaultTrainingDays(freq),
      reason: reasonFor(input, freq, "primary"),
    },
    {
      days: weekendLean(freq),
      reason: reasonFor(input, freq, "weekend"),
    },
    {
      days: defaultTrainingDays(easier),
      reason: reasonFor(input, easier, "easier"),
    },
    {
      days: harder !== freq ? defaultTrainingDays(harder) : earlyWeek(freq),
      reason: reasonFor(input, harder !== freq ? harder : freq, harder !== freq ? "harder" : "weekday"),
    },
    {
      days: earlyWeek(freq),
      reason: reasonFor(input, freq, "weekday"),
    },
  ];

  const seen = new Set<string>();
  const out: ScheduleSuggestion[] = [];
  for (const c of candidates) {
    const days = [...new Set(c.days)].sort((a, b) => a - b);
    if (days.length === 0) continue;
    const key = keyOf(days);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: key,
      days,
      frequency: days.length,
      title: formatDays(days),
      reason: c.reason,
    });
    if (out.length >= 5) break;
  }
  return out;
}
