import type { ImageSourcePropType } from "react-native";

export type ChipGender = "male" | "female";

type Gendered = Record<ChipGender, ImageSourcePropType>;

function g(
  male: ImageSourcePropType,
  female: ImageSourcePropType,
): Gendered {
  return { male, female };
}

function pick(map: Gendered, gender: ChipGender): ImageSourcePropType {
  return map[gender] ?? map.male;
}

/**
 * Every option owns a dedicated file so no two chips can share a photo.
 * Person-centric questions (focus, goal detail, pace, experience) are
 * gendered; gear and time-of-day questions are not, because the subject
 * of the photo isn't a body.
 */

/** Body-part focus — the named muscle group is the subject. */
const FOCUS: Record<string, Gendered> = {
  chest: g(
    require("@/assets/images/chips/male/focus-chest.jpg"),
    require("@/assets/images/chips/female/focus-chest.jpg"),
  ),
  back: g(
    require("@/assets/images/chips/male/focus-back.jpg"),
    require("@/assets/images/chips/female/focus-back.jpg"),
  ),
  arms: g(
    require("@/assets/images/chips/male/focus-arms.jpg"),
    require("@/assets/images/chips/female/focus-arms.jpg"),
  ),
  abs: g(
    require("@/assets/images/chips/male/focus-abs.jpg"),
    require("@/assets/images/chips/female/focus-abs.jpg"),
  ),
  glutes: g(
    require("@/assets/images/chips/male/focus-glutes.jpg"),
    require("@/assets/images/chips/female/focus-glutes.jpg"),
  ),
  legs: g(
    require("@/assets/images/chips/male/focus-legs.jpg"),
    require("@/assets/images/chips/female/focus-legs.jpg"),
  ),
  full_body: g(
    require("@/assets/images/chips/male/focus-full-body.jpg"),
    require("@/assets/images/chips/female/focus-full-body.jpg"),
  ),
};

/** Goal detail — the physique/outcome the option describes. */
const GOAL_DETAIL: Record<string, Gendered> = {
  steady: g(
    require("@/assets/images/chips/male/goal-steady.jpg"),
    require("@/assets/images/chips/female/goal-steady.jpg"),
  ),
  tone: g(
    require("@/assets/images/chips/male/goal-tone.jpg"),
    require("@/assets/images/chips/female/goal-tone.jpg"),
  ),
  aggressive_cut: g(
    require("@/assets/images/chips/male/goal-cut.jpg"),
    require("@/assets/images/chips/female/goal-cut.jpg"),
  ),
  bulk: g(
    require("@/assets/images/chips/male/goal-bulk.jpg"),
    require("@/assets/images/chips/female/goal-bulk.jpg"),
  ),
  lean_muscle: g(
    require("@/assets/images/chips/male/goal-lean.jpg"),
    require("@/assets/images/chips/female/goal-lean.jpg"),
  ),
  strength: g(
    require("@/assets/images/chips/male/goal-strength.jpg"),
    require("@/assets/images/chips/female/goal-strength.jpg"),
  ),
  stamina: g(
    require("@/assets/images/chips/male/goal-stamina.jpg"),
    require("@/assets/images/chips/female/goal-stamina.jpg"),
  ),
  event: g(
    require("@/assets/images/chips/male/goal-event.jpg"),
    require("@/assets/images/chips/female/goal-event.jpg"),
  ),
  conditioning: g(
    require("@/assets/images/chips/male/goal-conditioning.jpg"),
    require("@/assets/images/chips/female/goal-conditioning.jpg"),
  ),
  wellness: g(
    require("@/assets/images/chips/male/goal-wellness.jpg"),
    require("@/assets/images/chips/female/goal-wellness.jpg"),
  ),
  energy: g(
    require("@/assets/images/chips/male/goal-energy.jpg"),
    require("@/assets/images/chips/female/goal-energy.jpg"),
  ),
  habit: g(
    require("@/assets/images/chips/male/goal-habit.jpg"),
    require("@/assets/images/chips/female/goal-habit.jpg"),
  ),
};

/** Pace — how hard the training looks, not a physique. */
const PACE: Record<string, Gendered> = {
  slow: g(
    require("@/assets/images/chips/male/pace-slow.jpg"),
    require("@/assets/images/chips/female/pace-slow.jpg"),
  ),
  moderate: g(
    require("@/assets/images/chips/male/pace-moderate.jpg"),
    require("@/assets/images/chips/female/pace-moderate.jpg"),
  ),
  aggressive: g(
    require("@/assets/images/chips/male/pace-aggressive.jpg"),
    require("@/assets/images/chips/female/pace-aggressive.jpg"),
  ),
};

/** Experience — how practiced the lifter in the photo looks. */
const EXPERIENCE: Record<string, Gendered> = {
  novice: g(
    require("@/assets/images/chips/male/exp-novice.jpg"),
    require("@/assets/images/chips/female/exp-novice.jpg"),
  ),
  intermediate: g(
    require("@/assets/images/chips/male/exp-intermediate.jpg"),
    require("@/assets/images/chips/female/exp-intermediate.jpg"),
  ),
  advanced: g(
    require("@/assets/images/chips/male/exp-advanced.jpg"),
    require("@/assets/images/chips/female/exp-advanced.jpg"),
  ),
};

/** Equipment — the gear and space are the subject, so not gendered. */
const EQUIPMENT: Record<string, ImageSourcePropType> = {
  full_gym: require("@/assets/images/chips/shared/equip-full-gym.jpg"),
  home_dumbbells: require("@/assets/images/chips/shared/equip-dumbbells.jpg"),
  bodyweight: require("@/assets/images/chips/shared/equip-bodyweight.jpg"),
};

/** Lifestyle issues — scenes, so shared across genders. */
const BODY_ISSUE: Record<string, ImageSourcePropType> = {
  sitting: require("@/assets/images/chips/issue-sitting.jpg"),
  sleep: require("@/assets/images/chips/issue-sleep.jpg"),
  diet: require("@/assets/images/chips/issue-diet.jpg"),
  none: require("@/assets/images/chips/issue-none.jpg"),
};

/** Injuries — gendered so male/female onboarding each get matching subjects. */
const INJURY: Record<string, Gendered> = {
  none: g(
    require("@/assets/images/chips/male/injury-none.jpg"),
    require("@/assets/images/chips/female/injury-none.jpg"),
  ),
  knees: g(
    require("@/assets/images/chips/male/injury-knees.jpg"),
    require("@/assets/images/chips/female/injury-knees.jpg"),
  ),
  back: g(
    require("@/assets/images/chips/male/injury-back.jpg"),
    require("@/assets/images/chips/female/injury-back.jpg"),
  ),
  shoulders: g(
    require("@/assets/images/chips/male/injury-shoulders.jpg"),
    require("@/assets/images/chips/female/injury-shoulders.jpg"),
  ),
  wrists: g(
    require("@/assets/images/chips/male/injury-wrists.jpg"),
    require("@/assets/images/chips/female/injury-wrists.jpg"),
  ),
};

export function resolveChipGender(
  value: string | string[] | undefined,
): ChipGender {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "female" ? "female" : "male";
}

export function focusChipImage(id: string, gender: ChipGender) {
  return pick(FOCUS[id] ?? FOCUS.full_body, gender);
}

export function goalDetailChipImage(id: string, gender: ChipGender) {
  return pick(GOAL_DETAIL[id] ?? GOAL_DETAIL.wellness, gender);
}

export function paceChipImage(id: string, gender: ChipGender) {
  return pick(PACE[id] ?? PACE.moderate, gender);
}

export function experienceChipImage(id: string, gender: ChipGender) {
  return pick(EXPERIENCE[id] ?? EXPERIENCE.novice, gender);
}

export function equipmentChipImage(id: string) {
  return EQUIPMENT[id] ?? EQUIPMENT.full_gym;
}

export function bodyIssueChipImage(id: string) {
  return BODY_ISSUE[id] ?? BODY_ISSUE.none;
}

export function injuryChipImage(id: string, gender: ChipGender) {
  return pick(INJURY[id] ?? INJURY.none, gender);
}
