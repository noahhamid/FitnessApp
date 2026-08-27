/**
 * Find near-identical workout images via difference-hash + Hamming distance.
 */
import sharp from "sharp";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "assets/images/workout");

const ts = readFileSync(
  join(ROOT, "src/features/workout/constants/exercise-images.ts"),
  "utf8",
);
const fileToExercises = new Map();
const re =
  /"([^"]+)": require\("\.\.\/\.\.\/\.\.\/\.\.\/assets\/images\/workout\/([^"]+)"\)/g;
let m;
while ((m = re.exec(ts))) {
  const key = m[1];
  const file = m[2];
  if (!fileToExercises.has(file)) fileToExercises.set(file, []);
  fileToExercises.get(file).push(key);
}

async function dhash(path) {
  // 9x8 grayscale → 64-bit difference hash
  const { data } = await sharp(path)
    .greyscale()
    .resize(9, 8, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let bits = 0n;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const left = data[y * 9 + x];
      const right = data[y * 9 + x + 1];
      if (left > right) bits |= 1n << BigInt(y * 8 + x);
    }
  }
  return bits;
}

function hamming(a, b) {
  let x = a ^ b;
  let c = 0;
  while (x) {
    c += Number(x & 1n);
    x >>= 1n;
  }
  return c;
}

const files = readdirSync(DIR)
  .filter((f) => /\.(jpe?g|png)$/i.test(f))
  .sort();

const hashes = [];
for (const f of files) {
  const h = await dhash(join(DIR, f));
  hashes.push({ file: f, hash: h, exercises: fileToExercises.get(f) || [] });
}

const pairs = [];
for (let i = 0; i < hashes.length; i++) {
  for (let j = i + 1; j < hashes.length; j++) {
    const d = hamming(hashes[i].hash, hashes[j].hash);
    if (d <= 12) {
      pairs.push({
        distance: d,
        a: hashes[i].file,
        aExercises: hashes[i].exercises,
        b: hashes[j].file,
        bExercises: hashes[j].exercises,
      });
    }
  }
}
pairs.sort((x, y) => x.distance - y.distance);

writeFileSync(
  join(ROOT, "scripts/data/visual-similarity.json"),
  JSON.stringify({ threshold: 12, pairCount: pairs.length, pairs }, null, 2) +
    "\n",
);

console.log(`Compared ${files.length} images → ${pairs.length} close pairs (d≤12)\n`);
for (const p of pairs.slice(0, 40)) {
  console.log(
    `d=${p.distance} | ${p.a} [${p.aExercises.join(", ") || "UNUSED"}]`,
  );
  console.log(
    `       vs ${p.b} [${p.bExercises.join(", ") || "UNUSED"}]\n`,
  );
}
