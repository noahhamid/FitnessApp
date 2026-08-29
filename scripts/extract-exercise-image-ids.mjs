import fs from "node:fs";
import path from "node:path";

const srcPath = path.join(
  "src",
  "features",
  "workout",
  "constants",
  "exercise-images.ts",
);
const src = fs.readFileSync(srcPath, "utf8");
const byName = {};
let placeholder = "";

const ph = src.match(
  /PLACEHOLDER = require\("(?:\.\.\/)*assets\/images\/workout\/([^"]+)\.jpg"\)/,
);
if (ph) placeholder = ph[1];

for (const m of src.matchAll(
  /"([^"]+)": require\("(?:\.\.\/)*assets\/images\/workout\/([^"]+)\.jpg"\)/g,
)) {
  byName[m[1]] = m[2];
}

const outDir = path.join("src", "features", "workout", "constants");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "exercise-image-ids.json");
fs.writeFileSync(
  outPath,
  JSON.stringify({ placeholder, byName }, null, 2) + "\n",
);
console.log(
  `Wrote ${Object.keys(byName).length} ids → ${outPath} (placeholder=${placeholder})`,
);
