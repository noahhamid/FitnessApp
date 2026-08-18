/**
 * Small knobs that goalDetail / bodyIssues turn on the existing plan.
 * Pure lookup — no I/O. The generator and conditioning planner both read this.
 */

export type GoalDetail =
  | "steady"
  | "tone"
  | "aggressive_cut"
  | "bulk"
  | "lean_muscle"
  | "strength"
  | "stamina"
  | "event"
  | "conditioning"
  | "wellness"
  | "energy"
  | "habit";

export type BodyIssue = "sitting" | "sleep" | "diet" | "none";

export type CardioIntensityCap = "easy" | "moderate" | "hard";

export type GoalDetailTuning = {
  repRange?: [number, number];
  setDelta?: number;
  cardioSessionDelta?: number;
  cardioMinuteDelta?: number;
};

export type BodyIssueTuning = {
  cardioIntensityCap?: CardioIntensityCap;
};

export const GOAL_DETAIL_TUNING: Record<GoalDetail, GoalDetailTuning> = {
  strength: { repRange: [4, 8] },
  bulk: { repRange: [8, 12], setDelta: 1 },
  lean_muscle: { repRange: [8, 12] },
  steady: { repRange: [10, 15] },
  tone: { repRange: [10, 15], cardioSessionDelta: 1 },
  aggressive_cut: { repRange: [12, 15], cardioSessionDelta: 1 },
  stamina: { repRange: [15, 20], cardioSessionDelta: 1 },
  conditioning: { repRange: [15, 20], cardioSessionDelta: 1 },
  event: { repRange: [12, 20], cardioSessionDelta: 1, cardioMinuteDelta: 10 },
  wellness: { repRange: [8, 15] },
  energy: { repRange: [8, 15] },
  habit: { repRange: [8, 15], setDelta: -1 },
};

export const BODY_ISSUE_TUNING: Record<BodyIssue, BodyIssueTuning> = {
  sitting: {},
  sleep: { cardioIntensityCap: "moderate" },
  diet: {},
  none: {},
};

const GOAL_DETAILS = new Set<string>(Object.keys(GOAL_DETAIL_TUNING));
const BODY_ISSUES = new Set<string>(Object.keys(BODY_ISSUE_TUNING));

export function isGoalDetail(value: string | null | undefined): value is GoalDetail {
  return !!value && GOAL_DETAILS.has(value);
}

export function isBodyIssue(value: string): value is BodyIssue {
  return BODY_ISSUES.has(value);
}

export function parseGoalDetail(
  value: string | null | undefined,
): GoalDetail | undefined {
  return isGoalDetail(value) ? value : undefined;
}

export function parseBodyIssues(
  values: string[] | null | undefined,
): BodyIssue[] {
  return (values ?? []).filter(isBodyIssue).filter((issue) => issue !== "none");
}

export function goalDetailTuning(
  value: string | null | undefined,
): GoalDetailTuning {
  const detail = parseGoalDetail(value);
  return detail ? GOAL_DETAIL_TUNING[detail] : {};
}

export function bodyIssueTuning(
  values: string[] | null | undefined,
): BodyIssueTuning {
  const issues = parseBodyIssues(values);
  const out: BodyIssueTuning = {};
  for (const issue of issues) {
    const tuning = BODY_ISSUE_TUNING[issue];
    if (tuning.cardioIntensityCap) {
      out.cardioIntensityCap = tuning.cardioIntensityCap;
    }
  }
  return out;
}
