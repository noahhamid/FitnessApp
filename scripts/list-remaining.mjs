import { readFileSync, writeFileSync, readdirSync } from "fs";
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
const mapped = {};
const re =
  /"([^"]+)": require\("\.\.\/\.\.\/\.\.\/\.\.\/assets\/images\/workout\/([^"]+)"\)/g;
let m;
while ((m = re.exec(ts))) mapped[m[1]] = m[2];

const remaining = curated
  .filter((e) => {
    const f = mapped[e.name.toLowerCase()];
    return !(f && files.has(f));
  })
  .map((e) => ({
    name: e.name,
    muscleGroup: e.muscleGroup,
    minEquipment: e.minEquipment,
    instructions: e.instructions,
    mapFile: mapped[e.name.toLowerCase()] || null,
  }));

const mappedButMissingFile = remaining.filter((e) => e.mapFile);
const noMap = remaining.filter((e) => !e.mapFile);

console.log(
  JSON.stringify(
    {
      keep: curated.length,
      withImg: curated.length - remaining.length,
      need: remaining.length,
      mappedButMissingFile: mappedButMissingFile.map((e) => e.name + " => " + e.mapFile),
      noMapSample: noMap.slice(0, 15).map((e) => e.name),
      next10: remaining.slice(0, 10).map((e) => e.name),
    },
    null,
    2,
  ),
);

writeFileSync(
  join(ROOT, "scripts/data/remaining-keep.json"),
  JSON.stringify({ need: remaining.length, remaining }, null, 2) + "\n",
);
