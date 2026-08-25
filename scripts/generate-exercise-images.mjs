/**
 * Batch-generate exercise illustrations from scripts/data/exercise-image-prompts.json
 *
 * Usage:
 *   node scripts/generate-exercise-images.mjs              # all entries in JSON
 *   node scripts/generate-exercise-images.mjs --from 1 --to 5
 *   node scripts/generate-exercise-images.mjs --concurrency 3
 *   node scripts/generate-exercise-images.mjs --force      # overwrite existing
 *
 * Output: assets/images/workout/raw/<slug>.png
 */

import { GoogleGenAI } from "@google/genai";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PROMPTS_FILE = join(__dirname, "data", "exercise-image-prompts.json");
const OUT_DIR = join(ROOT, "assets", "images", "workout", "raw");
const MODEL = "gemini-2.5-flash-image";

dotenv.config({ path: join(ROOT, ".env.local") });
dotenv.config({ path: join(ROOT, ".env") });

function parseArgs(argv) {
  const opts = { from: null, to: null, concurrency: 1, force: false, delayMs: 15000 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--from") opts.from = Number(argv[++i]);
    else if (argv[i] === "--to") opts.to = Number(argv[++i]);
    else if (argv[i] === "--concurrency") opts.concurrency = Number(argv[++i]);
    else if (argv[i] === "--delay") opts.delayMs = Number(argv[++i]);
    else if (argv[i] === "--force") opts.force = true;
  }
  return opts;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateOne(ai, entry, outPath, retries = 4) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: entry.prompt,
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          writeFileSync(outPath, Buffer.from(part.inlineData.data, "base64"));
          return { ok: true };
        }
      }

      const text = parts.find((p) => p.text)?.text?.slice(0, 200);
      return { ok: false, error: text ? `Text-only: ${text}` : "No image in response" };
    } catch (err) {
      const msg = err.message ?? String(err);
      const is429 = msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");
      if (is429 && attempt < retries) {
        const waitSec = 15 * (attempt + 1);
        console.log(`\n  rate limited — retry ${attempt + 1}/${retries} in ${waitSec}s…`);
        await sleep(waitSec * 1000);
        continue;
      }
      throw err;
    }
  }
  return { ok: false, error: "Max retries exceeded" };
}

async function runPool(items, concurrency, worker) {
  const results = [];
  let index = 0;

  async function next() {
    while (index < items.length) {
      const i = index++;
      results[i] = await worker(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, next));
  return results;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY in .env.local");
    process.exit(1);
  }

  const all = JSON.parse(readFileSync(PROMPTS_FILE, "utf8"));
  let batch = all;
  if (opts.from != null || opts.to != null) {
    batch = all.filter((e) => {
      if (opts.from != null && e.id < opts.from) return false;
      if (opts.to != null && e.id > opts.to) return false;
      return true;
    });
  }

  if (batch.length === 0) {
    console.log("No prompts matched the filter.");
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });

  const pending = batch.filter((entry) => {
    const outPath = join(OUT_DIR, `${entry.slug}.png`);
    if (!opts.force && existsSync(outPath)) {
      console.log(`[skip] ${entry.name} — already exists`);
      return false;
    }
    return true;
  });

  console.log(
    `Batch: ${pending.length} to generate (${batch.length} total, concurrency ${opts.concurrency})`,
  );
  console.log(`Output: ${OUT_DIR}\n`);

  if (pending.length === 0) return;

  const ai = new GoogleGenAI({ apiKey });
  let ok = 0;
  let failed = 0;

  await runPool(pending, opts.concurrency, async (entry, i) => {
    const outPath = join(OUT_DIR, `${entry.slug}.png`);
    const label = `[${i + 1}/${pending.length}] ${entry.name}`;

    if (i > 0 && opts.delayMs > 0) await sleep(opts.delayMs);

    process.stdout.write(`${label} … `);
    try {
      const result = await generateOne(ai, entry, outPath);
      if (result.ok) {
        console.log(`saved → ${entry.slug}.png`);
        ok++;
      } else {
        console.log(`FAILED (${result.error})`);
        failed++;
      }
    } catch (err) {
      console.log(`FAILED (${err.message ?? err})`);
      failed++;
    }
  });

  console.log(`\nDone. ${ok} saved, ${failed} failed, ${batch.length - pending.length} skipped.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
