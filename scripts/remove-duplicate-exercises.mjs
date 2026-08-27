import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(ROOT, "prisma/data/curated-exercises.json");

/** Visual duplicates / exercises user skipped generating. */
const CUT = new Set([
  "Rear Decline Bridge",
  "Barbell Seated Good Morning",
  "Barbell Stiff Leg Good Morning",
  "Standing Calves",
  "Biceps Narrow Pull-ups",
  "Biceps Pull-up",
  "Bench Hip Extension",
  "Glute Bridge March",
]);

const curated = JSON.parse(readFileSync(path, "utf8"));
const before = curated.length;
const kept = curated.filter((e) => !CUT.has(e.name));
const removed = curated.filter((e) => CUT.has(e.name)).map((e) => e.name);

writeFileSync(path, JSON.stringify(kept, null, 2) + "\n");
console.log(JSON.stringify({ before, after: kept.length, removed }, null, 2));
