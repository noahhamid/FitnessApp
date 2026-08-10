import { prisma } from "./prisma";
import { canPerform, type EquipmentAccess } from "./equipment-rank";

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
  candidates: { id: string; name: string; minEquipment: EquipmentAccess; movementPattern: MovementPattern }[],
  userEquipment: EquipmentAccess,
  usedInDay: Set<string>,
  avoidPatterns: Set<MovementPattern>,
): { id: string; name: string } {
  const eligible = candidates.filter((c) => canPerform(userEquipment, c.minEquipment));
  const safe = eligible.filter((c) => !avoidPatterns.has(c.movementPattern));
  const safePool = safe.length > 0 ? safe : eligible;
  const fresh = safePool.filter((c) => !usedInDay.has(c.id));
  const pool = fresh.length > 0 ? fresh : safePool;

  if (pool.length === 0) {
    throw new Error(
      `No exercises available for this muscle group at equipment tier "${userEquipment}". Check Exercise seed data.`,
    );
  }

  // Deterministic pick — same inputs always produce the same plan.
  const chosen = pool[0];
  usedInDay.add(chosen.id);
  return chosen;
}

export async function generateWorkoutPlan(input: WorkoutPlanInput): Promise<WorkoutPlanOut> {
  const { experience, equipment, goalId } = input;
  const injuries = (input.injuries ?? []).filter((i) => i !== "none");
  const focusAreas = (input.focusAreas ?? []).filter((f) => f !== "full_body");
  const focusMuscleGroups = new Set(
    focusAreas.flatMap((f) => FOCUS_TO_MUSCLE_GROUPS[f] ?? []),
  );
  const avoidPatterns = new Set(
    injuries.flatMap((i) => INJURY_AVOID_PATTERNS[i] ?? []),
  );

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

  const days: PlanDayOut[] = substitutedDays.map((day, dayIndex) => {
    const usedInDay = new Set<string>();
    const exercises: PlanExerciseOut[] = day.slots.map((muscleGroup, i) => {
      const candidates = exercisesByGroup.get(muscleGroup) ?? [];
      const chosen = pickExercise(candidates, equipment, usedInDay, avoidPatterns);
      // Extra volume for muscle groups the user asked to prioritize.
      const targetSets = focusMuscleGroups.has(muscleGroup)
        ? Math.min(5, baseSets + 1)
        : baseSets;
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

    return { dayIndex, label: day.label, exercises };
  });

  return { splitLabel: template.splitLabel, daysPerWeek: clampDays(input.daysPerWeek), days };
}