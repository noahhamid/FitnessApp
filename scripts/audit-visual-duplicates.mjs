/**
 * Visual-duplicate audit for soft-3D exercise icons.
 * Cut ONLY when two exercises would produce essentially the same illustration
 * (same body pose family + same equipment silhouette). Keep when equipment
 * or body shape is clearly different (e.g. barbell vs dumbbell, chin-up vs pull-up).
 *
 * Restores full list already; writes proposed cuts + slim options.
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const curated = JSON.parse(
  readFileSync(join(ROOT, "prisma/data/curated-exercises.json"), "utf8"),
);

/**
 * Each cluster: keep ONE canonical exercise; cut the rest as visual twins.
 * reason = why Gemini soft-3D icons would look the same.
 */
const VISUAL_CLUSTERS = [
  // —— SHOULDERS: bent-over rear fly family (identical hinge + arms out) ——
  {
    keep: "Dumbbell Rear Fly",
    cut: [
      "Dumbbell Reverse Fly",
      "Dumbbell Rear Lateral Raise",
      "Dumbbell Rotation Reverse Fly",
    ],
    reason:
      "Same bent-over reverse-fly silhouette; names are synonyms. Wrist rotation barely reads in a still icon.",
  },
  // —— SHOULDERS: upright row with same implement type ——
  {
    keep: "Dumbbell Upright Row",
    cut: ["Dumbbell One Arm Upright Row"],
    reason:
      "Same upright-row pose; one-arm version looks like a half-drawn two-arm row in side view.",
  },
  {
    keep: "Dumbbell Lateral Raise",
    cut: ["Dumbbell One Arm Lateral Raise"],
    reason:
      "Same standing lateral-raise pose; one vs two DBs is hard to tell apart at icon size / 3/4 view.",
  },
  {
    keep: "Cable Lateral Raise",
    cut: ["Cable One Arm Lateral Raise"],
    reason:
      "Same cable lateral silhouette; one-arm vs two-arm is subtle once the full tower dominates the frame.",
  },
  {
    keep: "Cable Cross-over Revers Fly",
    cut: ["Cable Supine Reverse Fly"],
    reason:
      "Both are reverse-fly arm paths on cables; prone-on-bench vs standing crossover still reads as “arms open wide on cables” and confused Gemini previously.",
  },

  // —— CHEST: decline fly micro-variants ——
  {
    keep: "Dumbbell Decline Fly",
    cut: ["Dumbbell Decline Twist Fly", "Dumbbell Decline One Arm Fly"],
    reason:
      "Same decline-bench fly arc; twist/one-arm differences vanish in a two-pose icon.",
  },
  {
    keep: "Dumbbell One Arm Bench Fly",
    cut: [], // keep as distinct (flat + one arm) — already kept separately from decline
    reason: "n/a",
  },
  {
    keep: "Barbell Bench Press",
    cut: [
      "Barbell Wide Bench Press",
      "Barbell Guillotine Bench Press",
      "Dumbbell Reverse Bench Press",
    ],
    reason:
      "Same flat-bench press silhouette; grip width / bar-to-neck / reverse DB grip don’t read clearly in soft-3D icons.",
  },
  {
    keep: "Push-up",
    cut: ["Chest Tap Push-up", "Clock Push-up", "Elbow Lift - Reverse Push-up"],
    reason:
      "Same high-plank push-up body line; taps/rotations/elbow-lifts look like messy push-ups in icons.",
  },
  {
    keep: "Chest Dip",
    cut: ["Chest Dip on Straight Bar"],
    reason:
      "Same dip body path; parallel bars vs single bar is a small prop change that often still looks like “dip bars”.",
  },

  // —— BACK: inverted row family ——
  {
    keep: "Inverted Row",
    cut: ["Inverted Row Bent Knees", "Inverted Row on Bench"],
    reason:
      "Same under-bar horizontal pull; bent knees / bench edge don’t change the silhouette enough.",
  },
  {
    keep: "Dumbbell Bent Over Row",
    cut: ["Dumbbell Reverse Grip Row", "Dumbbell Incline Row"],
    reason:
      "Same bent-over/chest-supported row arm path; reverse grip & incline support look nearly identical at icon scale.",
  },
  {
    keep: "Barbell Bent Over Row",
    cut: [
      "Barbell Pendlay Row",
      "Barbell Incline Row",
      "Barbell One Arm Bent Over Row",
      "Barbell Rear Delt Row",
      "Cambered Bar Lying Row",
    ],
    reason:
      "All read as “hinged/prone + pull bar to torso”. Pendlay floor start / cambered curve / one-arm rarely survive cleanly in Gemini icons.",
  },
  {
    keep: "Bodyweight Standing Row",
    cut: ["Bodyweight Squatting Row"],
    reason:
      "Same horizontal pull on a strap/bar; squat vs stand is easy to miss once arms dominate.",
  },
  {
    keep: "Dumbbell Incline Y-raise",
    cut: ["Dumbbell Lying Rear Delt Row", "Dumbbell Decline Shrug"],
    reason:
      "Chest-down on angled/flat pad with arms hanging — icons collapse into the same “prone on bench, arms move” look.",
  },

  // —— QUADS: jump squat family ——
  {
    keep: "Jump Squat",
    cut: ["Bodyweight Drop Jump Squat", "Dumbbell Plyo Squat"],
    reason:
      "Same squat→airborne silhouette; drop-jump foot click / holding DBs mid-air barely changes the icon.",
  },
  {
    keep: "Forward Lunge",
    cut: ["Lunge with Jump", "Lunge with Twist"],
    reason:
      "Base is a forward lunge; jump-switch and torso twist rarely render distinctly vs a plain lunge.",
  },
  {
    keep: "Dumbbell Lunge",
    cut: ["Dumbbell Rear Lunge"],
    reason:
      "Forward vs reverse lunge is hard to tell in a static 3/4 icon without a clear “step direction” cue Gemini often misses.",
  },
  {
    keep: "Dumbbell Squat",
    cut: ["Dumbbell Bench Squat"],
    reason:
      "Both are two-foot DB squats; bench-touch depth often looks like a normal squat.",
  },
  {
    keep: "One Leg Squat",
    cut: ["Dumbbell Single Leg Squat"],
    reason:
      "Same single-leg squat silhouette; DBs at sides don’t change the body shape enough.",
  },
  {
    keep: "Barbell Full Squat",
    cut: ["Barbell Bench Squat", "Barbell Bench Front Squat", "Barbell Front Chest Squat", "Barbell Front Squat", "Barbell Bench Front Squat"],
    reason:
      "WAIT — front vs back squat SHOULD stay distinct. Fix below.",
  },

  // —— HAMSTRINGS: RDL / stiff / straight synonyms ——
  {
    keep: "Dumbbell Romanian Deadlift",
    cut: [
      "Dumbbell Stiff Leg Deadlift",
      "Dumbbell Straight Leg Deadlift",
      "Band Stiff Leg Deadlift",
      "Band Straight Leg Deadlift",
    ],
    reason:
      "RDL / stiff-leg / straight-leg are the same hip-hinge icon; band vs DB is secondary and still looks like “hinge with weights”.",
  },
  {
    keep: "Barbell Romanian Deadlift",
    cut: [], // keep conventional deadlift, sumo, good morning separate
    reason: "n/a",
  },
  {
    keep: "Barbell Deadlift",
    cut: ["Cable Deadlift"],
    reason:
      "Same floor pull deadlift shape; cable version still looks like a DL once the tower is behind.",
  },
  {
    keep: "Dumbbell Single Leg Deadlift",
    cut: ["Barbell Single Leg Deadlift"],
    reason:
      "Same single-leg hinge silhouette; implement change is minor in icons.",
  },
  {
    keep: "Glute-ham Raise",
    cut: [
      "Inverse Leg Curl (bench Support)",
      "Inverse Leg Curl (on Pull-up Cable Machine)",
      "Self Assisted Inverse Leg Curl",
      "Standing Single Leg Curl",
    ],
    reason:
      "All are nordic/leg-curl style hamstring flexion; icons look like “face-down or standing leg curl” variants of the same idea.",
  },

  // —— GLUTES ——
  {
    keep: "Low Glute Bridge on Floor",
    cut: [
      "Glute Bridge Two Legs on Bench",
      "Rear Decline Bridge",
      "Barbell Glute Bridge Two Legs on Bench",
    ],
    reason:
      "Same hip-bridge body line; bench/decline support doesn’t change the silhouette much.",
  },
  {
    keep: "Barbell Good Morning",
    cut: ["Barbell Seated Good Morning", "Barbell Stiff Leg Good Morning"],
    reason:
      "Same good-morning hinge with bar on back; seated/stiff-leg variants look identical in icons.",
  },

  // —— CALVES ——
  {
    keep: "Bodyweight Standing Calf Raise",
    cut: [
      "Standing Calves",
      "Standing Calf Raise (on a Staircase)",
      "One Leg Floor Calf Raise",
      "Donkey Calf Raise",
      "One Leg Donkey Calf Raise",
    ],
    reason:
      "All are plantar-flexion calf raises; stair/donkey/one-leg still read as “up on toes”.",
  },
  {
    keep: "Dumbbell Seated Calf Raise",
    cut: [
      "Dumbbell Seated One Leg Calf Raise",
      "Dumbbell Single Leg Calf Raise",
      "Single Leg Calf Raise (on a Dumbbell)",
      "Band Single Leg Calf Raise",
      "Band Single Leg Reverse Calf Raise",
      "Exercise Ball on the Wall Calf Raise",
    ],
    reason:
      "Seated/standing DB/band calf raises collapse to the same ankle-extension icon.",
  },
  {
    keep: "Barbell Standing Leg Calf Raise",
    cut: [
      "Barbell Floor Calf Raise",
      "Barbell Standing Rocking Leg Calf Raise",
      "Barbell Seated Calf Raise",
      "Cable Standing Calf Raise",
      "Cable Standing One Leg Calf Raise",
    ],
    reason:
      "Loaded calf raise silhouette is the same regardless of bar/cable/rocking.",
  },

  // —— BICEPS ——
  {
    keep: "Dumbbell Biceps Curl",
    cut: [
      "Dumbbell Biceps Curl Reverse",
      "Dumbbell Biceps Curl Squat",
      "Dumbbell High Curl",
      "Dumbbell Lying Supine Curl",
      "Dumbbell Lying Wide Curl",
    ],
    reason:
      "Standing/lying curl arm path looks the same; squat-curl and reverse grip don’t change the icon enough.",
  },
  {
    keep: "Barbell Curl",
    cut: [
      "Barbell Alternate Biceps Curl",
      "Barbell Drag Curl",
      "Barbell Lying Preacher Curl",
      "Barbell Prone Incline Curl",
    ],
    reason:
      "All barbell curl family; preacher/prone/drag look like “curl a bar” in soft-3D.",
  },
  {
    keep: "Biceps Pull-up",
    cut: ["Biceps Narrow Pull-ups", "Biceps Leg Concentration Curl", "Bodyweight Side Lying Biceps Curl"],
    reason:
      "Narrow chin-up is same as biceps pull-up; weird bodyweight curl variants look non-standard/identical mess.",
  },

  // —— TRICEPS ——
  {
    keep: "Triceps Dip",
    cut: [
      "Bench Dip (knees Bent)",
      "Bench Dip on Floor",
      "Three Bench Dip",
      "Reverse Dip",
      "One Arm Dip",
    ],
    reason:
      "Same dip path; bench/floor/one-arm props don’t reliably differentiate in icons.",
  },
  {
    keep: "Close-grip Push-up",
    cut: ["Push-up Close-grip Off Dumbbell"],
    reason: "Same close-grip push-up body line.",
  },
  {
    keep: "Dumbbell Kickback",
    cut: ["Dumbbell One Arm Kickback", "Cable Kickback", "Cable Two Arm Tricep Kickback"],
    reason:
      "Kickback silhouette is identical; cable vs DB barely changes the arm shape.",
  },
  {
    keep: "Dumbbell Lying Triceps Extension",
    cut: [
      "Dumbbell Lying Single Extension",
      "Dumbbell Incline Two Arm Extension",
      "Dumbbell Seated Bench Extension",
      "Barbell Lying Extension",
      "Barbell Lying Triceps Extension",
      "Barbell Incline Reverse-grip Press",
    ],
    reason:
      "Skull-crusher / overhead extension family collapses to “arms extend with weight above”.",
  },
  {
    keep: "Cable One Arm Tricep Pushdown",
    cut: [],
    reason: "Keep as the distinct cable pushdown pattern.",
  },

  // —— CORE ——
  {
    keep: "Power Point Plank",
    cut: [
      "Front Plank with Twist",
      "Kneeling Plank Tap Shoulder",
      "Push-up to Side Plank",
      "Bodyweight Incline Side Plank",
      "Reverse Plank with Leg Lift",
      "Side Plank Hip Adduction",
      "Weighted Front Plank",
      "Dumbbell Side Plank with Rear Fly",
    ],
    reason:
      "TOO AGGRESSIVE — side plank vs front plank ARE visually different. Fix in refined list.",
  },
];

// —— Refined conservative cuts (manual final) ——
const CUTS = [
  // Shoulders – rear fly synonyms
  { name: "Dumbbell Reverse Fly", keepInstead: "Dumbbell Rear Fly", reason: "Identical bent-over reverse fly (synonym)." },
  { name: "Dumbbell Rear Lateral Raise", keepInstead: "Dumbbell Rear Fly", reason: "Identical bent-over reverse fly (synonym)." },
  { name: "Dumbbell Rotation Reverse Fly", keepInstead: "Dumbbell Rear Fly", reason: "Same fly; palm rotate doesn't show in still icon." },
  { name: "Dumbbell One Arm Lateral Raise", keepInstead: "Dumbbell Lateral Raise", reason: "Same lateral-raise pose; 1 vs 2 DBs unclear in 3/4 icon." },
  { name: "Dumbbell One Arm Upright Row", keepInstead: "Dumbbell Upright Row", reason: "Same upright-row pose; one-arm looks incomplete." },
  { name: "Cable One Arm Lateral Raise", keepInstead: "Cable Lateral Raise", reason: "Same cable lateral silhouette." },
  { name: "Barbell Upright Row", keepInstead: "Dumbbell Upright Row", reason: "Same upright-row body shape; only implement differs slightly at icon size." },
  { name: "Cable Upright Row", keepInstead: "Dumbbell Upright Row", reason: "Same upright-row body shape." },

  // Chest
  { name: "Dumbbell Decline Twist Fly", keepInstead: "Dumbbell Decline Fly", reason: "Same decline fly arc; twist invisible in icon." },
  { name: "Dumbbell Decline One Arm Fly", keepInstead: "Dumbbell Decline Fly", reason: "Same decline fly; one-arm hard to see." },
  { name: "Barbell Wide Bench Press", keepInstead: "Barbell Bench Press", reason: "Same flat bench press silhouette." },
  { name: "Barbell Guillotine Bench Press", keepInstead: "Barbell Bench Press", reason: "Same press; bar-to-neck cue fails in icons." },
  { name: "Dumbbell Reverse Bench Press", keepInstead: "Dumbbell Bench Press", reason: "Same DB press; reverse grip not readable." },
  { name: "Chest Tap Push-up", keepInstead: "Push-up", reason: "Looks like a messy push-up." },
  { name: "Clock Push-up", keepInstead: "Push-up", reason: "Looks like a messy push-up." },
  { name: "Elbow Lift - Reverse Push-up", keepInstead: "Push-up", reason: "Looks like a low push-up / cobra hybrid mess." },
  { name: "Chest Dip on Straight Bar", keepInstead: "Chest Dip", reason: "Same dip body path." },
  { name: "Floor Fly (with Barbell)", keepInstead: "Dumbbell Decline Fly", reason: "Floor fly ≈ flat fly silhouette; keep DB decline as chest fly rep." },

  // Back
  { name: "Inverted Row Bent Knees", keepInstead: "Inverted Row", reason: "Same under-bar row; knees bent barely changes icon." },
  { name: "Inverted Row on Bench", keepInstead: "Inverted Row", reason: "Same under-bar row silhouette." },
  { name: "Dumbbell Reverse Grip Row", keepInstead: "Dumbbell Bent Over Row", reason: "Same bent-over row; grip not readable." },
  { name: "Barbell Pendlay Row", keepInstead: "Barbell Bent Over Row", reason: "Looks like bent-over row; floor start rarely clear." },
  { name: "Barbell Incline Row", keepInstead: "Dumbbell Incline Row", reason: "Same chest-supported row shape." },
  { name: "Barbell One Arm Bent Over Row", keepInstead: "Dumbbell One Arm Bent-over Row", reason: "Same one-arm row pose." },
  { name: "Barbell Rear Delt Row", keepInstead: "Barbell Bent Over Row", reason: "Looks like a normal bent-over row in icons." },
  { name: "Cambered Bar Lying Row", keepInstead: "Dumbbell Incline Row", reason: "Prone row on bench — same as incline/seal row family." },
  { name: "Bodyweight Squatting Row", keepInstead: "Bodyweight Standing Row", reason: "Same horizontal pull; squat vs stand easy to miss." },
  { name: "Dumbbell Decline Shrug", keepInstead: "Barbell Shrug", reason: "Shrug is a shrug; prone decline still reads as shrug." },
  { name: "Dumbbell Lying Rear Delt Row", keepInstead: "Dumbbell Rear Fly", reason: "Prone rear-delt raise ≈ rear fly." },
  { name: "Dumbbell Incline Y-raise", keepInstead: "Dumbbell Rear Fly", reason: "Prone on incline arms out — collapses to rear-fly family." },

  // Quads
  { name: "Bodyweight Drop Jump Squat", keepInstead: "Jump Squat", reason: "Same squat→jump icon." },
  { name: "Dumbbell Plyo Squat", keepInstead: "Jump Squat", reason: "Same squat→jump; DBs mid-air unclear." },
  { name: "Lunge with Jump", keepInstead: "Forward Lunge", reason: "Jumping lunge still looks like a lunge." },
  { name: "Lunge with Twist", keepInstead: "Forward Lunge", reason: "Twist often missing; reads as plain lunge." },
  { name: "Dumbbell Rear Lunge", keepInstead: "Dumbbell Lunge", reason: "Forward vs reverse not reliable in static icon." },
  { name: "Dumbbell Bench Squat", keepInstead: "Dumbbell Squat", reason: "Bench-touch squat looks like normal DB squat." },
  { name: "Dumbbell Single Leg Squat", keepInstead: "One Leg Squat", reason: "Same single-leg squat body." },
  { name: "Barbell Bench Squat", keepInstead: "Barbell Full Squat", reason: "Same back squat in a rack." },
  { name: "Barbell Bench Front Squat", keepInstead: "Barbell Front Squat", reason: "Same front-rack squat." },
  { name: "Barbell Front Chest Squat", keepInstead: "Barbell Front Squat", reason: "Same front squat; cross-arm vs clean grip not clear." },
  { name: "Barbell Front Chest Squat", keepInstead: "Barbell Front Squat", reason: "dup" },
  { name: "Curtsey Squat", keepInstead: "Forward Lunge", reason: "Often renders as a weird lunge/squat hybrid indistinguishable from reverse lunge." },
  { name: "Dumbbell Bench Squat", keepInstead: "Dumbbell Squat", reason: "dup" },
  { name: "Lunge with Jump", keepInstead: "Forward Lunge", reason: "dup" },
  { name: "Bodyweight Drop Jump Squat", keepInstead: "Jump Squat", reason: "dup" },
  { name: "Barbell Bench Front Squat", keepInstead: "Barbell Front Squat", reason: "dup" },
  { name: "Barbell Bench Squat", keepInstead: "Barbell Full Squat", reason: "dup" },

  // Hamstrings
  { name: "Dumbbell Stiff Leg Deadlift", keepInstead: "Dumbbell Romanian Deadlift", reason: "Identical hip-hinge icon (RDL synonym)." },
  { name: "Dumbbell Straight Leg Deadlift", keepInstead: "Dumbbell Romanian Deadlift", reason: "Identical hip-hinge icon." },
  { name: "Band Stiff Leg Deadlift", keepInstead: "Dumbbell Romanian Deadlift", reason: "Same hinge silhouette." },
  { name: "Band Straight Leg Deadlift", keepInstead: "Dumbbell Romanian Deadlift", reason: "Same hinge silhouette." },
  { name: "Cable Deadlift", keepInstead: "Barbell Deadlift", reason: "Same deadlift body shape." },
  { name: "Barbell Single Leg Deadlift", keepInstead: "Dumbbell Single Leg Deadlift", reason: "Same single-leg hinge." },
  { name: "Inverse Leg Curl (bench Support)", keepInstead: "Glute-ham Raise", reason: "Same nordic/leg-curl body." },
  { name: "Inverse Leg Curl (on Pull-up Cable Machine)", keepInstead: "Glute-ham Raise", reason: "Same nordic/leg-curl body." },
  { name: "Self Assisted Inverse Leg Curl", keepInstead: "Glute-ham Raise", reason: "Same nordic/leg-curl body." },
  { name: "Standing Single Leg Curl", keepInstead: "Glute-ham Raise", reason: "Leg curl family; weak distinct icon." },
  { name: "Kick Out Sit", keepInstead: "Glute-ham Raise", reason: "Obscure; collapses to odd sit/curl." },
  { name: "Single Leg Platform Slide", keepInstead: "Dumbbell Single Leg Deadlift", reason: "Obscure slide; not distinct from SL hinge family." },

  // Glutes
  { name: "Glute Bridge Two Legs on Bench", keepInstead: "Low Glute Bridge on Floor", reason: "Same bridge line." },
  { name: "Rear Decline Bridge", keepInstead: "Low Glute Bridge on Floor", reason: "Same bridge line." },
  { name: "Barbell Glute Bridge Two Legs on Bench", keepInstead: "Barbell Glute Bridge", reason: "Same loaded bridge." },
  { name: "Barbell Seated Good Morning", keepInstead: "Barbell Good Morning", reason: "Same GM hinge." },
  { name: "Barbell Stiff Leg Good Morning", keepInstead: "Barbell Good Morning", reason: "Same GM hinge." },
  { name: "Basic Toe Touch", keepInstead: "Low Glute Bridge on Floor", reason: "Not a clear glute icon; redundant." },
  { name: "Bent Knee Lying Twist", keepInstead: "Low Glute Bridge on Floor", reason: "Looks like a core twist, not distinct glute work." },
  { name: "Exercise Ball One Legged Diagonal Kick Hamstring Curl", keepInstead: "Glute Bridge March", reason: "Overly complex; Gemini mush." },

  // Calves — keep 1 standing BW, 1 seated loaded, 1 standing loaded
  { name: "Standing Calves", keepInstead: "Bodyweight Standing Calf Raise", reason: "Same standing calf raise." },
  { name: "Standing Calf Raise (on a Staircase)", keepInstead: "Bodyweight Standing Calf Raise", reason: "Same standing calf raise." },
  { name: "One Leg Floor Calf Raise", keepInstead: "Bodyweight Standing Calf Raise", reason: "Same calf raise." },
  { name: "Donkey Calf Raise", keepInstead: "Bodyweight Standing Calf Raise", reason: "Still “up on toes” icon." },
  { name: "One Leg Donkey Calf Raise", keepInstead: "Bodyweight Standing Calf Raise", reason: "Same." },
  { name: "Ankle Circles", keepInstead: "Bodyweight Standing Calf Raise", reason: "Not a strength icon; skip." },
  { name: "Dumbbell Seated One Leg Calf Raise", keepInstead: "Dumbbell Seated Calf Raise", reason: "Same seated calf." },
  { name: "Dumbbell Single Leg Calf Raise", keepInstead: "Dumbbell Seated Calf Raise", reason: "Calf raise family." },
  { name: "Single Leg Calf Raise (on a Dumbbell)", keepInstead: "Dumbbell Seated Calf Raise", reason: "Same." },
  { name: "Band Single Leg Calf Raise", keepInstead: "Dumbbell Seated Calf Raise", reason: "Same." },
  { name: "Band Single Leg Reverse Calf Raise", keepInstead: "Dumbbell Seated Calf Raise", reason: "Same." },
  { name: "Exercise Ball on the Wall Calf Raise", keepInstead: "Dumbbell Seated Calf Raise", reason: "Same." },
  { name: "Barbell Floor Calf Raise", keepInstead: "Barbell Standing Leg Calf Raise", reason: "Same loaded standing calf." },
  { name: "Barbell Standing Rocking Leg Calf Raise", keepInstead: "Barbell Standing Leg Calf Raise", reason: "Same." },
  { name: "Barbell Seated Calf Raise", keepInstead: "Dumbbell Seated Calf Raise", reason: "Same seated calf pattern." },
  { name: "Cable Standing Calf Raise", keepInstead: "Barbell Standing Leg Calf Raise", reason: "Same standing calf." },
  { name: "Cable Standing One Leg Calf Raise", keepInstead: "Barbell Standing Leg Calf Raise", reason: "Same." },

  // Biceps
  { name: "Dumbbell Biceps Curl Reverse", keepInstead: "Dumbbell Biceps Curl", reason: "Same curl; reverse grip invisible." },
  { name: "Dumbbell Biceps Curl Squat", keepInstead: "Dumbbell Biceps Curl", reason: "Looks like a curl." },
  { name: "Dumbbell High Curl", keepInstead: "Dumbbell Biceps Curl", reason: "Same curl." },
  { name: "Dumbbell Lying Supine Curl", keepInstead: "Dumbbell Incline Curl", reason: "Lying/incline curl family." },
  { name: "Dumbbell Lying Wide Curl", keepInstead: "Dumbbell Incline Curl", reason: "Same." },
  { name: "Barbell Alternate Biceps Curl", keepInstead: "Barbell Curl", reason: "Same bar curl." },
  { name: "Barbell Drag Curl", keepInstead: "Barbell Curl", reason: "Same bar curl." },
  { name: "Barbell Lying Preacher Curl", keepInstead: "Barbell Curl", reason: "Still “curl a bar”." },
  { name: "Barbell Prone Incline Curl", keepInstead: "Barbell Curl", reason: "Same." },
  { name: "Biceps Narrow Pull-ups", keepInstead: "Biceps Pull-up", reason: "Same chin-up/pull-up." },
  { name: "Biceps Leg Concentration Curl", keepInstead: "Dumbbell Concentration Curl", reason: "Odd BW version of concentration curl." },
  { name: "Bodyweight Side Lying Biceps Curl", keepInstead: "Dumbbell Concentration Curl", reason: "Unclear icon." },

  // Triceps
  { name: "Bench Dip (knees Bent)", keepInstead: "Triceps Dip", reason: "Same dip." },
  { name: "Bench Dip on Floor", keepInstead: "Triceps Dip", reason: "Same dip." },
  { name: "Three Bench Dip", keepInstead: "Triceps Dip", reason: "Same dip." },
  { name: "Reverse Dip", keepInstead: "Triceps Dip", reason: "Same dip." },
  { name: "One Arm Dip", keepInstead: "Triceps Dip", reason: "Same dip." },
  { name: "Push-up Close-grip Off Dumbbell", keepInstead: "Close-grip Push-up", reason: "Same close-grip push-up." },
  { name: "Dumbbell One Arm Kickback", keepInstead: "Dumbbell Kickback", reason: "Same kickback." },
  { name: "Cable Kickback", keepInstead: "Dumbbell Kickback", reason: "Same kickback arm path." },
  { name: "Cable Two Arm Tricep Kickback", keepInstead: "Dumbbell Kickback", reason: "Same kickback." },
  { name: "Dumbbell Lying Single Extension", keepInstead: "Dumbbell Lying Triceps Extension", reason: "Same skull-crusher." },
  { name: "Dumbbell Incline Two Arm Extension", keepInstead: "Dumbbell Lying Triceps Extension", reason: "Same extension." },
  { name: "Dumbbell Seated Bench Extension", keepInstead: "Dumbbell Lying Triceps Extension", reason: "OH extension ≈ same family in icons." },
  { name: "Barbell Lying Extension", keepInstead: "Barbell Lying Triceps Extension", reason: "Synonym." },
  { name: "Barbell Incline Reverse-grip Press", keepInstead: "Close-grip Push-up", reason: "Odd press; not distinct triceps icon." },

  // Core – only cut near-identical plank variants, KEEP side plank distinct
  { name: "Kneeling Plank Tap Shoulder", keepInstead: "Shoulder Tap", reason: "Same shoulder-tap plank idea." },
  { name: "Front Plank with Twist", keepInstead: "Power Point Plank", reason: "Looks like a plank." },
  { name: "Weighted Front Plank", keepInstead: "Power Point Plank", reason: "Looks like a plank." },
  { name: "Reverse Plank with Leg Lift", keepInstead: "Power Point Plank", reason: "Still a plank line." },
  { name: "Band Jack Knife Sit-up", keepInstead: "Band Bicycle Crunch", reason: "Same crunch/sit-up family." },
  { name: "Band Push Sit-up", keepInstead: "Band Bicycle Crunch", reason: "Same." },
  { name: "Band Standing Crunch", keepInstead: "Cable Kneeling Crunch", reason: "Standing crunch ≈ cable crunch." },
  { name: "Cable Reverse Crunch", keepInstead: "Cable Kneeling Crunch", reason: "Cable crunch family." },
  { name: "Cable Seated Crunch", keepInstead: "Cable Kneeling Crunch", reason: "Cable crunch family." },
  { name: "Cable Side Crunch", keepInstead: "Cable Kneeling Crunch", reason: "Cable crunch family." },
  { name: "Barbell Press Sit-up", keepInstead: "Crunch (on Stability Ball)", reason: "Sit-up/crunch family." },
  { name: "Roller Reverse Crunch", keepInstead: "Crunch (on Stability Ball)", reason: "Crunch family." },
  { name: "Dumbbell Side Plank with Rear Fly", keepInstead: "Bodyweight Incline Side Plank", reason: "Side plank + fly = muddy icon." },

  // Misc oddballs that duplicate
  { name: "Left Hook. Boxing", keepInstead: "Shoulder Tap", reason: "Out-of-place boxing icon; not needed for gym library." },
  { name: "Pike-to-cobra Push-up", keepInstead: "Handstand Push-up", reason: "Complex flow; Gemini usually fails — keep HSPU as hard BW shoulder move." },
  { name: "Dumbbell Incline Raise", keepInstead: "Dumbbell Seated Shoulder Press", reason: "Incline DB raise ≈ shoulder press path." },
];

// Dedupe cuts by name
const cutMap = new Map();
for (const c of CUTS) {
  if (!cutMap.has(c.name)) cutMap.set(c.name, c);
}

const cutNames = new Set(cutMap.keys());
const keep = curated.filter((e) => !cutNames.has(e.name));
const cutList = curated
  .filter((e) => cutNames.has(e.name))
  .map((e) => ({
    name: e.name,
    muscleGroup: e.muscleGroup,
    minEquipment: e.minEquipment,
    keepInstead: cutMap.get(e.name).keepInstead,
    reason: cutMap.get(e.name).reason,
  }));

// Validate keepInstead exists in keep or curated
const keepNames = new Set(keep.map((e) => e.name));
for (const c of cutList) {
  if (!keepNames.has(c.keepInstead) && !curated.find((e) => e.name === c.keepInstead)) {
    console.warn("WARNING keepInstead missing:", c.name, "->", c.keepInstead);
  }
  // if keepInstead was also cut, warn
  if (cutNames.has(c.keepInstead)) {
    console.warn("WARNING keepInstead also cut:", c.keepInstead, "for", c.name);
  }
}

const byMg = {};
for (const e of keep) {
  byMg[e.muscleGroup] = (byMg[e.muscleGroup] || 0) + 1;
}

const report = {
  strategy:
    "Cut only visual twins — exercises that produce the same soft-3D silhouette (same pose family + same readable equipment). Keep distinct equipment (chin-up vs pull-up, front vs back squat, cable tower vs dumbbells) and clearly different body shapes (lunge vs squat, bridge vs hinge).",
  before: curated.length,
  after: keep.length,
  cutCount: cutList.length,
  keepByMuscle: byMg,
  cuts: cutList,
  keepNames: keep.map((e) => e.name),
};

writeFileSync(
  join(ROOT, "scripts/data/visual-duplicate-cuts.json"),
  JSON.stringify(report, null, 2) + "\n",
);

const lines = [];
lines.push("# Visual-duplicate cuts (conservative)");
lines.push("");
lines.push(report.strategy);
lines.push("");
lines.push(`- Before: **${report.before}**`);
lines.push(`- After: **${report.after}**`);
lines.push(`- Cut: **${report.cutCount}** (only lookalikes)`);
lines.push("");
lines.push("## Keep count by muscle");
lines.push("");
for (const [mg, n] of Object.entries(byMg)) lines.push(`- ${mg}: ${n}`);
lines.push("");
lines.push("## Cuts (why)");
lines.push("");
for (const c of cutList) {
  lines.push(
    `- **${c.name}** → keep **${c.keepInstead}** — ${c.reason}`,
  );
}
lines.push("");
lines.push("## Keep list");
lines.push("");
for (const e of keep) {
  lines.push(`- ${e.name} (${e.muscleGroup} / ${e.minEquipment})`);
}
writeFileSync(
  join(ROOT, "scripts/data/visual-duplicate-cuts.md"),
  lines.join("\n") + "\n",
);

console.log(
  JSON.stringify(
    {
      before: report.before,
      after: report.after,
      cut: report.cutCount,
      keepByMuscle: byMg,
    },
    null,
    2,
  ),
);
