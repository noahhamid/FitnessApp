import { resolveAssetUri } from "@/src/lib/resolve-asset";

/**
 * Local soft-3D exercise illustrations.
 * Keys are lowercase exercise names matching curated-exercises.json.
 * One file → one exercise (shared only when same silhouette by design).
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
  "dumbbell decline one arm fly": require("../../../../assets/images/workout/Dumbbell Decline One Arm Fly.jpg"),
  "dumbbell incline breeding": require("../../../../assets/images/workout/incline_db_press_char_1787590721736.jpg"),
  "dumbbell one arm bench fly": require("../../../../assets/images/workout/single_arm_flat_fly_1787590848233.jpg"),
  "dumbbell reverse bench press": require("../../../../assets/images/workout/overhand_db_bench_char_1787653154269.jpg"),
  "barbell bench press": require("../../../../assets/images/workout/barbell_bench_press_char_1787591035966.jpg"),
  "barbell decline pullover": require("../../../../assets/images/workout/decline_bb_pullover_char_1787591158884.jpg"),
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
  "dumbbell reverse grip row": require("../../../../assets/images/workout/Dumbbell Reverse Grip Row.jpg"),
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
  "dumbbell lateral raise": require("../../../../assets/images/workout/standing_db_lateral_raise_1787657507581.jpg"),
  "dumbbell one arm lateral raise": require("../../../../assets/images/workout/Dumbbell One Arm Lateral Raise.jpg"),
  "dumbbell one arm upright row": require("../../../../assets/images/workout/Dumbbell One Arm Upright Row.jpg"),
  "dumbbell incline raise": require("../../../../assets/images/workout/Dumbbell Incline Raise.jpg"),
  "dumbbell rear fly": require("../../../../assets/images/workout/rear_delt_fly_1787658018147.jpg"),
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
  "curtsey squat": require("../../../../assets/images/workout/Curtsey Squat.jpg"),
  "forward lunge": require("../../../../assets/images/workout/Forward Lunge.jpg"),
  "jump squat": require("../../../../assets/images/workout/Jump Squat.jpg"),
  "lunge with jump": require("../../../../assets/images/workout/Lunge with Jump.jpg"),
  "lunge with twist": require("../../../../assets/images/workout/Lunge with Twist.jpg"),
  "one leg squat": require("../../../../assets/images/workout/One Leg Squat.jpg"),
  "dumbbell bench squat": require("../../../../assets/images/workout/Dumbbell Bench Squat.jpg"),
  "dumbbell goblet squat": require("../../../../assets/images/workout/dumbbell_goblet_squat.jpg"),
  "dumbbell lunge": require("../../../../assets/images/workout/dumbbell_lunge.jpg"),
  "dumbbell plyo squat": require("../../../../assets/images/workout/Dumbbell Plyo Squat.jpg"),
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
  "dumbbell deadlift": require("../../../../assets/images/workout/Dumbbell Deadlift.jpg"),
  "dumbbell romanian deadlift": require("../../../../assets/images/workout/dumbbell_romanian_deadlift.jpg"),
  "dumbbell single leg deadlift": require("../../../../assets/images/workout/Dumbbell Single Leg Deadlift.jpg"),
  "barbell deadlift": require("../../../../assets/images/workout/Barbell Deadlift.jpg"),
  "barbell good morning": require("../../../../assets/images/workout/Barbell Good Morning.jpg"),
  "barbell single leg deadlift": require("../../../../assets/images/workout/Barbell Single Leg Deadlift.jpg"),
  "barbell sumo deadlift": require("../../../../assets/images/workout/Barbell Sumo Deadlift.jpg"),
  "cable deadlift": require("../../../../assets/images/workout/Cable Deadlift.jpg"),
  "basic toe touch": require("../../../../assets/images/workout/Basic Toe Touch.jpg"),

  // —— Glutes ——
  "low glute bridge on floor": require("../../../../assets/images/workout/Low Glute Bridge on Floor.jpg"),
  "bent knee lying twist": require("../../../../assets/images/workout/Bent Knee Lying Twist.jpg"),
  "glute bridge two legs on bench": require("../../../../assets/images/workout/Glute Bridge Two Legs on Bench.jpg"),
  "band bent-over hip extension": require("../../../../assets/images/workout/Band Bent-over Hip Extension.jpg"),
  "band hip lift": require("../../../../assets/images/workout/Band Hip Lift.jpg"),
  "dumbbell clean": require("../../../../assets/images/workout/Dumbbell Clean.jpg"),
  "dumbbell one arm snatch": require("../../../../assets/images/workout/Dumbbell One Arm Snatch.jpg"),
  "dumbbell sumo pull through": require("../../../../assets/images/workout/Dumbbell Sumo Pull Through.jpg"),
  "kettlebell swing": require("../../../../assets/images/workout/Kettlebell Swing.jpg"),
  "exercise ball one legged diagonal kick hamstring curl": require("../../../../assets/images/workout/Exercise Ball One Legged Diagonal Kick Hamstring Curl.jpg"),
  "barbell glute bridge": require("../../../../assets/images/workout/Barbell Glute Bridge.jpg"),
  "barbell glute bridge two legs on bench": require("../../../../assets/images/workout/Barbell Glute Bridge Two Legs on Bench.jpg"),
  "cable standing hip extension": require("../../../../assets/images/workout/Cable Standing Hip Extension.jpg"),

  // —— Calves ——
  "ankle circles": require("../../../../assets/images/workout/Ankle Circles.jpg"),
  "donkey calf raise": require("../../../../assets/images/workout/Donkey Calf Raise.jpg"),
  "one leg donkey calf raise": require("../../../../assets/images/workout/One Leg Donkey Calf Raise.jpg"),
  "bodyweight standing calf raise": require("../../../../assets/images/workout/Bodyweight Standing Calf Raise.jpg"),
  "one leg floor calf raise": require("../../../../assets/images/workout/One Leg Floor Calf Raise.jpg"),
  "dumbbell seated calf raise": require("../../../../assets/images/workout/Dumbbell Seated Calf Raise.jpg"),
  "cable standing calf raise": require("../../../../assets/images/workout/Cable Standing Calf Raise.jpg"),
  "exercise ball on the wall calf raise": require("../../../../assets/images/workout/Exercise Ball on the Wall Calf Raise.jpg"),
  "single leg calf raise (on a dumbbell)": require("../../../../assets/images/workout/Single Leg Calf Raise (on a Dumbbell).jpg"),
  "band single leg calf raise": require("../../../../assets/images/workout/Band Single Leg Calf Raise.jpg"),
  "band single leg reverse calf raise": require("../../../../assets/images/workout/Band Single Leg Reverse Calf Raise.jpg"),
  "dumbbell seated one leg calf raise": require("../../../../assets/images/workout/Dumbbell Seated One Leg Calf Raise.jpg"),
  "barbell floor calf raise": require("../../../../assets/images/workout/Barbell Floor Calf Raise.jpg"),
  "barbell seated calf raise": require("../../../../assets/images/workout/Barbell Seated Calf Raise.jpg"),
  "barbell standing leg calf raise": require("../../../../assets/images/workout/Barbell Standing Leg Calf Raise.jpg"),

  // —— Biceps ——
  "biceps leg concentration curl": require("../../../../assets/images/workout/Biceps Leg Concentration Curl.jpg"),
  "bodyweight side lying biceps curl": require("../../../../assets/images/workout/Bodyweight Side Lying Biceps Curl.jpg"),
  "dumbbell biceps curl": require("../../../../assets/images/workout/Dumbbell Biceps Curl.jpg"),
  "dumbbell biceps curl reverse": require("../../../../assets/images/workout/Dumbbell Biceps Curl Reverse.jpg"),
  "dumbbell concentration curl": require("../../../../assets/images/workout/Dumbbell Concentration Curl.jpg"),
  "dumbbell hammer curl": require("../../../../assets/images/workout/Dumbbell Hammer Curl.jpg"),
  "dumbbell incline curl": require("../../../../assets/images/workout/Dumbbell Incline Curl.jpg"),
  "barbell curl": require("../../../../assets/images/workout/Barbell Curl.jpg"),
  "barbell drag curl": require("../../../../assets/images/workout/Barbell Drag Curl.jpg"),
  "cable curl": require("../../../../assets/images/workout/Cable Curl.jpg"),
  "dumbbell biceps curl squat": require("../../../../assets/images/workout/Dumbbell Biceps Curl Squat.jpg"),
  "dumbbell high curl": require("../../../../assets/images/workout/Dumbbell High Curl.jpg"),
  "dumbbell lying supine curl": require("../../../../assets/images/workout/Dumbbell Lying Supine Curl.jpg"),
  "dumbbell lying wide curl": require("../../../../assets/images/workout/Dumbbell Lying Wide Curl.jpg"),
  "barbell lying preacher curl": require("../../../../assets/images/workout/Barbell Lying Preacher Curl.jpg"),
  "barbell reverse curl": require("../../../../assets/images/workout/Barbell Reverse Curl.jpg"),
  "barbell prone incline curl": require("../../../../assets/images/workout/Barbell Prone Incline Curl.jpg"),

  // —— Triceps ——
  "bench dip (knees bent)": require("../../../../assets/images/workout/Bench Dip (knees Bent).jpg"),
  "bench dip on floor": require("../../../../assets/images/workout/Bench Dip on Floor.jpg"),
  "one arm dip": require("../../../../assets/images/workout/One Arm Dip.jpg"),
  "dumbbell kickback": require("../../../../assets/images/workout/Dumbbell Kickback.jpg"),
  "dumbbell lying triceps extension": require("../../../../assets/images/workout/Dumbbell Lying Triceps Extension.jpg"),
  "dumbbell one arm kickback": require("../../../../assets/images/workout/Dumbbell One Arm Kickback.jpg"),
  "barbell lying triceps extension": require("../../../../assets/images/workout/Barbell Lying Triceps Extension.jpg"),
  "cable kickback": require("../../../../assets/images/workout/Cable Kickback.jpg"),
  "cable one arm tricep pushdown": require("../../../../assets/images/workout/Cable One Arm Tricep Pushdown.jpg"),
  "push-up close-grip off dumbbell": require("../../../../assets/images/workout/Push-up Close-grip Off Dumbbell.jpg"),
  "close-grip push-up": require("../../../../assets/images/workout/Close-grip Push-up.jpg"),
  "three bench dip": require("../../../../assets/images/workout/Three Bench Dip.jpg"),
  "dumbbell incline two arm extension": require("../../../../assets/images/workout/Dumbbell Incline Two Arm Extension.jpg"),
  "dumbbell lying single extension": require("../../../../assets/images/workout/Dumbbell Lying Single Extension.jpg"),
  "dumbbell seated bench extension": require("../../../../assets/images/workout/Dumbbell Seated Bench Extension.jpg"),
  "barbell incline reverse-grip press": require("../../../../assets/images/workout/Barbell Incline Reverse-grip Press.jpg"),
  "cable two arm tricep kickback": require("../../../../assets/images/workout/Cable Two Arm Tricep Kickback.jpg"),

  // —— Core ——
  "bodyweight incline side plank": require("../../../../assets/images/workout/Bodyweight Incline Side Plank.jpg"),
  "front plank with twist": require("../../../../assets/images/workout/Front Plank with Twist.jpg"),
  "kneeling plank tap shoulder": require("../../../../assets/images/workout/Kneeling Plank Tap Shoulder.jpg"),
  "power point plank": require("../../../../assets/images/workout/Power Point Plank.jpg"),
  "push-up to side plank": require("../../../../assets/images/workout/Push-up to Side Plank.jpg"),
  "reverse plank with leg lift": require("../../../../assets/images/workout/Reverse Plank with Leg Lift.jpg"),
  "side plank hip adduction": require("../../../../assets/images/workout/Side Plank Hip Adduction.jpg"),
  "band bicycle crunch": require("../../../../assets/images/workout/Band Bicycle Crunch.jpg"),
  "crunch (on stability ball)": require("../../../../assets/images/workout/Crunch (on Stability Ball).jpg"),
  "dumbbell side plank with rear fly": require("../../../../assets/images/workout/Dumbbell Side Plank with Rear Fly.jpg"),
  "band jack knife sit-up": require("../../../../assets/images/workout/Band Jack Knife Sit-up.jpg"),
  "band push sit-up": require("../../../../assets/images/workout/Band Push Sit-up.jpg"),
  "band standing crunch": require("../../../../assets/images/workout/Band Standing Crunch.jpg"),
  "roller reverse crunch": require("../../../../assets/images/workout/Roller Reverse Crunch.jpg"),
  "barbell press sit-up": require("../../../../assets/images/workout/Barbell Press Sit-up.jpg"),
  "cable kneeling crunch": require("../../../../assets/images/workout/Cable Kneeling Crunch.jpg"),
  "cable reverse crunch": require("../../../../assets/images/workout/Cable Reverse Crunch.jpg"),
  "cable seated crunch": require("../../../../assets/images/workout/Cable Seated Crunch.jpg"),
  "cable side crunch": require("../../../../assets/images/workout/Cable Side Crunch.jpg"),
  "weighted front plank": require("../../../../assets/images/workout/Weighted Front Plank.jpg"),

  // —— Calves (remaining) ——
  "dumbbell single leg calf raise": require("../../../../assets/images/workout/Dumbbell Single Leg Calf Raise.jpg"),
  "barbell standing rocking leg calf raise": require("../../../../assets/images/workout/Barbell Standing Rocking Leg Calf Raise.jpg"),

  // —— Legacy plan-name aliases (old short names still on live plans) ——
  // Without these, imageForExercise falls back to exercise-placeholder.jpg.
  "barbell back squat": require("../../../../assets/images/workout/Barbell Bench Squat.jpg"),
  "barbell row": require("../../../../assets/images/workout/barbell_overhand_row_1787655901024.jpg"),
  "overhead barbell press": require("../../../../assets/images/workout/Barbell Seated Overhead Press.jpg"),
  "cable triceps pushdown": require("../../../../assets/images/workout/Cable One Arm Tricep Pushdown.jpg"),
  "glute bridge": require("../../../../assets/images/workout/Low Glute Bridge on Floor.jpg"),
  "standing calf raise": require("../../../../assets/images/workout/Bodyweight Standing Calf Raise.jpg"),
  "dumbbell curl": require("../../../../assets/images/workout/Dumbbell Biceps Curl.jpg"),
  "dumbbell row": require("../../../../assets/images/workout/bent_over_db_row_1787654893738.jpg"),
  "dumbbell shoulder press": require("../../../../assets/images/workout/dumbbell_seated_shoulder_press.jpg"),
  "goblet squat": require("../../../../assets/images/workout/dumbbell_goblet_squat.jpg"),
  "barbell romanian deadlift": require("../../../../assets/images/workout/dumbbell_romanian_deadlift.jpg"),
  "barbell lying extension": require("../../../../assets/images/workout/Barbell Lying Triceps Extension.jpg"),
  "barbell bench front squat": require("../../../../assets/images/workout/Barbell Front Chest Squat.jpg"),
  "hanging leg raise": require("../../../../assets/images/workout/Kick Out Sit.jpg"),
  "lat pulldown": require("../../../../assets/images/workout/overhand_pullup_char_1787654696447.jpg"),
  "band stiff leg deadlift": require("../../../../assets/images/workout/Dumbbell Deadlift.jpg"),
  "band straight leg deadlift": require("../../../../assets/images/workout/Dumbbell Deadlift.jpg"),
  "barbell alternate biceps curl": require("../../../../assets/images/workout/Barbell Curl.jpg"),
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
