/**
 * Build exercise inventory + reduction proposal.
 * Run: node scripts/build-exercise-inventory.mjs
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const curated = JSON.parse(
  readFileSync(join(ROOT, "prisma/data/curated-exercises.json"), "utf8"),
);
const files = readdirSync(join(ROOT, "assets/images/workout")).filter((f) =>
  /\.(jpe?g|png)$/i.test(f),
);

/** Lowercase exercise name → filename on disk (first 60 generated). */
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

function hasMappedImage(name) {
  const file = mapped[name.toLowerCase()];
  return Boolean(file && files.includes(file));
}

function scoreKeep(e) {
  const n = e.name.toLowerCase();
  let s = 50;
  if (/\bone arm\b|one-arm|single arm/.test(n)) s -= 18;
  if (
    /twist|rotation|guillotine|cambered|breeding|clock|chest tap|elbow lift|pike-to-cobra|left hook|boxing|decline twist|reverse bench|wide bench|floor fly|squatting row|standing row|bent knees|on bench|decline shrug|y-raise|lying rear|reverse grip|incline row|cambered|rear delt row|upright row|rear lateral|one arm lateral|one arm upright|one arm fly|decline one arm|incline y|guillotine|cross-over revers/.test(
      n,
    )
  ) {
    s -= 14;
  }
  if (
    /^(push-up|pull-up|chin-up|plank|lunge)/.test(n) ||
    /\b(barbell bench press|dumbbell bench press|barbell bent over row|dumbbell bent over row|dumbbell lateral raise|dumbbell seated shoulder press|barbell seated overhead press|cable lateral raise|inverted row|chest dip|diamond push-up|handstand push-up|shoulder tap|barbell shrug|dumbbell rear fly|cable bench press|dumbbell incline breeding)\b/.test(
      n,
    )
  ) {
    s += 40;
  }
  if (/\b(squat|deadlift|bench|row|press|pull-up|chin-up|dip|lunge|thrust|rdl|hip thrust|romanian|curl|extension|calf|crunch|plank)\b/.test(n)) {
    s += 8;
  }
  if (e.minEquipment === "bodyweight") s += 4;
  if (e.minEquipment === "home_dumbbells") s += 2;
  return s;
}

const rows = curated.map((e, i) => ({
  index: i + 1,
  name: e.name,
  muscleGroup: e.muscleGroup,
  minEquipment: e.minEquipment,
  movementPattern: e.movementPattern,
  hasImage: hasMappedImage(e.name),
  imageFile: hasMappedImage(e.name) ? mapped[e.name.toLowerCase()] : null,
}));

const withImg = rows.filter((r) => r.hasImage).length;
const byMg = {};
for (const r of rows) {
  if (!byMg[r.muscleGroup]) byMg[r.muscleGroup] = { total: 0, withImage: 0 };
  byMg[r.muscleGroup].total++;
  if (r.hasImage) byMg[r.muscleGroup].withImage++;
}

const N_PER = 8;
const groups = {};
for (const e of curated) {
  (groups[e.muscleGroup] ||= []).push(e);
}

const proposed = [];
const cut = [];
for (const [mg, list] of Object.entries(groups)) {
  const ranked = list
    .map((e) => ({ e, s: scoreKeep(e) }))
    .sort((a, b) => b.s - a.s);
  ranked.forEach((x, i) => {
    if (i < N_PER) {
      proposed.push({ ...x.e, score: x.s });
    } else {
      cut.push({
        name: x.e.name,
        muscleGroup: mg,
        minEquipment: x.e.minEquipment,
        score: x.s,
        reason: "lower priority / similar variant",
      });
    }
  });
}

const inventory = {
  generatedAt: new Date().toISOString(),
  totals: {
    exercises: curated.length,
    imagesGenerated: withImg,
    imagesOnDisk: files.length,
    remainingWithoutImage: curated.length - withImg,
  },
  byMuscleGroup: byMg,
  byEquipment: curated.reduce((a, e) => {
    a[e.minEquipment] = (a[e.minEquipment] || 0) + 1;
    return a;
  }, {}),
  reductionProposal: {
    strategy:
      "Keep ~8 most distinct / staple exercises per muscle group → ~80 total. Cut one-arm copies of two-arm moves, micro-variants of flies/raises/rows, and niche specialty bars.",
    keepCount: proposed.length,
    cutCount: cut.length,
    imagesAlreadyDoneThatWouldBeKept: proposed.filter((e) =>
      hasMappedImage(e.name),
    ).length,
    imagesAlreadyDoneThatWouldBeCut: cut.filter((e) => hasMappedImage(e.name))
      .length,
  },
  allExercises: rows,
  proposedKeep: proposed.map((e, i) => ({
    index: i + 1,
    name: e.name,
    muscleGroup: e.muscleGroup,
    minEquipment: e.minEquipment,
    movementPattern: e.movementPattern,
    score: e.score,
    hasImage: hasMappedImage(e.name),
  })),
  proposedCut: cut,
};

mkdirSync(join(__dirname, "data"), { recursive: true });
writeFileSync(
  join(__dirname, "data/exercise-inventory.json"),
  JSON.stringify(inventory, null, 2) + "\n",
);

const lines = [];
lines.push("# Exercise inventory");
lines.push("");
lines.push(`- Total exercises: **${curated.length}**`);
lines.push(`- Images generated (mapped): **${withImg}** / ${curated.length}`);
lines.push(`- Image files on disk: **${files.length}**`);
lines.push(`- Still need images: **${curated.length - withImg}**`);
lines.push("");
lines.push("## By muscle group");
lines.push("");
for (const [mg, v] of Object.entries(byMg)) {
  lines.push(`- ${mg}: ${v.withImage}/${v.total} with images`);
}
lines.push("");
lines.push("## Reduction proposal");
lines.push("");
lines.push(inventory.reductionProposal.strategy);
lines.push("");
lines.push(
  `- Proposed KEEP: **${proposed.length}** (≈8 per muscle × 10 groups)`,
);
lines.push(`- Proposed CUT: **${cut.length}**`);
lines.push(
  `- Of images already made: **${inventory.reductionProposal.imagesAlreadyDoneThatWouldBeKept}** would stay, **${inventory.reductionProposal.imagesAlreadyDoneThatWouldBeCut}** would be unused if you cut`,
);
lines.push("");
lines.push("### Proposed KEEP");
lines.push("");
for (const mg of Object.keys(groups)) {
  lines.push(`#### ${mg}`);
  for (const p of proposed.filter((x) => x.muscleGroup === mg)) {
    const mark = hasMappedImage(p.name) ? " ✅" : "";
    lines.push(`- ${p.name} (${p.minEquipment})${mark}`);
  }
  lines.push("");
}
lines.push("### Proposed CUT");
lines.push("");
for (const mg of Object.keys(groups)) {
  const c = cut.filter((p) => p.muscleGroup === mg);
  if (!c.length) continue;
  lines.push(`#### ${mg}`);
  for (const p of c) lines.push(`- ${p.name} (${p.minEquipment})`);
  lines.push("");
}
lines.push("## Full list (1–" + curated.length + ")");
lines.push("");
for (const r of rows) {
  lines.push(
    `${String(r.index).padStart(3, " ")}. ${r.hasImage ? "✅" : "⬜"} ${r.name} — ${r.muscleGroup} / ${r.minEquipment}`,
  );
}
lines.push("");

writeFileSync(join(__dirname, "data/exercise-inventory.md"), lines.join("\n"));

console.log(JSON.stringify(inventory.totals, null, 2));
console.log(
  "proposal keep",
  proposed.length,
  "cut",
  cut.length,
  "| kept-with-image",
  inventory.reductionProposal.imagesAlreadyDoneThatWouldBeKept,
  "cut-with-image",
  inventory.reductionProposal.imagesAlreadyDoneThatWouldBeCut,
);
console.log("wrote scripts/data/exercise-inventory.md + .json");
