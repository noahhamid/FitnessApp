import { prisma } from "./prisma";
import { canPerform, type EquipmentAccess } from "./equipment-rank";
import { dayTitleFromMuscleGroups } from "./plan-day-title";

export type ExperienceLevel = "novice" | "intermediate" | "advanced";
export type GoalId = "lose" | "build" | "endure" | "health";
export type MuscleGroup =
  | "chest" | "back" | "shoulders" | "quads" | "hamstrings"
  | "glutes" | "calves" | "biceps" | "triceps" | "core";
export type MovementPattern = "push" | "pull" | "hinge" | "squat" | "carry";

/** Onboarding focus-area ids, mapped to the muscle groups they bias. */
export type FocusArea =
  | "chest" | "back" | "arms" | "abs" | "glutes" | "legs" | "full_body";

/** Onboarding injury ids. */
export type Injury = "none" | "knees" | "back" | "shoulders" | "wrists";

export interface WorkoutPlanInput {
  daysPerWeek: number; // 2-7
  experience: ExperienceLevel;
  equipment: EquipmentAccess;
  goalId: GoalId;
  /** Extra set volume is added to muscle groups covered by these. */
  focusAreas?: FocusArea[];
  /** Steers slot selection away from movements that load these joints. */
  injuries?: Injury[];
  /** Onboarding goal nuance chip id (e.g. "strength", "aggressive_cut"). */
  goalDetail?: string | null;
  /**
   * Onboarding body-issue chip ids (e.g. "sitting", "sleep").
   * Note: "diet" is intentionally ignored here — nutrition-domain only.
   */
  bodyIssues?: string[];
}

const FOCUS_TO_MUSCLE_GROUPS: Record<FocusArea, MuscleGroup[]> = {
  chest: ["chest"],
  back: ["back"],
  arms: ["biceps", "triceps"],
  abs: ["core"],
  glutes: ["glutes"],
  legs: ["quads", "hamstrings", "calves"],
  full_body: [],
};

/** Movement patterns to avoid entirely for a given injury (safety-first). */
const INJURY_AVOID_PATTERNS: Record<Injury, MovementPattern[]> = {
  none: [],
  knees: ["squat"],
  back: ["hinge"],
  shoulders: [],
  wrists: ["carry"],
};

/** Muscle groups that get swapped out for a safer alternative when injured. */
const INJURY_AVOID_MUSCLE_GROUPS: Record<Injury, MuscleGroup | null> = {
  none: null,
  knees: null,
  back: null,
  shoulders: "shoulders",
  wrists: null,
};

/**
 * Extra targetSets from goalDetail (applied on every slot, then capped).
 * Stacks with the focus-area +1 for prioritized muscle groups.
 */
const GOAL_DETAIL_VOLUME_BONUS: Record<string, number> = {
  aggressive_cut: 1,
  bulk: 1,
};

/**
 * Soft pattern preference from goalDetail — sorts candidates so these
 * patterns are tried first. Not a hard filter (unlike injury avoidance).
 */
const GOAL_DETAIL_PATTERN_BIAS: Record<string, MovementPattern[]> = {
  strength: ["squat", "hinge", "push", "pull"],
  conditioning: ["carry"],
  stamina: ["carry"],
};

/**
 * Soft pattern preference from bodyIssues.
 * "diet" has no entry — nutrition-domain signal, out of scope for workout gen.
 */
const BODY_ISSUE_PATTERN_BIAS: Record<string, MovementPattern[]> = {
  sitting: ["hinge"],
};

/**
 * Additive targetSets delta from bodyIssues (can be negative).
 * "diet" intentionally omitted — nutrition-domain, not workout generation.
 */
const BODY_ISSUE_VOLUME_ADJUSTMENT: Record<string, number> = {
  sleep: -1,
};

export interface PlanExerciseOut {
  orderIndex: number;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
}

export interface PlanDayOut {
  dayIndex: number;
  label: string;
  exercises: PlanExerciseOut[];
}

export interface WorkoutPlanOut {
  splitLabel: string;
  daysPerWeek: number;
  days: PlanDayOut[];
}

// --- 1. Split template selection (unchanged from before — this part
// doesn't touch the DB, it's pure structure) ---
type Slot = MuscleGroup;

interface DayTemplate {
  label: string;
  slots: Slot[];
}

function clampDays(days: number): number {
  return Math.min(7, Math.max(2, Math.round(days)));
}

function getSplitTemplate(daysPerWeek: number, experience: ExperienceLevel): {
  splitLabel: string;
  days: DayTemplate[];
} {
  const days = clampDays(daysPerWeek);

  const fullBodyDay = (label: string): DayTemplate => ({
    label,
    slots: ["quads", "chest", "back", "shoulders", "core"],
  });
  const pushDay = (label = "Push Day"): DayTemplate => ({
    label,
    slots: ["chest", "chest", "shoulders", "shoulders", "triceps"],
  });
  const pullDay = (label = "Pull Day"): DayTemplate => ({
    label,
    slots: ["back", "back", "back", "biceps", "biceps"],
  });
  const legsDay = (label = "Leg Day"): DayTemplate => ({
    label,
    slots: ["quads", "quads", "hamstrings", "glutes", "calves"],
  });
  const upperDay = (label = "Upper Body"): DayTemplate => ({
    label,
    slots: ["chest", "back", "shoulders", "biceps", "triceps"],
  });
  const lowerDay = (label = "Lower Body"): DayTemplate => ({
    label,
    slots: ["quads", "hamstrings", "glutes", "calves", "core"],
  });

  if (days === 2) {
    return { splitLabel: "Full Body", days: [fullBodyDay("Full Body A"), fullBodyDay("Full Body B")] };
  }
  if (days === 3) {
    if (experience === "novice") {
      return {
        splitLabel: "Full Body",
        days: [fullBodyDay("Full Body A"), fullBodyDay("Full Body B"), fullBodyDay("Full Body C")],
      };
    }
    return { splitLabel: "Push / Pull / Legs", days: [pushDay(), pullDay(), legsDay()] };
  }
  if (days === 4) {
    return {
      splitLabel: "Upper / Lower",
      days: [upperDay("Upper A"), lowerDay("Lower A"), upperDay("Upper B"), lowerDay("Lower B")],
    };
  }
  if (days === 5) {
    return {
      splitLabel: "Push / Pull / Legs / Upper / Lower",
      days: [pushDay(), pullDay(), legsDay(), upperDay(), lowerDay()],
    };
  }
  if (days === 6) {
    return {
      splitLabel: "Push / Pull / Legs ×2",
      days: [
        pushDay("Push A"), pullDay("Pull A"), legsDay("Legs A"),
        pushDay("Push B"), pullDay("Pull B"), legsDay("Legs B"),
      ],
    };
  }
  return {
    splitLabel: "Push / Pull / Legs ×2 + Full Body",
    days: [
      pushDay("Push A"), pullDay("Pull A"), legsDay("Legs A"),
      pushDay("Push B"), pullDay("Pull B"), legsDay("Legs B"),
      fullBodyDay("Full Body C"),
    ],
  };
}

const SETS_BY_EXPERIENCE: Record<ExperienceLevel, number> = {
  novice: 3,
  intermediate: 4,
  advanced: 4,
};

const REP_RANGE_BY_GOAL: Record<GoalId, [number, number]> = {
  lose: [10, 15],
  build: [6, 12],
  endure: [15, 20],
  health: [8, 15],
};

// --- 2. Exercise selection — queries the real Exercise table ---
async function loadExercisesByMuscleGroup(
  muscleGroups: MuscleGroup[],
): Promise<
  Map<
    MuscleGroup,
    { id: string; name: string; minEquipment: EquipmentAccess; movementPattern: MovementPattern }[]
  >
> {
  const rows = await prisma.exercise.findMany({
    where: { muscleGroup: { in: muscleGroups as any } },
  });

  const map = new Map<
    MuscleGroup,
    { id: string; name: string; minEquipment: EquipmentAccess; movementPattern: MovementPattern }[]
  >();
  for (const row of rows) {
    const list = map.get(row.muscleGroup as MuscleGroup) ?? [];
    list.push({
      id: row.id,
      name: row.name,
      minEquipment: row.minEquipment as EquipmentAccess,
      movementPattern: row.movementPattern as MovementPattern,
    });
    map.set(row.muscleGroup as MuscleGroup, list);
  }
  // Stable order so rotation offsets mean the same thing on every regeneration,
  // regardless of the order Postgres returned the rows in.
  for (const list of map.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return map;
}

/** Injuries can retarget a slot's muscle group entirely (e.g. shoulders → core). */
function substituteMuscleGroup(
  muscleGroup: MuscleGroup,
  injuries: Injury[],
): MuscleGroup {
  for (const injury of injuries) {
    const avoid = INJURY_AVOID_MUSCLE_GROUPS[injury];
    if (avoid === muscleGroup) return "core";
  }
  return muscleGroup;
}

function pickExercise(
  candidates: {
    id: string;
    name: string;
    minEquipment: EquipmentAccess;
    movementPattern: MovementPattern;
  }[],
  userEquipment: EquipmentAccess,
  usedInDay: Set<string>,
  avoidPatterns: Set<MovementPattern>,
  /**
   * How many times this muscle group has already been filled anywhere in the
   * plan. Walking the pool from this offset is what makes Push A and Push B
   * (or Full Body A/B/C) draw different movements instead of repeating the
   * same first match every slot.
   */
  rotationOffset: number,
  /** Soft preference — tried first after injury hard-filter; never excludes. */
  preferredPatterns: Set<MovementPattern> = new Set(),
): { id: string; name: string } {
  const eligible = candidates.filter((c) =>
    canPerform(userEquipment, c.minEquipment),
  );
  // Injury avoidance is a hard filter (falls back to eligible if empty).
  const safe = eligible.filter((c) => !avoidPatterns.has(c.movementPattern));
  let pool = safe.length > 0 ? safe : eligible;

  if (pool.length === 0) {
    throw new Error(
      `No exercises available for this muscle group at equipment tier "${userEquipment}". Check Exercise seed data.`,
    );
  }

  // Soft pattern bias (goalDetail / bodyIssues): preferred patterns first,
  // then the rest. Injury hard-filter already applied above and wins.
  if (preferredPatterns.size > 0) {
    const preferred = pool.filter((c) =>
      preferredPatterns.has(c.movementPattern),
    );
    if (preferred.length > 0) {
      const rest = pool.filter(
        (c) => !preferredPatterns.has(c.movementPattern),
      );
      pool = [...preferred, ...rest];
    }
  }

  // Deterministic rotation — same inputs always produce the same plan, but
  // consecutive slots for one muscle group advance through the pool.
  const start = rotationOffset % pool.length;
  let chosen = pool[start];
  for (let i = 0; i < pool.length; i++) {
    const candidate = pool[(start + i) % pool.length];
    if (!usedInDay.has(candidate.id)) {
      chosen = candidate;
      break;
    }
  }

  usedInDay.add(chosen.id);
  return chosen;
}

/**
 * Combined set prescription: base → focus (+1) → goalDetail bonus →
 * bodyIssue delta → clamp to [2, 5]. Additive; order does not change the
 * net before clamp (focus +1 and sleep −1 cancel to baseSets).
 */
export function computeTargetSets(
  baseSets: number,
  focusBonus: boolean,
  goalDetailBonus: number,
  bodyIssueVolumeDelta: number,
): number {
  let sets = baseSets;
  if (focusBonus) sets += 1;
  sets += goalDetailBonus;
  sets += bodyIssueVolumeDelta;
  return Math.min(5, Math.max(2, sets));
}

export async function generateWorkoutPlan(
  input: WorkoutPlanInput,
): Promise<WorkoutPlanOut> {
  const { experience, equipment, goalId } = input;
  const injuries = (input.injuries ?? []).filter((i) => i !== "none");
  const focusAreas = (input.focusAreas ?? []).filter((f) => f !== "full_body");
  const focusMuscleGroups = new Set(
    focusAreas.flatMap((f) => FOCUS_TO_MUSCLE_GROUPS[f] ?? []),
  );
  const avoidPatterns = new Set(
    injuries.flatMap((i) => INJURY_AVOID_PATTERNS[i] ?? []),
  );

  const goalDetail = input.goalDetail?.trim() || "";
  const goalDetailBonus = GOAL_DETAIL_VOLUME_BONUS[goalDetail] ?? 0;
  const bodyIssues = (input.bodyIssues ?? []).filter((i) => i !== "none");
  // "diet" is a nutrition-domain signal — no BODY_ISSUE_* mapping on purpose.
  const bodyIssueVolumeDelta = bodyIssues.reduce(
    (sum, id) => sum + (BODY_ISSUE_VOLUME_ADJUSTMENT[id] ?? 0),
    0,
  );

  const preferredPatterns = new Set<MovementPattern>([
    ...(GOAL_DETAIL_PATTERN_BIAS[goalDetail] ?? []),
    ...bodyIssues.flatMap((id) => BODY_ISSUE_PATTERN_BIAS[id] ?? []),
  ]);

  const template = getSplitTemplate(input.daysPerWeek, experience);
  const baseSets = SETS_BY_EXPERIENCE[experience];
  const [repLow, repHigh] = REP_RANGE_BY_GOAL[goalId];

  // Apply injury substitutions to the template before loading candidates,
  // so a swapped-out muscle group (e.g. shoulders → core) is loaded too.
  const substitutedDays = template.days.map((day) => ({
    ...day,
    slots: day.slots.map((slot) => substituteMuscleGroup(slot, injuries)),
  }));

  const allMuscleGroups = [...new Set(substitutedDays.flatMap((d) => d.slots))];
  const exercisesByGroup = await loadExercisesByMuscleGroup(allMuscleGroups);

  // Rotation cursor per muscle group, carried across days so a repeated day
  // template (Push A / Push B) doesn't produce an identical workout.
  const groupRotation = new Map<MuscleGroup, number>();

  const days: PlanDayOut[] = substitutedDays.map((day, dayIndex) => {
    const usedInDay = new Set<string>();
    const exercises: PlanExerciseOut[] = day.slots.map((muscleGroup, i) => {
      const candidates = exercisesByGroup.get(muscleGroup) ?? [];
      const rotationOffset = groupRotation.get(muscleGroup) ?? 0;
      groupRotation.set(muscleGroup, rotationOffset + 1);
      const chosen = pickExercise(
        candidates,
        equipment,
        usedInDay,
        avoidPatterns,
        rotationOffset,
        preferredPatterns,
      );
      const targetSets = computeTargetSets(
        baseSets,
        focusMuscleGroups.has(muscleGroup),
        goalDetailBonus,
        bodyIssueVolumeDelta,
      );
      return {
        orderIndex: i,
        exerciseId: chosen.id,
        exerciseName: chosen.name,
        muscleGroup,
        targetSets,
        targetRepsMin: repLow,
        targetRepsMax: repHigh,
      };
    });

    return {
      dayIndex,
      // Store muscle-derived title; UI also recomputes at render for old rows.
      label: dayTitleFromMuscleGroups(exercises),
      exercises,
    };
  });

  return {
    splitLabel: template.splitLabel,
    daysPerWeek: clampDays(input.daysPerWeek),
    days,
  };
}