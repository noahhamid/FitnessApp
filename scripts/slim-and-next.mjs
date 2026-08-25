/**
 * Slim curated-exercises.json to the KEEP set, map new images,
 * list remaining KEEP without images, write next prompt batch.
 */
import { readFileSync, writeFileSync, readdirSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CURATED_PATH = join(ROOT, "prisma/data/curated-exercises.json");
const BACKUP_PATH = join(ROOT, "prisma/data/curated-exercises.full-203.json");
const IMAGES_TS = join(ROOT, "src/features/workout/constants/exercise-images.ts");
const PROMPTS_PATH = join(__dirname, "data/exercise-image-prompts.json");

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

const KEEP_ORDER = Object.values(KEEP_BY_MG).flat();
const keepSet = new Set(KEEP_ORDER);

const curated = JSON.parse(readFileSync(CURATED_PATH, "utf8"));
const byName = Object.fromEntries(curated.map((e) => [e.name, e]));

// Backup full list once
copyFileSync(CURATED_PATH, BACKUP_PATH);

const slimmed = KEEP_ORDER.map((name) => {
  const e = byName[name];
  if (!e) throw new Error(`Missing exercise in curated: ${name}`);
  return e;
});

writeFileSync(CURATED_PATH, JSON.stringify(slimmed, null, 2) + "\n");

// --- Map new image filenames into exercise-images.ts ---
const newMaps = {
  "cable shoulder press": "Cable Shoulder Press.jpg",
  "cable supine reverse fly": "Cable Supine Reverse Fly.jpg",
  "cable upright row": "Cable Upright Row.jpg",
  "bodyweight drop jump squat": "Bodyweight Drop Jump Squat.jpg",
  "curtsey squat": "Curtsey Squat.jpg",
  "forward lunge": "Forward Lunge.jpg",
  "jump squat": "Jump Squat.jpg",
  "lunge with jump": "Lunge with Jump.jpg",
  "lunge with twist": "Lunge with Twist.jpg",
  "one leg squat": "One Leg Squat.jpg",
  "dumbbell bench squat": "Dumbbell Bench Squat.jpg",
  "dumbbell goblet squat": "dumbbell_goblet_squat.jpg",
  "dumbbell lunge": "dumbbell_lunge.jpg",
  "dumbbell plyo squat": "Dumbbell Plyo Squat.jpg",
  "dumbbell rear lunge": "Dumbbell Rear Lunge.jpg",
  "dumbbell single leg squat": "Dumbbell Single Leg Squat.jpg",
  "dumbbell squat": "Dumbbell Squat.jpg",
  "barbell bench front squat": "Barbell Bench Front Squat.jpg",
  "barbell bench squat": "Barbell Bench Squat.jpg",
  "barbell front chest squat": "Barbell Front Chest Squat.jpg",
};

let ts = readFileSync(IMAGES_TS, "utf8");
for (const [key, file] of Object.entries(newMaps)) {
  const line = `  "${key}": require("../../../../assets/images/workout/${file}"),`;
  if (ts.includes(`"${key}"`)) continue;
  ts = ts.replace(
    /(\n};\n\ntype LazyUri)/,
    `\n${line}$1`,
  );
}
writeFileSync(IMAGES_TS, ts);

// Detect which KEEP exercises have images (from BY_NAME requires + disk)
const files = new Set(
  readdirSync(join(ROOT, "assets/images/workout")).filter((f) =>
    /\.(jpe?g|png)$/i.test(f),
  ),
);

// Parse existing require mappings from ts
const mapped = {};
const re =
  /"([^"]+)": require\("\.\.\/\.\.\/\.\.\/\.\.\/assets\/images\/workout\/([^"]+)"\)/g;
let m;
const tsNow = readFileSync(IMAGES_TS, "utf8");
while ((m = re.exec(tsNow))) {
  mapped[m[1]] = m[2];
}

const remaining = KEEP_ORDER.filter((name) => {
  const f = mapped[name.toLowerCase()];
  return !(f && files.has(f));
});

const withImg = KEEP_ORDER.length - remaining.length;

const summary = {
  slimmedTo: slimmed.length,
  backedUpTo: "prisma/data/curated-exercises.full-203.json",
  cutCount: curated.length - slimmed.length,
  keepWithImage: withImg,
  keepNeedImage: remaining.length,
  remainingNames: remaining,
  nextBatch: remaining.slice(0, 10),
};

writeFileSync(
  join(__dirname, "data/slim-summary.json"),
  JSON.stringify(summary, null, 2) + "\n",
);

console.log(JSON.stringify(summary, null, 2));
