import type { EquipmentAccess } from "./equipment-rank";
import {
  parseBodyIssues,
  parseGoalDetail,
  type BodyIssue,
  type GoalDetail,
} from "./plan-modifiers";

type Injury = "none" | "knees" | "back" | "shoulders" | "wrists";

export type BlockMove = {
  /** Exercise.name per tier; resolution falls back down the tiers. */
  byTier: Record<EquipmentAccess, string>;
  sets: number;
  repsMin: number;
  repsMax: number;
  /** Dropped when the user reported one of these injuries. */
  skipForInjuries?: Injury[];
};

export type PlanBlock = {
  id: string;
  label: string;
  moves: BlockMove[];
};

const bw = (name: string): Record<EquipmentAccess, string> => ({
  bodyweight: name,
  home_dumbbells: name,
  full_gym: name,
});

const ISSUE_BLOCKS: Record<"sitting" | "sleep", PlanBlock> = {
  sitting: {
    id: "desk_reset",
    label: "Desk Reset",
    moves: [
      {
        byTier: bw("Hip Flexor Lunge Stretch"),
        sets: 2,
        repsMin: 30,
        repsMax: 30,
        skipForInjuries: ["knees"],
      },
      {
        byTier: bw("Glute Bridge Hold"),
        sets: 2,
        repsMin: 30,
        repsMax: 30,
      },
      {
        byTier: {
          bodyweight: "Standing Thoracic Rotation",
          home_dumbbells: "Banded Pull-Apart",
          full_gym: "Cable Face Pull",
        },
        sets: 2,
        repsMin: 12,
        repsMax: 15,
      },
      {
        byTier: {
          bodyweight: "Dead Bug",
          home_dumbbells: "Dumbbell Goblet Hold",
          full_gym: "Cable Pallof Press",
        },
        sets: 2,
        repsMin: 10,
        repsMax: 12,
      },
    ],
  },
  sleep: {
    id: "wind_down",
    label: "Wind Down",
    moves: [
      { byTier: bw("Child's Pose"), sets: 2, repsMin: 40, repsMax: 40 },
      { byTier: bw("Supine Spinal Twist"), sets: 2, repsMin: 30, repsMax: 30 },
      { byTier: bw("Cat-Cow Stretch"), sets: 2, repsMin: 40, repsMax: 40 },
      {
        byTier: {
          bodyweight: "Single Leg Hip Hinge Reach",
          home_dumbbells: "Legs-Up-the-Wall",
          full_gym: "Legs-Up-the-Wall",
        },
        sets: 2,
        repsMin: 45,
        repsMax: 45,
      },
    ],
  },
};

const GOAL_BLOCKS: Record<string, PlanBlock> = {
  heavy_support: {
    id: "heavy_support",
    label: "Heavy Support",
    moves: [
      {
        byTier: {
          bodyweight: "Superman Hold",
          home_dumbbells: "Dumbbell Farmer Carry",
          full_gym: "Trap Bar Farmer Carry",
        },
        sets: 3,
        repsMin: 30,
        repsMax: 40,
        skipForInjuries: ["back", "wrists"],
      },
      {
        byTier: {
          bodyweight: "Glute Bridge Hold",
          home_dumbbells: "Dumbbell Romanian Deadlift",
          full_gym: "Barbell Romanian Deadlift",
        },
        sets: 3,
        repsMin: 6,
        repsMax: 8,
      },
      {
        byTier: {
          bodyweight: "Bird Dog",
          home_dumbbells: "Dumbbell Suitcase Carry",
          full_gym: "Cable Pallof Press",
        },
        sets: 3,
        repsMin: 8,
        repsMax: 10,
        skipForInjuries: ["wrists"],
      },
      {
        byTier: {
          bodyweight: "Calf Raise Iso Hold",
          home_dumbbells: "Dumbbell Goblet Hold",
          full_gym: "Cable Rope Overhead Extension",
        },
        sets: 3,
        repsMin: 10,
        repsMax: 30,
        skipForInjuries: ["knees"],
      },
    ],
  },
  growth_finisher: {
    id: "growth_finisher",
    label: "Growth Finisher",
    moves: [
      {
        byTier: {
          bodyweight: "Pike Push-up",
          home_dumbbells: "Dumbbell Pullover",
          full_gym: "Cable Face Pull",
        },
        sets: 3,
        repsMin: 10,
        repsMax: 12,
        skipForInjuries: ["shoulders", "wrists"],
      },
      {
        byTier: {
          bodyweight: "Prone Y Raise",
          home_dumbbells: "Banded Pull-Apart",
          full_gym: "Cable Rope Overhead Extension",
        },
        sets: 3,
        repsMin: 12,
        repsMax: 15,
      },
      {
        byTier: {
          bodyweight: "Glute Bridge Hold",
          home_dumbbells: "Dumbbell Goblet Hold",
          full_gym: "Trap Bar Farmer Carry",
        },
        sets: 3,
        repsMin: 10,
        repsMax: 12,
        skipForInjuries: ["wrists"],
      },
      {
        byTier: {
          bodyweight: "Dead Bug",
          home_dumbbells: "Banded External Rotation",
          full_gym: "Cable Pallof Press",
        },
        sets: 3,
        repsMin: 10,
        repsMax: 12,
      },
    ],
  },
  metabolic_finisher: {
    id: "metabolic_finisher",
    label: "Metabolic Finisher",
    moves: [
      {
        byTier: bw("Mountain Climbers"),
        sets: 3,
        repsMin: 30,
        repsMax: 30,
        skipForInjuries: ["wrists", "shoulders"],
      },
      {
        byTier: bw("Burpee"),
        sets: 3,
        repsMin: 8,
        repsMax: 10,
        skipForInjuries: ["knees", "back"],
      },
      {
        byTier: bw("High Knees"),
        sets: 3,
        repsMin: 30,
        repsMax: 30,
        skipForInjuries: ["knees"],
      },
      {
        byTier: {
          bodyweight: "Bear Crawl Shoulder Hold",
          home_dumbbells: "Dumbbell Farmer Carry",
          full_gym: "Trap Bar Farmer Carry",
        },
        sets: 3,
        repsMin: 30,
        repsMax: 40,
        skipForInjuries: ["knees", "wrists"],
      },
    ],
  },
  engine_builder: {
    id: "engine_builder",
    label: "Engine Builder",
    moves: [
      {
        byTier: bw("High Knees"),
        sets: 3,
        repsMin: 30,
        repsMax: 30,
        skipForInjuries: ["knees"],
      },
      {
        byTier: bw("Mountain Climbers"),
        sets: 3,
        repsMin: 30,
        repsMax: 30,
        skipForInjuries: ["wrists", "shoulders"],
      },
      {
        byTier: {
          bodyweight: "Burpee",
          home_dumbbells: "Dumbbell Farmer Carry",
          full_gym: "Trap Bar Farmer Carry",
        },
        sets: 3,
        repsMin: 8,
        repsMax: 12,
        skipForInjuries: ["knees", "back", "wrists"],
      },
      {
        byTier: {
          bodyweight: "Bird Dog",
          home_dumbbells: "Dumbbell Suitcase Carry",
          full_gym: "Cable Pallof Press",
        },
        sets: 3,
        repsMin: 10,
        repsMax: 12,
        skipForInjuries: ["wrists"],
      },
    ],
  },
  daily_movement: {
    id: "daily_movement",
    label: "Daily Movement",
    moves: [
      { byTier: bw("Cat-Cow Stretch"), sets: 2, repsMin: 40, repsMax: 40 },
      {
        byTier: bw("Hip Flexor Lunge Stretch"),
        sets: 2,
        repsMin: 30,
        repsMax: 30,
        skipForInjuries: ["knees"],
      },
      {
        byTier: {
          bodyweight: "Bird Dog",
          home_dumbbells: "Banded Pull-Apart",
          full_gym: "Cable Face Pull",
        },
        sets: 2,
        repsMin: 10,
        repsMax: 12,
      },
      {
        byTier: {
          bodyweight: "Glute Bridge Hold",
          home_dumbbells: "Dead Bug",
          full_gym: "Cable Pallof Press",
        },
        sets: 2,
        repsMin: 10,
        repsMax: 12,
      },
    ],
  },
};

const GOAL_DETAIL_TO_BLOCK: Record<GoalDetail, keyof typeof GOAL_BLOCKS> = {
  strength: "heavy_support",
  bulk: "growth_finisher",
  lean_muscle: "growth_finisher",
  steady: "metabolic_finisher",
  tone: "metabolic_finisher",
  aggressive_cut: "metabolic_finisher",
  stamina: "engine_builder",
  event: "engine_builder",
  conditioning: "engine_builder",
  wellness: "daily_movement",
  energy: "daily_movement",
  habit: "daily_movement",
};

const ISSUE_PRIORITY: BodyIssue[] = ["sitting", "sleep"];

const TIER_FALLBACK: Record<EquipmentAccess, EquipmentAccess[]> = {
  full_gym: ["full_gym", "home_dumbbells", "bodyweight"],
  home_dumbbells: ["home_dumbbells", "bodyweight"],
  bodyweight: ["bodyweight"],
};

export function goalDetailBlock(
  goalDetail: string | null | undefined,
): PlanBlock | null {
  const detail = parseGoalDetail(goalDetail);
  if (!detail) return null;
  return GOAL_BLOCKS[GOAL_DETAIL_TO_BLOCK[detail]] ?? null;
}

export function issueBlock(
  bodyIssues: string[] | null | undefined,
): PlanBlock | null {
  const issues = parseBodyIssues(bodyIssues);
  for (const id of ISSUE_PRIORITY) {
    if (issues.includes(id) && (id === "sitting" || id === "sleep")) {
      return ISSUE_BLOCKS[id];
    }
  }
  return null;
}

/**
 * Exactly one block per training day. The goal-detail block lands on up to
 * two evenly spaced days; remaining days get the highest-priority issue block.
 */
export function assignBlocksToDays(input: {
  dayCount: number;
  goalDetail?: string | null;
  bodyIssues?: string[] | null;
}): (PlanBlock | null)[] {
  const goal = goalDetailBlock(input.goalDetail);
  const issue = issueBlock(input.bodyIssues);
  const assigned: (PlanBlock | null)[] = Array.from(
    { length: input.dayCount },
    () => issue,
  );

  if (goal && input.dayCount > 0) {
    assigned[0] = goal;
    if (input.dayCount >= 2) {
      // 2 days → both; 3 → 0 and 2; 4 → 0 and 2; 6 → 0 and 4.
      const second =
        input.dayCount === 2
          ? 1
          : Math.floor((input.dayCount * 2) / 3);
      assigned[second] = goal;
    }
  }

  return assigned;
}

export function namesForMove(
  move: BlockMove,
  equipment: EquipmentAccess,
): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const tier of TIER_FALLBACK[equipment]) {
    const name = move.byTier[tier];
    if (name && !seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }
  return names;
}

export function allBlockExerciseNames(): string[] {
  const names = new Set<string>();
  const blocks = [...Object.values(ISSUE_BLOCKS), ...Object.values(GOAL_BLOCKS)];
  for (const block of blocks) {
    for (const move of block.moves) {
      for (const name of Object.values(move.byTier)) names.add(name);
    }
  }
  return [...names];
}

export function moveAllowedForInjuries(
  move: BlockMove,
  injuries: Injury[],
): boolean {
  if (!move.skipForInjuries?.length) return true;
  return !move.skipForInjuries.some((injury) => injuries.includes(injury));
}
