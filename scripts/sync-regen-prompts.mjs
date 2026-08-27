import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const md = readFileSync(join(ROOT, "scripts/data/regen-prompts.md"), "utf8").replace(
  /\r\n/g,
  "\n",
);
const blocks = [...md.matchAll(/## \d+\. ([^\n]+)\n\n```\n([\s\S]*?)```/g)];
if (!blocks.length) {
  console.error("No prompt blocks matched");
  process.exit(1);
}
const items = blocks.map((m, i) => ({
  id: 98 + i,
  name: m[1].trim(),
  slug: m[1]
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, ""),
  prompt: m[2].trim(),
}));
writeFileSync(
  join(ROOT, "scripts/data/exercise-image-prompts.json"),
  JSON.stringify(items, null, 2) + "\n",
);
console.log(items.map((x) => `${x.id}: ${x.name}`).join("\n"));
