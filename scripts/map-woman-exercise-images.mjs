/**
 * One-shot: match woman_workouts/*.jpg to catalog exercise names.
 * Prints JSON { byNameFemale } for review / merge into exercise-image-ids.json.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ids = JSON.parse(
  fs.readFileSync(
    path.join(root, "src/features/workout/constants/exercise-image-ids.json"),
    "utf8",
  ),
);
const womanDir = path.join(root, "assets/images/workout/woman_workouts");

const TYPOS = [
  [/dumbell/g, "dumbbell"],
  [/curtesy/g, "curtsey"],
  [/pank/g, "plank"],
  [/^check-incline/, "chest-incline"],
  [/^bb-/, "barbell-"],
  [/^db-/, "dumbbell-"],
];

/** Extra slug → exercise name (lowercase catalog key). */
const MANUAL = {
  "fitness-dips": "chest dip",
  "chest-dips": "chest dip",
  "standing-straight-bar-dips": "chest dip on straight bar",
  "pushup-shoulder-tap": "chest tap push-up",
  "chest-tap-push-up": "chest tap push-up",
  "standard-pushup": "push-up",
  "push-up": "push-up",
  "clock-pushup": "clock push-up",
  "prone-press-character": "elbow lift - reverse push-up",
  "reverse-push-up": "elbow lift - reverse push-up",
  "db-bench-press": "dumbbell bench press",
  "db-press": "dumbbell bench press",
  "decline-db-flyes": "dumbbell decline fly",
  "single-arm-decline-fly": "dumbbell decline one arm fly",
  "twisting-decline-fly": "dumbbell decline one arm fly",
  "single-arm-flat-fly": "dumbbell one arm bench fly",
  "overhand-db-bench": "dumbbell reverse bench press",
  "incline-db-press": "dumbbell incline breeding",
  "barbell-bench-press": "barbell bench press",
  "bb-bench-press": "barbell bench press",
  "bb-guillotine-press": "barbell bench press",
  "decline-barbell-pullover": "barbell decline pullover",
  "standing-cable-press": "cable bench press",
  "floor-bb-fly": "floor fly (with barbell)",
  "squat-suspension-row": "bodyweight squatting row",
  "standing-overhand-row": "bodyweight standing row",
  "underhand-chinup": "chin-up",
  "inverted-row": "inverted row",
  "bent-knee-inverted-row": "inverted row bent knees",
  "under-bench-row": "inverted row on bench",
  "overhand-pullup": "pull-up",
  "bent-over-db-row": "dumbbell bent over row",
  "decline-db-shrug": "dumbbell decline shrug",
  "check-incline-db-row": "dumbbell incline row",
  "chest-incline-db-row": "dumbbell incline row",
  "incline-y-raise": "dumbbell incline y-raise",
  "prone-rear-delt-row": "dumbbell lying rear delt row",
  "reverse-grip-db-row": "dumbbell reverse grip row",
  "barbell-overhand-row": "barbell bent over row",
  "incline-barbell-row": "barbell incline row",
  "single-arm-bb-row": "barbell one arm bent over row",
  "pendlay-row": "barbell pendlay row",
  "barbell-shrug": "barbell shrug",
  "seal-row-cambered-bar": "cambered bar lying row",
  "boxing-left-hook": "left hook. boxing",
  "wall-handstand-pushup": "handstand push-up",
  "hindu-pushup-flow": "pike-to-cobra push-up",
  "pank-shoulder-tap": "shoulder tap",
  "standing-db-lateral-raise": "dumbbell lateral raise",
  "single-arm-db-lateral-raise": "dumbbell one arm lateral raise",
  "single-arm-db-upright-row": "dumbbell one arm upright row",
  "bent-over-raise": "dumbbell incline raise",
  "rear-delt-fly": "dumbbell rear fly",
  "reverse-fly": "dumbbell rear fly",
  "barbell-rear-delt-row": "barbell rear delt row",
  "barbell-seated-overhead-press": "barbell seated overhead press",
  "barbell-upright-row": "barbell upright row",
  "cable-cross-over-reverse-fly": "cable cross-over revers fly",
  "cable-lateral-raise": "cable lateral raise",
  "cable-one-arm-lateral-raise": "cable one arm lateral raise",
  "cable-shoulder-press": "cable shoulder press",
  "cable-upright-row": "cable upright row",
  "curtesy-squat": "curtsey squat",
  "forward-lunge": "forward lunge",
  "jump-squat": "jump squat",
  "bodyweight-drop-jump-squat": "jump squat",
  "lunge-with-jump": "lunge with jump",
  "lunge-with-twist": "lunge with twist",
  "single-leg-squat": "one leg squat",
  "dumbbell-bench-squat": "dumbbell bench squat",
  "dumbell-bench-squat": "dumbbell bench squat",
  "goblet-squat": "dumbbell goblet squat",
  "dumbbell-lunge": "dumbbell lunge",
  "dumbell-lunge": "dumbbell lunge",
  "dumbell-rear-lunge": "dumbbell lunge",
  "plyo-squat": "dumbbell plyo squat",
  "dumbbell-single-leg-squat": "dumbbell single leg squat",
  "dumbell-single-leg-squat": "dumbbell single leg squat",
  "dumbbell-squat": "dumbbell squat",
  "dumbell-squat": "dumbbell squat",
  "barbell-bench-squat": "barbell bench squat",
  "barbell-front-squat": "barbell front squat",
  "barbell-lunge": "barbell lunge",
  "glute-ham-raise": "glute-ham raise",
  "inverse-leg-curl-bench-support": "inverse leg curl (bench support)",
  "leg-curl-cable-machine": "inverse leg curl (on pull-up cable machine)",
  "kick-out-sit": "kick out sit",
  "self-assisted-inverse-leg-curl": "self assisted inverse leg curl",
  "leg-platform-slide": "single leg platform slide",
  "standing-leg-curl": "standing single leg curl",
  "dumbbell-deadlift": "dumbbell deadlift",
  "dumbell-deadlift": "dumbbell deadlift",
  "dumbell-stiff-leg-deadlift": "dumbbell romanian deadlift",
  "dumbell-single-leg-deadlift": "dumbbell single leg deadlift",
  "dumbell-upright-row": "dumbbell upright row",
};

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/['.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeFileSlug(file) {
  let s = path.parse(file).name.toLowerCase().replace(/^woman-/, "");
  for (const [re, to] of TYPOS) s = s.replace(re, to);
  return s;
}

const nameBySlug = new Map();
for (const name of Object.keys(ids.byName)) {
  nameBySlug.set(slug(name), name);
}
const nameByPublicSlug = new Map();
for (const [name, pub] of Object.entries(ids.byName)) {
  nameByPublicSlug.set(slug(pub), name);
}

const files = fs.readdirSync(womanDir).filter((f) => /\.jpe?g$/i.test(f));
const byNameFemale = {};
const unmatched = [];

for (const file of files) {
  const fileSlug = normalizeFileSlug(file);
  const publicId = `woman/${path.parse(file).name}`;
  const name =
    MANUAL[fileSlug] ||
    MANUAL[path.parse(file).name.toLowerCase().replace(/^woman-/, "")] ||
    nameBySlug.get(fileSlug) ||
    nameByPublicSlug.get(fileSlug) ||
    null;
  if (!name) {
    unmatched.push({ file, fileSlug });
    continue;
  }
  if (!byNameFemale[name]) byNameFemale[name] = publicId;
}

// Aliases already in the male map should share the female art.
for (const [alias, targetId] of Object.entries(ids.byName)) {
  if (byNameFemale[alias]) continue;
  const owner = Object.entries(ids.byName).find(
    ([n, id]) => n !== alias && id === targetId && byNameFemale[n],
  );
  if (owner) byNameFemale[alias] = byNameFemale[owner[0]];
}

console.log(JSON.stringify({ byNameFemale, unmatched, count: Object.keys(byNameFemale).length }, null, 2));
