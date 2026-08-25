import { resolveAssetUri } from "@/src/lib/resolve-asset";

/**
 * Local soft-3D exercise illustrations.
 * Keys are lowercase exercise names matching curated-exercises.json.
 * Each file is mapped only to the exercise it actually depicts (visual check).
 * Fallback: assets/images/exercise-placeholder.jpg
 */
const PLACEHOLDER = require("../../../../assets/images/exercise-placeholder.jpg");

const BY_NAME: Record<string, number> = {
  // —— Chest ——
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

  // —— Back ——
  "bodyweight squatting row": require("../../../../assets/images/workout/squat_suspension_row_1787653774605.jpg"),
  "bodyweight standing row": require("../../../../assets/images/workout/standing_overhand_row_1787654024323.jpg"),
  "chin-up": require("../../../../assets/images/workout/underhand_chinup_char_1787654133798.jpg"),
  "inverted row": require("../../../../assets/images/workout/inverted_row_char_1787654275739.jpg"),
  "inverted row bent knees": require("../../../../assets/images/workout/bent_knee_inverted_row_1787654395845.jpg"),
  "inverted row on bench": require("../../../../assets/images/workout/under_bench_row_char_1787654475342.jpg"),
  "pull-up": require("../../../../assets/images/workout/overhand_pullup_char_1787654696447.jpg"),
  "dumbbell bent over row": require("../../../../assets/images/workout/bent_over_db_row_1787654893738.jpg"),
  "dumbbell decline shrug": require("../../../../assets/images/workout/prone_decline_db_shrug_1787654950834.jpg"),
  "dumbbell incline row": require("../../../../assets/images/workout/chest_incline_db_row_1787655100702.jpg"),
  "dumbbell incline y-raise": require("../../../../assets/images/workout/incline_y_raise_1787655456071.jpg"),
  "dumbbell lying rear delt row": require("../../../../assets/images/workout/prone_rear_delt_row_1787655588599.jpg"),
  "dumbbell one arm bent-over row": require("../../../../assets/images/workout/single_arm_db_row_1787655727995.jpg"),
  "dumbbell reverse grip row": require("../../../../assets/images/workout/reverse_grip_db_row_1787655812923.jpg"),
  "barbell bent over row": require("../../../../assets/images/workout/barbell_overhand_row_1787655901024.jpg"),
  "barbell incline row": require("../../../../assets/images/workout/incline_bb_row_1787656048486.jpg"),
  "barbell one arm bent over row": require("../../../../assets/images/workout/single_arm_bb_row_1787656179163.jpg"),
  "barbell pendlay row": require("../../../../assets/images/workout/pendlay_row_1787656282111.jpg"),
  "barbell shrug": require("../../../../assets/images/workout/barbell_shrug_1787656394449.jpg"),
  "cambered bar lying row": require("../../../../assets/images/workout/seal_row_cambered_bar_1787656606291.jpg"),

  // —— Shoulders ——
  "left hook. boxing": require("../../../../assets/images/workout/boxing_left_hook_1787656971781.jpg"),
  "handstand push-up": require("../../../../assets/images/workout/wall_handstand_pushup_1787657090610.jpg"),
  "pike-to-cobra push-up": require("../../../../assets/images/workout/hindu_pushup_flow_1787657197790.jpg"),
  "shoulder tap": require("../../../../assets/images/workout/plank_shoulder_tap_1787657312274.jpg"),
  // NOTE: incline_db_press_1787657401926.jpg is a seated DB shoulder press duplicate — not mapped to "incline raise"
  "dumbbell lateral raise": require("../../../../assets/images/workout/standing_db_lateral_raise_1787657507581.jpg"),
  "dumbbell one arm lateral raise": require("../../../../assets/images/workout/single_arm_db_lateral_raise_1787657605996.jpg"),
  "dumbbell one arm upright row": require("../../../../assets/images/workout/single_arm_db_upright_row_1787657718732.jpg"),
  "dumbbell rear fly": require("../../../../assets/images/workout/rear_delt_fly_1787658018147.jpg"),
  "dumbbell rear lateral raise": require("../../../../assets/images/workout/bent_over_raise_1787658489689.jpg"),
  "dumbbell reverse fly": require("../../../../assets/images/workout/dumbbell_reverse_fly.jpg"),
  "dumbbell rotation reverse fly": require("../../../../assets/images/workout/Dumbbell Rotation Reverse Fly.jpg"),
  "dumbbell seated shoulder press": require("../../../../assets/images/workout/dumbbell_seated_shoulder_press.jpg"),
  "dumbbell upright row": require("../../../../assets/images/workout/Dumbbell Upright Row.jpg"),
  "barbell rear delt row": require("../../../../assets/images/workout/Barbell Rear Delt Row.jpg"),
  "barbell seated overhead press": require("../../../../assets/images/workout/Barbell Seated Overhead Press.jpg"),
  "barbell upright row": require("../../../../assets/images/workout/barbell_upright_row.jpg"),
  "cable cross-over revers fly": require("../../../../assets/images/workout/Cable Cross-over Revers Fly.jpg"),
  "cable lateral raise": require("../../../../assets/images/workout/Cable Lateral Raise.jpg"),
  "cable one arm lateral raise": require("../../../../assets/images/workout/Cable One Arm Lateral Raise.jpg"),
  "cable shoulder press": require("../../../../assets/images/workout/Cable Shoulder Press.jpg"),
  "cable supine reverse fly": require("../../../../assets/images/workout/Cable Supine Reverse Fly.jpg"),
  "cable upright row": require("../../../../assets/images/workout/Cable Upright Row.jpg"),

  // —— Quads ——
  "bodyweight drop jump squat": require("../../../../assets/images/workout/Bodyweight Drop Jump Squat.jpg"),
  "curtsey squat": require("../../../../assets/images/workout/Curtsey Squat.jpg"),
  "forward lunge": require("../../../../assets/images/workout/Forward Lunge.jpg"),
  "jump squat": require("../../../../assets/images/workout/Jump Squat.jpg"),
  "lunge with jump": require("../../../../assets/images/workout/Lunge with Jump.jpg"),
  "lunge with twist": require("../../../../assets/images/workout/Lunge with Twist.jpg"),
  "one leg squat": require("../../../../assets/images/workout/watermarked_img_4778364474975471225.jpg"),
  "dumbbell bench squat": require("../../../../assets/images/workout/Dumbbell Bench Squat.jpg"),
  "dumbbell goblet squat": require("../../../../assets/images/workout/dumbbell_goblet_squat.jpg"),
  "dumbbell lunge": require("../../../../assets/images/workout/dumbbell_lunge.jpg"),
  "dumbbell plyo squat": require("../../../../assets/images/workout/Dumbbell Plyo Squat.jpg"),
  "dumbbell rear lunge": require("../../../../assets/images/workout/Dumbbell Rear Lunge.jpg"),
  "dumbbell single leg squat": require("../../../../assets/images/workout/Dumbbell Single Leg Squat.jpg"),
  "dumbbell squat": require("../../../../assets/images/workout/Dumbbell Squat.jpg"),
  "barbell bench squat": require("../../../../assets/images/workout/Barbell Bench Squat.jpg"),
  "barbell front chest squat": require("../../../../assets/images/workout/Barbell Front Chest Squat.jpg"),
  "barbell front squat": require("../../../../assets/images/workout/Barbell Front Chest Squat.jpg"),
  "barbell full squat": require("../../../../assets/images/workout/Barbell Bench Squat.jpg"),
  "barbell lunge": require("../../../../assets/images/workout/barbell_lunge.jpg"),

  // —— Hamstrings ——
  "glute-ham raise": require("../../../../assets/images/workout/Glute-ham Raise.jpg"),
  "inverse leg curl (bench support)": require("../../../../assets/images/workout/inverse_leg_curl_bench_support.jpg"),
  "inverse leg curl (on pull-up cable machine)": require("../../../../assets/images/workout/inverse_leg_curl_cable_machine.jpg"),
  "kick out sit": require("../../../../assets/images/workout/Kick Out Sit.jpg"),
  "self assisted inverse leg curl": require("../../../../assets/images/workout/self_assisted_inverse_leg_curl.jpg"),
  "single leg platform slide": require("../../../../assets/images/workout/single_leg_platform_slide.jpg"),
  "standing single leg curl": require("../../../../assets/images/workout/standing_single_leg_curl.jpg"),
  // NOTE: dumbbell_deadlift_1787664311012.jpg visually depicts a squat — not mapped here
  "dumbbell romanian deadlift": require("../../../../assets/images/workout/dumbbell_romanian_deadlift.jpg"),
  "dumbbell single leg deadlift": require("../../../../assets/images/workout/Dumbbell Single Leg Deadlift.jpg"),
  "dumbbell stiff leg deadlift": require("../../../../assets/images/workout/Dumbbell Stiff Leg Deadlift.jpg"),
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
