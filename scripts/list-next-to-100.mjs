import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const curated = JSON.parse(
  readFileSync(join(ROOT, "prisma/data/curated-exercises.json"), "utf8"),
);
const files = new Set(
  readdirSync(join(ROOT, "assets/images/workout")).filter((f) =>
    /\.(jpe?g|png)$/i.test(f),
  ),
);
const ts = readFileSync(
  join(ROOT, "src/features/workout/constants/exercise-images.ts"),
  "utf8",
);
const mapped = new Map();
const re =
  /"([^"]+)": require\("\.\.\/\.\.\/\.\.\/\.\.\/assets\/images\/workout\/([^"]+)"\)/g;
let m;
while ((m = re.exec(ts))) mapped.set(m[1], m[2]);

const need = [];
for (const e of curated) {
  const key = e.name.toLowerCase();
  const f = mapped.get(key);
  if (!(f && files.has(f))) need.push(e);
}

const out = {
  onDisk: files.size,
  mappedOk: curated.length - need.length,
  needCount: need.length,
  to100: Math.max(0, 100 - files.size),
  next: need.slice(0, 30).map((e) => ({
    name: e.name,
    muscleGroup: e.muscleGroup,
    minEquipment: e.minEquipment,
    instructions: e.instructions,
  })),
};
writeFileSync(
  join(ROOT, "scripts/data/next-to-100.json"),
  JSON.stringify(out, null, 2) + "\n",
);
console.log(JSON.stringify(out, null, 2));
