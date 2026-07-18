import { prisma } from "./prisma";
import { canPerform, type EquipmentAccess } from "./equipment-rank";

export type ExperienceLevel = "novice" | "intermediate" | "advanced";
export type GoalId = "lose" | "build" | "endure" | "health";
export type MuscleGroup =
  | "chest" | "back" | "shoulders" | "quads" | "hamstrings"
  | "glutes" | "calves" | "biceps" | "triceps" | "core";

export interface WorkoutPlanInput {
  daysPerWeek: number; // 2-6
  experience: ExperienceLevel;
  equipment: EquipmentAccess;
  goalId: GoalId;
}

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
  return Math.min(6, Math.max(2, Math.round(days)));
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
  return {
    splitLabel: "Push / Pull / Legs ×2",
    days: [
      pushDay("Push A"), pullDay("Pull A"), legsDay("Legs A"),
      pushDay("Push B"), pullDay("Pull B"), legsDay("Legs B"),
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
): Promise<Map<MuscleGroup, { id: string; name: string; minEquipment: EquipmentAccess }[]>> {
  const rows = await prisma.exercise.findMany({
    where: { muscleGroup: { in: muscleGroups as any } },
  });

  const map = new Map<MuscleGroup, { id: string; name: string; minEquipment: EquipmentAccess }[]>();
  for (const row of rows) {
    const list = map.get(row.muscleGroup as MuscleGroup) ?? [];
    list.push({ id: row.id, name: row.name, minEquipment: row.minEquipment as EquipmentAccess });
    map.set(row.muscleGroup as MuscleGroup, list);
  }
  return map;
}

function pickExercise(
  candidates: { id: string; name: string; minEquipment: EquipmentAccess }[],
  userEquipment: EquipmentAccess,
  usedInDay: Set<string>,
): { id: string; name: string } {
  const eligible = candidates.filter((c) => canPerform(userEquipment, c.minEquipment));
  const fresh = eligible.filter((c) => !usedInDay.has(c.id));
  const pool = fresh.length > 0 ? fresh : eligible;

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
  const template = getSplitTemplate(input.daysPerWeek, experience);
  const sets = SETS_BY_EXPERIENCE[experience];
  const [repLow, repHigh] = REP_RANGE_BY_GOAL[goalId];

  const allMuscleGroups = [...new Set(template.days.flatMap((d) => d.slots))];
  const exercisesByGroup = await loadExercisesByMuscleGroup(allMuscleGroups);

  const days: PlanDayOut[] = template.days.map((day, dayIndex) => {
    const usedInDay = new Set<string>();
    const exercises: PlanExerciseOut[] = day.slots.map((muscleGroup, i) => {
      const candidates = exercisesByGroup.get(muscleGroup) ?? [];
      const chosen = pickExercise(candidates, equipment, usedInDay);
      return {
        orderIndex: i,
        exerciseId: chosen.id,
        exerciseName: chosen.name,
        muscleGroup,
        targetSets: sets,
        targetRepsMin: repLow,
        targetRepsMax: repHigh,
      };
    });

    return { dayIndex, label: day.label, exercises };
  });

  return { splitLabel: template.splitLabel, daysPerWeek: clampDays(input.daysPerWeek), days };
}