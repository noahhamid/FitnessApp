import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "assets/images/workout");
const curated = JSON.parse(
  readFileSync(join(ROOT, "prisma/data/curated-exercises.json"), "utf8"),
);
const ts = readFileSync(
  join(ROOT, "src/features/workout/constants/exercise-images.ts"),
  "utf8",
);

const mapped = [];
const re =
  /"([^"]+)": require\("\.\.\/\.\.\/\.\.\/\.\.\/assets\/images\/workout\/([^"]+)"\)/g;
let m;
while ((m = re.exec(ts))) mapped.push({ key: m[1], file: m[2] });

const files = new Set(
  readdirSync(DIR).filter((f) => /\.(jpe?g|png|jfif)$/i.test(f)),
);
const used = new Set(mapped.map((x) => x.file));

const missingFiles = mapped.filter((x) => !existsSync(join(DIR, x.file)));
const unknownKeys = mapped.filter(
  (x) => !curated.some((e) => e.name.toLowerCase() === x.key),
);
const mappedOk = curated.filter((e) =>
  mapped.some((x) => x.key === e.name.toLowerCase()),
);
const unused = [...files].filter((f) => !used.has(f)).sort();

// Detect same file used by multiple exercises (intentional aliases)
const byFile = new Map();
for (const x of mapped) {
  if (!byFile.has(x.file)) byFile.set(x.file, []);
  byFile.get(x.file).push(x.key);
}
const shared = [...byFile.entries()]
  .filter(([, keys]) => keys.length > 1)
  .map(([file, keys]) => ({ file, keys }));

console.log(
  JSON.stringify(
    {
      filesOnDisk: files.size,
      mappingEntries: mapped.length,
      uniqueFilesUsed: used.size,
      curatedWithImage: mappedOk.length,
      missingFiles,
      unknownKeys,
      intentionalSharedFiles: shared,
      unusedOnDisk: unused,
      unusedReasons: {
        "bench_press_gold_char_1787548634638.jpg":
          "Duplicate barbell bench press (kept barbell_bench_press_char)",
        "Barbell Seated Overhead Press (2).jpg":
          "Duplicate of Barbell Seated Overhead Press.jpg",
        "incline_db_press_1787657401926.jpg":
          "Visually seated DB shoulder press (duplicate of dumbbell_seated_shoulder_press)",
        "dumbbell_deadlift_1787664311012.jpg":
          "Filename says deadlift but image is a dumbbell squat (duplicate)",
      },
    },
    null,
    2,
  ),
);
