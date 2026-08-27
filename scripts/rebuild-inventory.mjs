import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const curated = JSON.parse(
  readFileSync(join(ROOT, "prisma/data/curated-exercises.json"), "utf8"),
);
const files = new Set(
  readdirSync(join(ROOT, "assets/images/workout")).filter((f) =>
    /\.(jpe?g|png)$/i.test(f),
  ),
);

const mapped = {
  "chest dip": "fitness_dips_character_1787587901667.jpg",
  "chest dip on straight bar": "straight_bar_dips_v2_1787588600332.jpg",
  "chest tap push-up": "pushup_shoulder_tap_1787588327064.jpg",
  "clock push-up": "clock_pushup_char_1787588406831.jpg",
  "diamond push-up": "diamond_pushup_char_1787588493325.jpg",
  "elbow lift - reverse push-up": "prone_press_character_1787589022144.jpg",
  "push-up": "standard_pushup_char_1787589367682.jpg",
  "dumbbell bench press": "db_bench_press_char_1787589483250.jpg",
  "dumbbell decline fly": "decline_db_flyes_char_1787589585728.jpg",
  "dumbbell decline one arm fly": "single_arm_decline_fly_1787589815028.jpg",
  "dumbbell decline twist fly": "twisting_decline_fly_1787590281538.jpg",
  "dumbbell incline breeding": "incline_db_press_char_1787590721736.jpg",
  "dumbbell one arm bench fly": "single_arm_flat_fly_1787590848233.jpg",
  "dumbbell reverse bench press": "overhand_db_bench_char_1787653154269.jpg",
  "barbell bench press": "barbell_bench_press_char_1787591035966.jpg",
  "barbell decline pullover": "decline_bb_pullover_char_1787591158884.jpg",
  "barbell guillotine bench press": "bb_guillotine_press_1787591255561.jpg",
  "barbell wide bench press": "wide_bb_bench_press_1787591346057.jpg",
  "cable bench press": "standing_cable_press_char_1787591432233.jpg",
  "floor fly (with barbell)": "floor_bb_fly_char_1787652703691.jpg",
  "bodyweight squatting row": "squat_suspension_row_1787653774605.jpg",
  "bodyweight standing row": "standing_overhand_row_1787654024323.jpg",
  "chin-up": "underhand_chinup_char_1787654133798.jpg",
  "inverted row": "inverted_row_char_1787654275739.jpg",
  "inverted row bent knees": "bent_knee_inverted_row_1787654395845.jpg",
  "inverted row on bench": "under_bench_row_char_1787654475342.jpg",
  "pull-up": "overhand_pullup_char_1787654696447.jpg",
  "dumbbell bent over row": "bent_over_db_row_1787654893738.jpg",
  "dumbbell decline shrug": "prone_decline_db_shrug_1787654950834.jpg",
  "dumbbell incline row": "chest_incline_db_row_1787655100702.jpg",
  "dumbbell incline y-raise": "incline_y_raise_1787655456071.jpg",
  "dumbbell lying rear delt row": "prone_rear_delt_row_1787655588599.jpg",
  "dumbbell one arm bent-over row": "single_arm_db_row_1787655727995.jpg",
  "dumbbell reverse grip row": "reverse_grip_db_row_1787655812923.jpg",
  "barbell bent over row": "barbell_overhand_row_1787655901024.jpg",
  "barbell incline row": "incline_bb_row_1787656048486.jpg",
  "barbell one arm bent over row": "single_arm_bb_row_1787656179163.jpg",
  "barbell pendlay row": "pendlay_row_1787656282111.jpg",
  "barbell shrug": "barbell_shrug_1787656394449.jpg",
  "cambered bar lying row": "seal_row_cambered_bar_1787656606291.jpg",
  "left hook. boxing": "boxing_left_hook_1787656971781.jpg",
  "handstand push-up": "wall_handstand_pushup_1787657090610.jpg",
  "pike-to-cobra push-up": "hindu_pushup_flow_1787657197790.jpg",
  "shoulder tap": "plank_shoulder_tap_1787657312274.jpg",
  "dumbbell incline raise": "incline_db_press_1787657401926.jpg",
  "dumbbell lateral raise": "standing_db_lateral_raise_1787657507581.jpg",
  "dumbbell one arm lateral raise": "single_arm_db_lateral_raise_1787657605996.jpg",
  "dumbbell one arm upright row": "single_arm_db_upright_row_1787657718732.jpg",
  "dumbbell rear fly": "rear_delt_fly_1787658018147.jpg",
  "dumbbell rear lateral raise": "bent_over_raise_1787658489689.jpg",
  "dumbbell reverse fly": "dumbbell_reverse_fly.jpg",
  "dumbbell rotation reverse fly": "Dumbbell Rotation Reverse Fly.jpg",
  "dumbbell seated shoulder press": "dumbbell_seated_shoulder_press.jpg",
  "dumbbell upright row": "Dumbbell Upright Row.jpg",
  "barbell rear delt row": "Barbell Rear Delt Row.jpg",
  "barbell seated overhead press": "barbell_seated_overhead_press.jpg",
  "barbell upright row": "barbell_upright_row.jpg",
  "cable cross-over revers fly": "Cable Cross-over Revers Fly.jpg",
  "cable lateral raise": "Cable Lateral Raise.jpg",
  "cable one arm lateral raise": "Cable One Arm Lateral Raise.jpg",
};

const hasImg = (name) => {
  const f = mapped[name.toLowerCase()];
  return Boolean(f && files.has(f));
};

const KEEP_BY_MG = {
  chest: [
    "Push-up",
    "Diamond Push-up",
    "Chest Dip",
    "Dumbbell Bench Press",
    "Dumbbell Incline Breeding",
    "Dumbbell Decline Fly",
    "Barbell Bench Press",
    "Cable Bench Press",
  ],
  back: [
    "Pull-up",
    "Chin-up",
    "Inverted Row",
    "Dumbbell Bent Over Row",
    "Dumbbell One Arm Bent-over Row",
    "Barbell Bent Over Row",
    "Barbell Pendlay Row",
    "Barbell Shrug",
  ],
  shoulders: [
    "Handstand Push-up",
    "Shoulder Tap",
    "Dumbbell Lateral Raise",
    "Dumbbell Seated Shoulder Press",
    "Dumbbell Rear Fly",
    "Barbell Seated Overhead Press",
    "Cable Lateral Raise",
    "Cable Shoulder Press",
  ],
  quads: [
    "Forward Lunge",
    "Jump Squat",
    "One Leg Squat",
    "Dumbbell Goblet Squat",
    "Dumbbell Squat",
    "Dumbbell Lunge",
    "Barbell Front Squat",
    "Barbell Full Squat",
  ],
  hamstrings: [
    "Glute-ham Raise",
    "Dumbbell Romanian Deadlift",
    "Dumbbell Deadlift",
    "Dumbbell Single Leg Deadlift",
    "Barbell Deadlift",
    "Barbell Romanian Deadlift",
    "Barbell Good Morning",
    "Barbell Sumo Deadlift",
  ],
  glutes: [
    "Low Glute Bridge on Floor",
    "Glute Bridge March",
    "Kettlebell Swing",
    "Barbell Glute Bridge",
    "Barbell Rack Pull",
    "Dumbbell Sumo Pull Through",
    "Cable Standing Hip Extension",
    "Band Hip Lift",
  ],
  calves: [
    "Bodyweight Standing Calf Raise",
    "Standing Calf Raise (on a Staircase)",
    "Dumbbell Seated Calf Raise",
    "Dumbbell Single Leg Calf Raise",
    "Barbell Standing Leg Calf Raise",
    "Barbell Seated Calf Raise",
    "Cable Standing Calf Raise",
    "Donkey Calf Raise",
  ],
  biceps: [
    "Dumbbell Biceps Curl",
    "Dumbbell Hammer Curl",
    "Dumbbell Concentration Curl",
    "Dumbbell Incline Curl",
    "Barbell Curl",
    "Barbell Reverse Curl",
    "Cable Curl",
    "Biceps Pull-up",
  ],
  triceps: [
    "Triceps Dip",
    "Close-grip Push-up",
    "Bench Dip (knees Bent)",
    "Dumbbell Kickback",
    "Dumbbell Lying Triceps Extension",
    "Barbell Lying Triceps Extension",
    "Cable Kickback",
    "Cable One Arm Tricep Pushdown",
  ],
  core: [
    "Power Point Plank",
    "Front Plank with Twist",
    "Push-up to Side Plank",
    "Bodyweight Incline Side Plank",
    "Band Bicycle Crunch",
    "Crunch (on Stability Ball)",
    "Cable Kneeling Crunch",
    "Weighted Front Plank",
  ],
};

const byName = Object.fromEntries(curated.map((e) => [e.name, e]));
const keepNames = new Set(Object.values(KEEP_BY_MG).flat());
const keep = [...keepNames].map((n) => byName[n]).filter(Boolean);
const cut = curated.filter((e) => !keepNames.has(e.name));

const allExercises = curated.map((e, i) => ({
  index: i + 1,
  name: e.name,
  muscleGroup: e.muscleGroup,
  minEquipment: e.minEquipment,
  movementPattern: e.movementPattern,
  hasImage: hasImg(e.name),
  imageFile: hasImg(e.name) ? mapped[e.name.toLowerCase()] : null,
  decision: keepNames.has(e.name) ? "KEEP" : "CUT",
}));

const byMg = {};
for (const r of allExercises) {
  byMg[r.muscleGroup] ??= { total: 0, withImage: 0 };
  byMg[r.muscleGroup].total++;
  if (r.hasImage) byMg[r.muscleGroup].withImage++;
}

const withImg = allExercises.filter((r) => r.hasImage).length;
const inventory = {
  generatedAt: new Date().toISOString(),
  totals: {
    exercises: curated.length,
    imagesGenerated: withImg,
    imagesOnDisk: files.size,
    remainingWithoutImage: curated.length - withImg,
  },
  byMuscleGroup: byMg,
  byEquipment: curated.reduce((a, e) => {
    a[e.minEquipment] = (a[e.minEquipment] || 0) + 1;
    return a;
  }, {}),
  reductionProposal: {
    strategy:
      "Hand-picked ~8 distinct staples per muscle group (80 total). Prefer compounds + one clear isolation. Cut one-arm duplicates, micro fly/raise/row variants, and niche specialty moves.",
    keepCount: keep.length,
    cutCount: cut.length,
    imagesAlreadyDoneThatWouldBeKept: keep.filter((e) => hasImg(e.name)).length,
    imagesAlreadyDoneThatWouldBeCut: cut.filter((e) => hasImg(e.name)).length,
    remainingImagesIfSlimmed:
      keep.length - keep.filter((e) => hasImg(e.name)).length,
  },
  allExercises,
  proposedKeep: Object.entries(KEEP_BY_MG).flatMap(([mg, names]) =>
    names.map((name, i) => ({
      muscleGroup: mg,
      name,
      minEquipment: byName[name]?.minEquipment,
      hasImage: hasImg(name),
      order: i + 1,
    })),
  ),
  proposedCut: cut.map((e) => ({
    name: e.name,
    muscleGroup: e.muscleGroup,
    minEquipment: e.minEquipment,
    reason: "duplicate / niche / similar look",
  })),
};

writeFileSync(
  join(__dirname, "data/exercise-inventory.json"),
  JSON.stringify(inventory, null, 2) + "\n",
);

const L = [];
L.push("# Exercise inventory", "");
L.push(`- Total exercises: **${inventory.totals.exercises}**`);
L.push(
  `- Images generated (mapped): **${inventory.totals.imagesGenerated}** / ${inventory.totals.exercises}`,
);
L.push(`- Image files on disk: **${inventory.totals.imagesOnDisk}**`);
L.push(`- Still need images: **${inventory.totals.remainingWithoutImage}**`);
L.push("", "## By muscle group", "");
for (const [mg, v] of Object.entries(byMg)) {
  L.push(`- ${mg}: ${v.withImage}/${v.total} with images`);
}
L.push("", "## Reduction proposal (recommended)", "");
L.push(inventory.reductionProposal.strategy, "");
L.push(`- Proposed KEEP: **${inventory.reductionProposal.keepCount}**`);
L.push(`- Proposed CUT: **${inventory.reductionProposal.cutCount}**`);
L.push(
  `- Images already made that would STAY: **${inventory.reductionProposal.imagesAlreadyDoneThatWouldBeKept}**`,
);
L.push(
  `- Images already made that would be UNUSED: **${inventory.reductionProposal.imagesAlreadyDoneThatWouldBeCut}**`,
);
L.push(
  `- If you slim now: remaining images to generate ≈ **${inventory.reductionProposal.remainingImagesIfSlimmed}** (instead of ${inventory.totals.remainingWithoutImage})`,
);
L.push("", "### Proposed KEEP", "");
for (const [mg, names] of Object.entries(KEEP_BY_MG)) {
  L.push(`#### ${mg}`);
  for (const name of names) {
    L.push(
      `- ${name} (${byName[name].minEquipment})${hasImg(name) ? " ✅" : ""}`,
    );
  }
  L.push("");
}
L.push("### Proposed CUT", "");
for (const mg of Object.keys(KEEP_BY_MG)) {
  L.push(`#### ${mg}`);
  for (const e of cut.filter((x) => x.muscleGroup === mg)) {
    L.push(`- ${e.name} (${e.minEquipment})`);
  }
  L.push("");
}
L.push(`## Full list (1–${curated.length})`, "");
for (const r of allExercises) {
  L.push(
    `${String(r.index).padStart(3, " ")}. ${r.hasImage ? "✅" : "⬜"} [${r.decision}] ${r.name} — ${r.muscleGroup} / ${r.minEquipment}`,
  );
}
writeFileSync(join(__dirname, "data/exercise-inventory.md"), L.join("\n") + "\n");

console.log(JSON.stringify(inventory.totals, null, 2));
console.log(JSON.stringify(inventory.reductionProposal, null, 2));
