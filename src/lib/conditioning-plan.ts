/**
 * Conditioning (cardio) prescription — pure functions, no I/O.
 *
 * The resistance-training generator only fills muscle-group slots, so an
 * endurance goal used to produce a lifting split and nothing else. This derives
 * the aerobic side of the week from the same onboarding answers: goal sets the
 * dose, injuries and equipment pick a modality that the user can actually do.
 */

export type GoalId = "lose" | "build" | "endure" | "health";
export type EquipmentAccess = "full_gym" | "home_dumbbells" | "bodyweight";

export type ConditioningModality =
  | "bike"
  | "row"
  | "elliptical"
  | "brisk_walk"
  | "bodyweight_circuit";

export type ConditioningIntensity = "easy" | "moderate" | "hard";

export type ConditioningSession = {
  modality: ConditioningModality;
  /** Short display name, e.g. "Zone 2 bike". */
  label: string;
  minutes: number;
  intensity: ConditioningIntensity;
  /** One-line how-to for the session. */
  detail: string;
};

export type ConditioningPlan = {
  sessionsPerWeek: number;
  /** Total aerobic minutes across the week. */
  weeklyMinutes: number;
  sessions: ConditioningSession[];
  /** Why this dose — shown under the card heading. */
  rationale: string;
};

export type ConditioningInput = {
  goalId: GoalId;
  /** Resistance-training days already on the schedule. */
  daysPerWeek: number;
  equipment: EquipmentAccess;
  /** Onboarding injury ids (`none` is ignored). */
  injuries?: string[];
};

const MODALITY_LABEL: Record<ConditioningModality, string> = {
  bike: "bike",
  row: "rower",
  elliptical: "elliptical",
  brisk_walk: "brisk walk",
  bodyweight_circuit: "bodyweight circuit",
};

/**
 * Impact and loaded spinal flexion are the two things injuries rule out here:
 * knees dislike repeated impact, backs dislike the rowing hinge.
 */
function pickModality(
  equipment: EquipmentAccess,
  injuries: string[],
  intensity: ConditioningIntensity,
): ConditioningModality {
  const knees = injuries.includes("knees");
  const back = injuries.includes("back");

  if (equipment === "full_gym") {
    if (back) return "bike";
    if (knees) return intensity === "hard" ? "bike" : "elliptical";
    return intensity === "hard" ? "row" : "bike";
  }

  // No machines — walking is the safe default, circuits carry the hard day
  // unless a joint complaint makes repeated impact a bad idea.
  if (intensity === "hard" && !knees && !back) return "bodyweight_circuit";
  return "brisk_walk";
}

function describe(
  modality: ConditioningModality,
  intensity: ConditioningIntensity,
  minutes: number,
): ConditioningSession {
  const noun = MODALITY_LABEL[modality];

  if (intensity === "hard") {
    return {
      modality,
      label: `Intervals — ${noun}`,
      minutes,
      intensity,
      detail:
        modality === "bodyweight_circuit"
          ? "8 rounds: 30s hard work, 90s easy. Stop a rep short of failure."
          : "8 × 1 min hard with 2 min easy between. Hard means conversation is impossible.",
    };
  }

  if (intensity === "moderate") {
    return {
      modality,
      label: `Steady ${noun}`,
      minutes,
      intensity,
      detail:
        "Hold a pace you could sustain for an hour — breathing deep, still able to talk in short sentences.",
    };
  }

  return {
    modality,
    label: `Zone 2 ${noun}`,
    minutes,
    intensity,
    detail:
      "Easy nose-breathing pace. This should feel almost too slow — that is the point.",
  };
}

/** Sessions to prescribe before recovery load from lifting is considered. */
function baseDose(goalId: GoalId): {
  sessions: number;
  easyMinutes: number;
  includeIntervals: boolean;
  rationale: string;
} {
  switch (goalId) {
    case "endure":
      return {
        sessions: 3,
        easyMinutes: 35,
        includeIntervals: true,
        rationale:
          "Endurance is built mostly from easy aerobic volume, with one hard session to lift your ceiling.",
      };
    case "lose":
      return {
        sessions: 2,
        easyMinutes: 30,
        includeIntervals: false,
        rationale:
          "Steady aerobic work adds to your weekly deficit without cutting into lifting recovery.",
      };
    case "health":
      return {
        sessions: 2,
        easyMinutes: 25,
        includeIntervals: false,
        rationale:
          "Two easy aerobic sessions a week covers the cardiovascular side of general health.",
      };
    case "build":
      return {
        sessions: 1,
        easyMinutes: 20,
        includeIntervals: false,
        rationale:
          "Just enough aerobic work to keep conditioning and appetite healthy while you gain.",
      };
  }
}

/**
 * Conditioning for the week, or null when the lifting schedule already fills
 * the recovery budget (6–7 training days on a muscle-gain block).
 */
export function planConditioning(
  input: ConditioningInput,
): ConditioningPlan | null {
  const injuries = (input.injuries ?? []).filter((i) => i !== "none");
  const dose = baseDose(input.goalId);

  // High lifting frequency eats the recovery budget — trim aerobic sessions
  // rather than stacking fatigue on top of six or seven gym days.
  let sessions = dose.sessions;
  if (input.daysPerWeek >= 6) {
    sessions = input.goalId === "endure" ? 2 : sessions - 1;
  } else if (input.daysPerWeek === 5 && input.goalId === "build") {
    sessions = 1;
  }

  if (sessions <= 0) return null;

  const out: ConditioningSession[] = [];

  if (dose.includeIntervals && sessions >= 2) {
    const hardModality = pickModality(input.equipment, injuries, "hard");
    out.push(describe(hardModality, "hard", 22));
    sessions -= 1;
  }

  const easyIntensity: ConditioningIntensity =
    input.goalId === "lose" ? "moderate" : "easy";
  const easyModality = pickModality(input.equipment, injuries, easyIntensity);
  for (let i = 0; i < sessions; i++) {
    out.push(describe(easyModality, easyIntensity, dose.easyMinutes));
  }

  return {
    sessionsPerWeek: out.length,
    weeklyMinutes: out.reduce((sum, s) => sum + s.minutes, 0),
    sessions: out,
    rationale: dose.rationale,
  };
}
