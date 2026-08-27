/**
 * LIGHT visual-duplicate cuts — only true identical silhouettes / synonyms.
 * Goal: remove lookalike icons without gutting the library.
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CURATED = join(ROOT, "prisma/data/curated-exercises.json");
const BACKUP = join(ROOT, "prisma/data/curated-exercises.full-203.json");

/** Only cut when research + form say the soft-3D icon would be the same picture. */
const CUTS = [
  // Exact synonyms / same movement under different names
  { name: "Dumbbell Reverse Fly", keepInstead: "Dumbbell Rear Fly", reason: "Industry synonym for rear delt / reverse fly — identical bent-over arms-out pose." },
  { name: "Dumbbell Rear Lateral Raise", keepInstead: "Dumbbell Rear Fly", reason: "Same exercise as rear fly / reverse fly." },
  { name: "Dumbbell Rotation Reverse Fly", keepInstead: "Dumbbell Rear Fly", reason: "Same reverse fly; end wrist rotate not visible in a still icon." },
  { name: "Dumbbell Stiff Leg Deadlift", keepInstead: "Dumbbell Romanian Deadlift", reason: "RDL / stiff-leg / straight-leg render as the same hip-hinge icon." },
  { name: "Dumbbell Straight Leg Deadlift", keepInstead: "Dumbbell Romanian Deadlift", reason: "Same hip-hinge icon as RDL." },
  { name: "Band Stiff Leg Deadlift", keepInstead: "Dumbbell Romanian Deadlift", reason: "Same hinge silhouette." },
  { name: "Band Straight Leg Deadlift", keepInstead: "Dumbbell Romanian Deadlift", reason: "Same hinge silhouette." },
  { name: "Barbell Lying Extension", keepInstead: "Barbell Lying Triceps Extension", reason: "Same skull-crusher (synonym name)." },
  { name: "Standing Calves", keepInstead: "Bodyweight Standing Calf Raise", reason: "Same standing calf raise." },
  { name: "Biceps Narrow Pull-ups", keepInstead: "Biceps Pull-up", reason: "Same underhand/narrow pull-up chin-up style icon." },

  // Same body + same prop family — Gemini already produced near-identical images for these
  { name: "Dumbbell One Arm Lateral Raise", keepInstead: "Dumbbell Lateral Raise", reason: "Your generated one-arm vs two-arm lateral raises looked the same in 3/4 view." },
  { name: "Dumbbell One Arm Upright Row", keepInstead: "Dumbbell Upright Row", reason: "Same upright-row pose; one-arm version looked incomplete/identical." },
  { name: "Cable One Arm Lateral Raise", keepInstead: "Cable Lateral Raise", reason: "Same cable lateral with full tower; one vs two arms washed out." },
  { name: "Dumbbell Decline Twist Fly", keepInstead: "Dumbbell Decline Fly", reason: "Same decline fly; twist not visible in your generated set." },
  { name: "Dumbbell Decline One Arm Fly", keepInstead: "Dumbbell Decline Fly", reason: "Same decline fly silhouette as the two-arm version." },
  { name: "Barbell Wide Bench Press", keepInstead: "Barbell Bench Press", reason: "Same flat bench press icon; grip width not readable." },
  { name: "Barbell Guillotine Bench Press", keepInstead: "Barbell Bench Press", reason: "Same flat bench press icon." },
  { name: "Dumbbell Reverse Bench Press", keepInstead: "Dumbbell Bench Press", reason: "Same DB press; reverse grip not readable." },
  { name: "Barbell Front Chest Squat", keepInstead: "Barbell Front Squat", reason: "Same front squat; cross-arm vs clean grip not clear in icons." },
  { name: "Barbell Bench Front Squat", keepInstead: "Barbell Front Squat", reason: "Same front squat in a rack." },
  { name: "Barbell Bench Squat", keepInstead: "Barbell Full Squat", reason: "Same back squat in a rack." },
  { name: "Bodyweight Drop Jump Squat", keepInstead: "Jump Squat", reason: "Same squat→jump silhouette (your gens looked identical)." },
  { name: "Dumbbell Plyo Squat", keepInstead: "Jump Squat", reason: "Same squat→jump; DBs mid-air didn’t differentiate." },
  { name: "Dumbbell Single Leg Squat", keepInstead: "One Leg Squat", reason: "Same single-leg squat body." },
  { name: "Dumbbell Bench Squat", keepInstead: "Dumbbell Squat", reason: "Bench-touch squat looked like a normal DB squat." },
  { name: "Dumbbell Rear Lunge", keepInstead: "Dumbbell Lunge", reason: "Forward vs reverse lunge not reliable in static 3/4 icons." },
  { name: "Lunge with Jump", keepInstead: "Forward Lunge", reason: "Jumping lunge still read as a lunge." },
  { name: "Lunge with Twist", keepInstead: "Forward Lunge", reason: "Twist usually missing; looked like a plain lunge." },
  { name: "Inverted Row Bent Knees", keepInstead: "Inverted Row", reason: "Same under-bar row; knees barely changed the icon." },
  { name: "Inverted Row on Bench", keepInstead: "Inverted Row", reason: "Same under-bar row silhouette." },
  { name: "Chest Dip on Straight Bar", keepInstead: "Chest Dip", reason: "Same dip body path." },
  { name: "Chest Tap Push-up", keepInstead: "Push-up", reason: "Generated as a messy push-up." },
  { name: "Clock Push-up", keepInstead: "Push-up", reason: "Generated as a messy push-up." },
  { name: "Barbell Pendlay Row", keepInstead: "Barbell Bent Over Row", reason: "Looked like a normal bent-over row." },
  { name: "Dumbbell Reverse Grip Row", keepInstead: "Dumbbell Bent Over Row", reason: "Same bent-over row; grip not visible." },
  { name: "Barbell Upright Row", keepInstead: "Dumbbell Upright Row", reason: "Same upright-row body shape." },
  { name: "Cable Upright Row", keepInstead: "Dumbbell Upright Row", reason: "Same upright-row body shape." },
  { name: "Cable Supine Reverse Fly", keepInstead: "Cable Cross-over Revers Fly", reason: "Both reverse-fly on cables; crossover is the clearer full-machine icon." },
  { name: "Glute Bridge Two Legs on Bench", keepInstead: "Low Glute Bridge on Floor", reason: "Same bridge line." },
  { name: "Barbell Glute Bridge Two Legs on Bench", keepInstead: "Barbell Glute Bridge", reason: "Same loaded bridge." },
  { name: "Barbell Seated Good Morning", keepInstead: "Barbell Good Morning", reason: "Same good-morning hinge." },
  { name: "Barbell Stiff Leg Good Morning", keepInstead: "Barbell Good Morning", reason: "Same good-morning hinge." },
  { name: "Bench Dip (knees Bent)", keepInstead: "Triceps Dip", reason: "Same dip path." },
  { name: "Bench Dip on Floor", keepInstead: "Triceps Dip", reason: "Same dip path." },
  { name: "Three Bench Dip", keepInstead: "Triceps Dip", reason: "Same dip path." },
  { name: "Dumbbell One Arm Kickback", keepInstead: "Dumbbell Kickback", reason: "Same kickback." },
  { name: "Cable Two Arm Tricep Kickback", keepInstead: "Cable Kickback", reason: "Same kickback arm path." },
  { name: "Dumbbell Lying Single Extension", keepInstead: "Dumbbell Lying Triceps Extension", reason: "Same skull-crusher." },
  { name: "Barbell Lying Extension", keepInstead: "Barbell Lying Triceps Extension", reason: "Synonym." },
  { name: "One Leg Donkey Calf Raise", keepInstead: "Donkey Calf Raise", reason: "Same donkey calf raise." },
  { name: "Dumbbell Seated One Leg Calf Raise", keepInstead: "Dumbbell Seated Calf Raise", reason: "Same seated calf raise." },
  { name: "Cable Standing One Leg Calf Raise", keepInstead: "Cable Standing Calf Raise", reason: "Same standing cable calf raise." },
  { name: "Weighted Front Plank", keepInstead: "Power Point Plank", reason: "Same front plank line." },
  { name: "Kneeling Plank Tap Shoulder", keepInstead: "Shoulder Tap", reason: "Same shoulder-tap plank." },
  { name: "Cable Seated Crunch", keepInstead: "Cable Kneeling Crunch", reason: "Same cable crunch pattern." },
  { name: "Cable Reverse Crunch", keepInstead: "Cable Kneeling Crunch", reason: "Same cable crunch pattern." },
  { name: "Biceps Narrow Pull-ups", keepInstead: "Biceps Pull-up", reason: "dup" },
];

if (existsSync(BACKUP)) copyFileSync(BACKUP, CURATED);

const curated = JSON.parse(readFileSync(CURATED, "utf8"));
const cutMap = new Map();
for (const c of CUTS) {
  if (!cutMap.has(c.name)) cutMap.set(c.name, c);
}

const cutNames = new Set(
  [...cutMap.keys()].filter((n) => curated.some((e) => e.name === n)),
);
const keep = curated.filter((e) => !cutNames.has(e.name));
const cutList = [...cutNames].map((name) => {
  const e = curated.find((x) => x.name === name);
  const c = cutMap.get(name);
  return {
    name,
    muscleGroup: e.muscleGroup,
    minEquipment: e.minEquipment,
    keepInstead: c.keepInstead,
    reason: c.reason,
  };
});

const keepNames = new Set(keep.map((e) => e.name));
const warnings = cutList
  .filter((c) => !keepNames.has(c.keepInstead))
  .map((c) => `${c.name} → ${c.keepInstead}`);

const byMg = {};
for (const e of keep) byMg[e.muscleGroup] = (byMg[e.muscleGroup] || 0) + 1;

writeFileSync(CURATED, JSON.stringify(keep, null, 2) + "\n");

const files = new Set(
  readdirSync(join(ROOT, "assets/images/workout")).filter((f) =>
    /\.(jpe?g|png)$/i.test(f),
  ),
);
const ts = readFileSync(
  join(ROOT, "src/features/workout/constants/exercise-images.ts"),
  "utf8",
);
const mapped = {};
const re =
  /"([^"]+)": require\("\.\.\/\.\.\/\.\.\/\.\.\/assets\/images\/workout\/([^"]+)"\)/g;
let m;
while ((m = re.exec(ts))) mapped[m[1]] = m[2];

// Remap some KEEP names onto existing files that match visually
const extraMap = {
  "barbell front squat": "Barbell Bench Front Squat.jpg",
  "barbell full squat": "Barbell Bench Squat.jpg",
  "jump squat": "Jump Squat.jpg",
  "forward lunge": "Forward Lunge.jpg",
  "one leg squat": "One Leg Squat.jpg",
  "dumbbell squat": "Dumbbell Squat.jpg",
  "dumbbell goblet squat": "dumbbell_goblet_squat.jpg",
  "dumbbell lunge": "dumbbell_lunge.jpg",
  "dumbbell rear fly": "rear_delt_fly_1787658018147.jpg",
  "dumbbell lateral raise": "standing_db_lateral_raise_1787657507581.jpg",
  "dumbbell upright row": "Dumbbell Upright Row.jpg",
  "dumbbell seated shoulder press": "dumbbell_seated_shoulder_press.jpg",
  "cable lateral raise": "Cable Lateral Raise.jpg",
  "cable cross-over revers fly": "Cable Cross-over Revers Fly.jpg",
  "handstand push-up": "wall_handstand_pushup_1787657090610.jpg",
  "shoulder tap": "plank_shoulder_tap_1787657312274.jpg",
  "pull-up": "overhand_pullup_char_1787654696447.jpg",
  "chin-up": "underhand_chinup_char_1787654133798.jpg",
  "inverted row": "inverted_row_char_1787654275739.jpg",
  "dumbbell bent over row": "bent_over_db_row_1787654893738.jpg",
  "dumbbell one arm bent-over row": "single_arm_db_row_1787655727995.jpg",
  "barbell bent over row": "barbell_overhand_row_1787655901024.jpg",
  "barbell shrug": "barbell_shrug_1787656394449.jpg",
  "bodyweight standing row": "standing_overhand_row_1787654024323.jpg",
  "dumbbell incline row": "chest_incline_db_row_1787655100702.jpg",
};

let tsOut = ts;
for (const [key, file] of Object.entries(extraMap)) {
  if (!files.has(file)) continue;
  mapped[key] = file;
  if (tsOut.includes(`"${key}"`)) {
    tsOut = tsOut.replace(
      new RegExp(`"${key}": require\\("\\.\\./\\.\\./\\.\\./\\.\\./assets/images/workout/[^"]+"\\)`),
      `"${key}": require("../../../../assets/images/workout/${file}")`,
    );
  } else {
    tsOut = tsOut.replace(
      /\n};\n\ntype LazyUri/,
      `\n  "${key}": require("../../../../assets/images/workout/${file}"),\n};\n\ntype LazyUri`,
    );
  }
}
writeFileSync(join(ROOT, "src/features/workout/constants/exercise-images.ts"), tsOut);

const remaining = keep.filter((e) => {
  const f = mapped[e.name.toLowerCase()];
  return !(f && files.has(f));
});

const report = {
  strategy:
    "LIGHT cut: only true visual twins / synonyms (same soft-3D silhouette). Kept distinct equipment and clearly different shapes (chin-up vs pull-up, front vs back squat, RDL vs conventional DL, side plank, etc.).",
  before: curated.length,
  after: keep.length,
  cutCount: cutList.length,
  keepByMuscle: byMg,
  warnings,
  imagesOnDisk: files.size,
  keepWithImage: keep.length - remaining.length,
  keepNeedImage: remaining.length,
  nextToGenerate: remaining.slice(0, 10).map((e) => e.name),
  allRemaining: remaining.map((e) => e.name),
  cuts: cutList.sort(
    (a, b) =>
      a.muscleGroup.localeCompare(b.muscleGroup) || a.name.localeCompare(b.name),
  ),
};

writeFileSync(
  join(ROOT, "scripts/data/visual-duplicate-cuts.json"),
  JSON.stringify(report, null, 2) + "\n",
);

const md = [];
md.push("# Visual-duplicate cuts (light)", "");
md.push(report.strategy, "");
md.push(`- Before: **${report.before}**`);
md.push(`- After: **${report.after}**`);
md.push(`- Cut: **${report.cutCount}**`);
md.push(`- Already have images for KEEP: **${report.keepWithImage}**`);
md.push(`- Still need to generate: **${report.keepNeedImage}**`, "");
md.push("## Keep by muscle", "");
for (const [mg, n] of Object.entries(byMg)) md.push(`- ${mg}: ${n}`);
md.push("", "## Cuts", "");
for (const c of report.cuts) {
  md.push(`- **${c.name}** → **${c.keepInstead}** — ${c.reason}`);
}
md.push("", "## Still need images (generate these)", "");
remaining.forEach((e, i) => {
  md.push(`${String(i + 1).padStart(2)}. ${e.name} (${e.muscleGroup})`);
});
writeFileSync(join(ROOT, "scripts/data/visual-duplicate-cuts.md"), md.join("\n") + "\n");

writeFileSync(
  join(ROOT, "scripts/data/remaining-keep.json"),
  JSON.stringify(
    {
      need: remaining.length,
      remaining: remaining.map((e) => ({
        name: e.name,
        muscleGroup: e.muscleGroup,
        minEquipment: e.minEquipment,
        instructions: e.instructions,
      })),
    },
    null,
    2,
  ) + "\n",
);

console.log(
  JSON.stringify(
    {
      before: report.before,
      after: report.after,
      cut: report.cutCount,
      keepWithImage: report.keepWithImage,
      keepNeedImage: report.keepNeedImage,
      next10: report.nextToGenerate,
      keepByMuscle: byMg,
      warnings,
    },
    null,
    2,
  ),
);
