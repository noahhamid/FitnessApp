import {
  readFileSync,
  readdirSync,
  existsSync,
  renameSync,
  writeFileSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "assets/images/workout");
const curated = JSON.parse(
  readFileSync(join(ROOT, "prisma/data/curated-exercises.json"), "utf8"),
);

// Rename watermarked pistol squat
const wm = join(DIR, "watermarked_img_4778364474975471225.jpg");
const oneLeg = join(DIR, "One Leg Squat.jpg");
if (existsSync(wm)) {
  if (existsSync(oneLeg)) renameSync(oneLeg, join(DIR, "_One Leg Squat_old.jpg"));
  renameSync(wm, oneLeg);
}

const ts = readFileSync(
  join(ROOT, "src/features/workout/constants/exercise-images.ts"),
  "utf8",
);
const mapped = new Map();
const re =
  /"([^"]+)": require\("\.\.\/\.\.\/\.\.\/\.\.\/assets\/images\/workout\/([^"]+)"\)/g;
let m;
while ((m = re.exec(ts))) mapped.set(m[1], m[2]);

const files = new Set(readdirSync(DIR).filter((f) => /\.(jpe?g|png)$/i.test(f)));
const used = new Set(mapped.values());

const withImg = [];
const need = [];
for (const e of curated) {
  const key = e.name.toLowerCase();
  const f = mapped.get(key);
  if (f && files.has(f) && existsSync(join(DIR, f))) withImg.push(e);
  else need.push(e);
}

const unused = [...files].filter((f) => !used.has(f)).sort();
const byFile = new Map();
for (const [k, f] of mapped) {
  if (!byFile.has(f)) byFile.set(f, []);
  byFile.get(f).push(k);
}
const shared = [...byFile.entries()].filter(([, ks]) => ks.length > 1);

const report = {
  curated: curated.length,
  filesOnDisk: files.size,
  mappedEntries: mapped.size,
  withImage: withImg.length,
  needImage: need.length,
  unusedOnDisk: unused,
  sharedFiles: shared.map(([file, keys]) => ({ file, keys })),
  needByMuscle: {},
  next10: need.slice(0, 10).map((e) => ({
    name: e.name,
    muscleGroup: e.muscleGroup,
    minEquipment: e.minEquipment,
  })),
  allNeed: need.map((e) => e.name),
};

for (const e of need) {
  report.needByMuscle[e.muscleGroup] = (report.needByMuscle[e.muscleGroup] || 0) + 1;
}

writeFileSync(
  join(ROOT, "scripts/data/image-progress.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
