/**
 * Generate one exercise illustration via Gemini and save it locally.
 * Bypasses AI Studio's missing download button.
 *
 * Usage:
 *   node scripts/generate-exercise-image.mjs "Chest Dip" ./prompts/chest-dip.txt
 *   node scripts/generate-exercise-image.mjs "Chest Dip" --prompt "your full prompt here"
 *
 * Requires GEMINI_API_KEY in .env.local (same key as AI Studio).
 * Output: assets/images/workout/raw/<slug>.png
 */

import { GoogleGenAI } from "@google/genai";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "assets", "images", "workout", "raw");

dotenv.config({ path: join(ROOT, ".env.local") });
dotenv.config({ path: join(ROOT, ".env") });

const MODEL = "gemini-2.5-flash-image";

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function readPromptFromArgs(args) {
  const promptFlag = args.indexOf("--prompt");
  if (promptFlag !== -1) {
    return args.slice(promptFlag + 1).join(" ").trim();
  }

  const promptFile = args[1];
  if (!promptFile) {
    throw new Error("Provide a prompt file path or --prompt \"...\"");
  }
  return readFileSync(promptFile, "utf8").trim();
}

async function main() {
  const [exerciseName, ...rest] = process.argv.slice(2);
  if (!exerciseName) {
    console.error(
      'Usage: node scripts/generate-exercise-image.mjs "Exercise Name" <prompt.txt>',
    );
    console.error(
      '   or: node scripts/generate-exercise-image.mjs "Exercise Name" --prompt "..."',
    );
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY in .env.local");
    process.exit(1);
  }

  const prompt = readPromptFromArgs([exerciseName, ...rest]);
  const slug = slugify(exerciseName);
  const outPath = join(OUT_DIR, `${slug}.png`);

  mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Generating: ${exerciseName}`);
  console.log(`Model: ${MODEL}`);
  console.log(`Output: ${outPath}`);

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  let saved = false;

  for (const part of parts) {
    if (part.inlineData?.data) {
      writeFileSync(outPath, Buffer.from(part.inlineData.data, "base64"));
      console.log(`Saved ${outPath}`);
      saved = true;
      break;
    }
  }

  if (!saved) {
    console.error("No image returned. Response may be text-only — try rephrasing the prompt.");
    const text = parts.find((p) => p.text)?.text;
    if (text) console.error("\nModel text response:\n", text.slice(0, 500));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
