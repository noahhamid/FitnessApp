/**
 * Conservative visual-duplicate cuts for soft-3D icons.
 * Cut ONLY when the illustration silhouette would be identical.
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CURATED = join(ROOT, "prisma/data/curated-exercises.json");
const BACKUP = join(ROOT, "prisma/data/curated-exercises.full-203.json");

/** @type {{ name: string, keepInstead: string, reason: string }[]} */
const CUTS = [
  // Shoulders — rear fly synonyms
  { name: "Dumbbell Reverse Fly", keepInstead: "Dumbbell Rear Fly", reason: "Same bent-over reverse fly (synonym)." },
  { name: "Dumbbell Rear Lateral Raise", keepInstead: "Dumbbell Rear Fly", reason: "Same bent-over reverse fly (synonym)." },
  { name: "Dumbbell Rotation Reverse Fly", keepInstead: "Dumbbell Rear Fly", reason: "Same fly; palm rotate not visible in still icon." },
  { name: "Dumbbell One Arm Lateral Raise", keepInstead: "Dumbbell Lateral Raise", reason: "Same lateral-raise pose; 1 vs 2 DBs unclear in 3/4 icon." },
  { name: "Dumbbell One Arm Upright Row", keepInstead: "Dumbbell Upright Row", reason: "Same upright-row pose." },
  { name: "Cable One Arm Lateral Raise", keepInstead: "Cable Lateral Raise", reason: "Same cable lateral silhouette." },
  { name: "Cable Supine Reverse Fly", keepInstead: "Cable Cross-over Revers Fly", reason: "Both reverse-fly on cables; standing crossover is the clearer icon." },
  { name: "Barbell Upright Row", keepInstead: "Dumbbell Upright Row", reason: "Same upright-row body shape." },
  { name: "Cable Upright Row", keepInstead: "Dumbbell Upright Row", reason: "Same upright-row body shape." },
  { name: "Dumbbell Incline Raise", keepInstead: "Dumbbell Seated Shoulder Press", reason: "Same seated press/raise-to-overhead path." },
  { name: "Left Hook. Boxing", keepInstead: "Shoulder Tap", reason: "Not a gym library staple; odd one-off boxing icon." },
  { name: "Pike-to-cobra Push-up", keepInstead: "Handstand Push-up", reason: "Complex flow; usually generates messy/unreadable icons." },

  // Chest
  { name: "Dumbbell Decline Twist Fly", keepInstead: "Dumbbell Decline Fly", reason: "Same decline fly arc; twist invisible." },
  { name: "Dumbbell Decline One Arm Fly", keepInstead: "Dumbbell Decline Fly", reason: "Same decline fly silhouette." },
  { name: "Barbell Wide Bench Press", keepInstead: "Barbell Bench Press", reason: "Same flat bench press." },
  { name: "Barbell Guillotine Bench Press", keepInstead: "Barbell Bench Press", reason: "Same press; neck path not readable." },
  { name: "Dumbbell Reverse Bench Press", keepInstead: "Dumbbell Bench Press", reason: "Same DB press; reverse grip not readable." },
  { name: "Chest Tap Push-up", keepInstead: "Push-up", reason: "Reads as a messy push-up." },
  { name: "Clock Push-up", keepInstead: "Push-up", reason: "Reads as a messy push-up." },
  { name: "Elbow Lift - Reverse Push-up", keepInstead: "Push-up", reason: "Reads as a low push-up." },
  { name: "Chest Dip on Straight Bar", keepInstead: "Chest Dip", reason: "Same dip body path." },
  { name: "Floor Fly (with Barbell)", keepInstead: "Dumbbell One Arm Bench Fly", reason: "Floor fly ≈ flat fly; keep one flat fly pattern." },
  { name: "Barbell Decline Pullover", keepInstead: "Dumbbell Decline Fly", reason: "Decline + arms overhead often looks like a fly/pullover mush." },

  // Back
  { name: "Inverted Row Bent Knees", keepInstead: "Inverted Row", reason: "Same under-bar row." },
  { name: "Inverted Row on Bench", keepInstead: "Inverted Row", reason: "Same under-bar row." },
  { name: "Dumbbell Reverse Grip Row", keepInstead: "Dumbbell Bent Over Row", reason: "Same bent-over row; grip not readable." },
  { name: "Barbell Pendlay Row", keepInstead: "Barbell Bent Over Row", reason: "Looks like bent-over row." },
  { name: "Barbell Incline Row", keepInstead: "Dumbbell Incline Row", reason: "Same chest-supported row shape." },
  { name: "Barbell One Arm Bent Over Row", keepInstead: "Dumbbell One Arm Bent-over Row", reason: "Same one-arm row pose." },
  { name: "Barbell Rear Delt Row", keepInstead: "Barbell Bent Over Row", reason: "Looks like normal bent-over row." },
  { name: "Cambered Bar Lying Row", keepInstead: "Dumbbell Incline Row", reason: "Prone row on bench — same family." },
  { name: "Bodyweight Squatting Row", keepInstead: "Bodyweight Standing Row", reason: "Same horizontal pull." },
  { name: "Dumbbell Decline Shrug", keepInstead: "Barbell Shrug", reason: "Shrug silhouette is the same." },
  { name: "Dumbbell Lying Rear Delt Row", keepInstead: "Dumbbell Rear Fly", reason: "Prone rear-delt raise ≈ rear fly." },
  { name: "Dumbbell Incline Y-raise", keepInstead: "Dumbbell Rear Fly", reason: "Prone arms-out collapses to rear-fly family." },

  // Quads
  { name: "Bodyweight Drop Jump Squat", keepInstead: "Jump Squat", reason: "Same squat→jump icon." },
  { name: "Dumbbell Plyo Squat", keepInstead: "Jump Squat", reason: "Same squat→jump icon." },
  { name: "Lunge with Jump", keepInstead: "Forward Lunge", reason: "Still reads as a lunge." },
  { name: "Lunge with Twist", keepInstead: "Forward Lunge", reason: "Twist usually missing; reads as lunge." },
  { name: "Dumbbell Rear Lunge", keepInstead: "Dumbbell Lunge", reason: "Forward vs reverse not reliable in static icon." },
  { name: "Dumbbell Bench Squat", keepInstead: "Dumbbell Squat", reason: "Bench-touch looks like normal squat." },
  { name: "Dumbbell Single Leg Squat", keepInstead: "One Leg Squat", reason: "Same single-leg squat body." },
  { name: "Barbell Bench Squat", keepInstead: "Barbell Full Squat", reason: "Same back squat in a rack." },
  { name: "Barbell Bench Front Squat", keepInstead: "Barbell Front Squat", reason: "Same front squat." },
  { name: "Barbell Front Chest Squat", keepInstead: "Barbell Front Squat", reason: "Same front squat (grip style not clear)." },
  { name: "Curtsey Squat", keepInstead: "Forward Lunge", reason: "Usually renders as a weird lunge." },
  { name: "Barbell Bench Front Squat", keepInstead: "Barbell Front Squat", reason: "dup" },

  // Hamstrings
  { name: "Dumbbell Stiff Leg Deadlift", keepInstead: "Dumbbell Romanian Deadlift", reason: "Identical hip-hinge (RDL synonym)." },
  { name: "Dumbbell Straight Leg Deadlift", keepInstead: "Dumbbell Romanian Deadlift", reason: "Identical hip-hinge." },
  { name: "Band Stiff Leg Deadlift", keepInstead: "Dumbbell Romanian Deadlift", reason: "Same hinge silhouette." },
  { name: "Band Straight Leg Deadlift", keepInstead: "Dumbbell Romanian Deadlift", reason: "Same hinge silhouette." },
  { name: "Cable Deadlift", keepInstead: "Barbell Deadlift", reason: "Same deadlift body shape." },
  { name: "Barbell Single Leg Deadlift", keepInstead: "Dumbbell Single Leg Deadlift", reason: "Same single-leg hinge." },
  { name: "Inverse Leg Curl (bench Support)", keepInstead: "Glute-ham Raise", reason: "Same nordic/leg-curl body." },
  { name: "Inverse Leg Curl (on Pull-up Cable Machine)", keepInstead: "Glute-ham Raise", reason: "Same nordic/leg-curl body." },
  { name: "Self Assisted Inverse Leg Curl", keepInstead: "Glute-ham Raise", reason: "Same nordic/leg-curl body." },
  { name: "Standing Single Leg Curl", keepInstead: "Glute-ham Raise", reason: "Leg-curl family; weak distinct icon." },
  { name: "Kick Out Sit", keepInstead: "Glute-ham Raise", reason: "Obscure; unclear icon." },
  { name: "Single Leg Platform Slide", keepInstead: "Dumbbell Single Leg Deadlift", reason: "Obscure; not distinct." },

  // Glutes
  { name: "Glute Bridge Two Legs on Bench", keepInstead: "Low Glute Bridge on Floor", reason: "Same bridge line." },
  { name: "Rear Decline Bridge", keepInstead: "Low Glute Bridge on Floor", reason: "Same bridge line." },
  { name: "Barbell Glute Bridge Two Legs on Bench", keepInstead: "Barbell Glute Bridge", reason: "Same loaded bridge." },
  { name: "Barbell Seated Good Morning", keepInstead: "Barbell Good Morning", reason: "Same good-morning hinge." },
  { name: "Barbell Stiff Leg Good Morning", keepInstead: "Barbell Good Morning", reason: "Same good-morning hinge." },
  { name: "Basic Toe Touch", keepInstead: "Low Glute Bridge on Floor", reason: "Not a clear strength icon." },
  { name: "Bent Knee Lying Twist", keepInstead: "Glute Bridge March", reason: "Looks like a core twist, not glute work." },
  { name: "Exercise Ball One Legged Diagonal Kick Hamstring Curl", keepInstead: "Glute Bridge March", reason: "Overly complex; Gemini mush." },
  { name: "Bench Hip Extension", keepInstead: "Low Glute Bridge on Floor", reason: "Same hip-extension bridge family." },
  { name: "Band Bent-over Hip Extension", keepInstead: "Band Hip Lift", reason: "Same band hip extension." },

  // Calves — keep standing BW, seated DB, standing bar
  { name: "Standing Calves", keepInstead: "Bodyweight Standing Calf Raise", reason: "Same standing calf raise." },
  { name: "Standing Calf Raise (on a Staircase)", keepInstead: "Bodyweight Standing Calf Raise", reason: "Same standing calf raise." },
  { name: "One Leg Floor Calf Raise", keepInstead: "Bodyweight Standing Calf Raise", reason: "Same calf raise." },
  { name: "Donkey Calf Raise", keepInstead: "Bodyweight Standing Calf Raise", reason: "Still “up on toes”." },
  { name: "One Leg Donkey Calf Raise", keepInstead: "Bodyweight Standing Calf Raise", reason: "Same." },
  { name: "Ankle Circles", keepInstead: "Bodyweight Standing Calf Raise", reason: "Not a strength move." },
  { name: "Dumbbell Seated One Leg Calf Raise", keepInstead: "Dumbbell Seated Calf Raise", reason: "Same seated calf." },
  { name: "Dumbbell Single Leg Calf Raise", keepInstead: "Bodyweight Standing Calf Raise", reason: "Same calf-raise family." },
  { name: "Single Leg Calf Raise (on a Dumbbell)", keepInstead: "Bodyweight Standing Calf Raise", reason: "Same." },
  { name: "Band Single Leg Calf Raise", keepInstead: "Bodyweight Standing Calf Raise", reason: "Same." },
  { name: "Band Single Leg Reverse Calf Raise", keepInstead: "Bodyweight Standing Calf Raise", reason: "Same." },
  { name: "Exercise Ball on the Wall Calf Raise", keepInstead: "Dumbbell Seated Calf Raise", reason: "Same calf raise." },
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
  { name: "Biceps Narrow Pull-ups", keepInstead: "Biceps Pull-up", reason: "Same chin-up style pull." },
  { name: "Biceps Leg Concentration Curl", keepInstead: "Dumbbell Concentration Curl", reason: "Odd BW twin of concentration curl." },
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
  { name: "Dumbbell Incline Two Arm Extension", keepInstead: "Dumbbell Lying Triceps Extension", reason: "Same extension family." },
  { name: "Dumbbell Seated Bench Extension", keepInstead: "Dumbbell Lying Triceps Extension", reason: "OH extension ≈ same family in icons." },
  { name: "Barbell Lying Extension", keepInstead: "Barbell Lying Triceps Extension", reason: "Synonym." },
  { name: "Barbell Incline Reverse-grip Press", keepInstead: "Close-grip Push-up", reason: "Odd press; not a clear triceps icon." },

  // Core — only true twins; keep side plank & main crunch patterns
  { name: "Kneeling Plank Tap Shoulder", keepInstead: "Shoulder Tap", reason: "Same shoulder-tap plank." },
  { name: "Front Plank with Twist", keepInstead: "Power Point Plank", reason: "Looks like a standard plank." },
  { name: "Weighted Front Plank", keepInstead: "Power Point Plank", reason: "Looks like a standard plank." },
  { name: "Reverse Plank with Leg Lift", keepInstead: "Power Point Plank", reason: "Still a plank line." },
  { name: "Band Jack Knife Sit-up", keepInstead: "Band Bicycle Crunch", reason: "Same crunch/sit-up family." },
  { name: "Band Push Sit-up", keepInstead: "Band Bicycle Crunch", reason: "Same." },
  { name: "Band Standing Crunch", keepInstead: "Cable Kneeling Crunch", reason: "Standing/cable crunch family." },
  { name: "Cable Reverse Crunch", keepInstead: "Cable Kneeling Crunch", reason: "Cable crunch family." },
  { name: "Cable Seated Crunch", keepInstead: "Cable Kneeling Crunch", reason: "Cable crunch family." },
  { name: "Cable Side Crunch", keepInstead: "Cable Kneeling Crunch", reason: "Cable crunch family." },
  { name: "Barbell Press Sit-up", keepInstead: "Crunch (on Stability Ball)", reason: "Sit-up/crunch family." },
  { name: "Roller Reverse Crunch", keepInstead: "Crunch (on Stability Ball)", reason: "Crunch family." },
  { name: "Dumbbell Side Plank with Rear Fly", keepInstead: "Bodyweight Incline Side Plank", reason: "Side plank + fly = muddy icon." },
  { name: "Side Plank Hip Adduction", keepInstead: "Bodyweight Incline Side Plank", reason: "Same side-plank silhouette." },
  { name: "Push-up to Side Plank", keepInstead: "Bodyweight Incline Side Plank", reason: "Ends as side plank; transition not clear in 2 frames." },
];

// Ensure full 203 is source
if (existsSync(BACKUP)) {
  copyFileSync(BACKUP, CURATED);
}

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

// Validate keepInstead survives
const keepNames = new Set(keep.map((e) => e.name));
const warnings = [];
for (const c of cutList) {
  if (!keepNames.has(c.keepInstead)) {
    warnings.push(`${c.name} → ${c.keepInstead} (target missing or also cut)`);
  }
}

const byMg = {};
for (const e of keep) byMg[e.muscleGroup] = (byMg[e.muscleGroup] || 0) + 1;

writeFileSync(CURATED, JSON.stringify(keep, null, 2) + "\n");

const report = {
  strategy:
    "Cut only visual twins for soft-3D icons (same pose family). Keep distinct equipment and clearly different body shapes (chin-up vs pull-up, front vs back squat, side plank vs front plank, RDL vs conventional deadlift, etc.).",
  before: curated.length,
  after: keep.length,
  cutCount: cutList.length,
  keepByMuscle: byMg,
  warnings,
  cuts: cutList.sort((a, b) => a.muscleGroup.localeCompare(b.muscleGroup) || a.name.localeCompare(b.name)),
  keep: keep.map((e) => ({
    name: e.name,
    muscleGroup: e.muscleGroup,
    minEquipment: e.minEquipment,
  })),
};

writeFileSync(
  join(ROOT, "scripts/data/visual-duplicate-cuts.json"),
  JSON.stringify(report, null, 2) + "\n",
);

const md = [];
md.push("# Visual-duplicate cuts (conservative)", "");
md.push(report.strategy, "");
md.push(`- Before: **${report.before}**`);
md.push(`- After: **${report.after}**`);
md.push(`- Cut: **${report.cutCount}**`, "");
md.push("## Keep by muscle", "");
for (const [mg, n] of Object.entries(byMg)) md.push(`- ${mg}: ${n}`);
md.push("", "## What was cut (and what to use instead)", "");
for (const c of report.cuts) {
  md.push(`- **${c.name}** → **${c.keepInstead}** — ${c.reason}`);
}
md.push("", "## Keep list", "");
for (const e of report.keep) {
  md.push(`- ${e.name} (${e.muscleGroup} / ${e.minEquipment})`);
}
writeFileSync(join(ROOT, "scripts/data/visual-duplicate-cuts.md"), md.join("\n") + "\n");

console.log(JSON.stringify({ before: report.before, after: report.after, cut: report.cutCount, keepByMuscle: byMg, warnings }, null, 2));
