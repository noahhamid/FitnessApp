import { resolveAssetUri } from "@/src/lib/resolve-asset";

/**
 * Local soft-3D exercise illustrations.
 * Keys are lowercase exercise names matching curated-exercises.json.
 * Fallback: assets/images/exercise-placeholder.jpg
 */
const PLACEHOLDER = require("../../../../assets/images/exercise-placeholder.jpg");

const BY_NAME: Record<string, number> = {
  "chest dip": require("../../../../assets/images/workout/fitness_dips_character_1787587901667.jpg"),
  "chest dip on straight bar": require("../../../../assets/images/workout/straight_bar_dips_v2_1787588600332.jpg"),
  "chest tap push-up": require("../../../../assets/images/workout/pushup_shoulder_tap_1787588327064.jpg"),
  "clock push-up": require("../../../../assets/images/workout/clock_pushup_char_1787588406831.jpg"),
  "diamond push-up": require("../../../../assets/images/workout/diamond_pushup_char_1787588493325.jpg"),
  "elbow lift - reverse push-up": require("../../../../assets/images/workout/prone_press_character_1787589022144.jpg"),
  "push-up": require("../../../../assets/images/workout/standard_pushup_char_1787589367682.jpg"),
  "dumbbell bench press": require("../../../../assets/images/workout/db_bench_press_char_1787589483250.jpg"),
  "dumbbell decline fly": require("../../../../assets/images/workout/decline_db_flyes_char_1787589585728.jpg"),
  "dumbbell decline one arm fly": require("../../../../assets/images/workout/single_arm_decline_fly_1787589815028.jpg"),
  "dumbbell decline twist fly": require("../../../../assets/images/workout/twisting_decline_fly_1787590281538.jpg"),
  "dumbbell incline breeding": require("../../../../assets/images/workout/incline_db_press_char_1787590721736.jpg"),
  "dumbbell one arm bench fly": require("../../../../assets/images/workout/single_arm_flat_fly_1787590848233.jpg"),
  "dumbbell reverse bench press": require("../../../../assets/images/workout/overhand_db_bench_char_1787653154269.jpg"),
  "barbell bench press": require("../../../../assets/images/workout/barbell_bench_press_char_1787591035966.jpg"),
  "barbell decline pullover": require("../../../../assets/images/workout/decline_bb_pullover_char_1787591158884.jpg"),
  "barbell guillotine bench press": require("../../../../assets/images/workout/bb_guillotine_press_1787591255561.jpg"),
  "barbell wide bench press": require("../../../../assets/images/workout/wide_bb_bench_press_1787591346057.jpg"),
  "cable bench press": require("../../../../assets/images/workout/standing_cable_press_char_1787591432233.jpg"),
  "floor fly (with barbell)": require("../../../../assets/images/workout/floor_bb_fly_char_1787652703691.jpg"),
};

type LazyUri = { asset: number; uri?: string };

const cache = new Map<string, LazyUri>();
const placeholderSlot: LazyUri = { asset: PLACEHOLDER };

function resolveSlot(slot: LazyUri): string {
  if (slot.uri === undefined) {
    slot.uri = resolveAssetUri(slot.asset);
  }
  return slot.uri;
}

/** Resolved URI for an exercise illustration (or shared placeholder). */
export function imageForExercise(name?: string | null): string {
  const key = name?.trim().toLowerCase() ?? "";
  if (!key) return resolveSlot(placeholderSlot);

  let slot = cache.get(key);
  if (!slot) {
    const asset = BY_NAME[key] ?? PLACEHOLDER;
    slot = { asset };
    cache.set(key, slot);
  }
  return resolveSlot(slot);
}

/** Whether a dedicated illustration exists for this exercise name. */
export function hasExerciseImage(name?: string | null): boolean {
  const key = name?.trim().toLowerCase() ?? "";
  return Boolean(key && BY_NAME[key]);
}
