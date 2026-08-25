/**
 * Bulk background removal for generated exercise images.
 *
 * Removes the known flat background (#0E0E10) using edge-seeded flood fill
 * (so dark foreground elements aren't mistaken for background), with
 * tolerance-based feathering at character edges.
 *
 * Usage:
 *   node scripts/remove-bg.mjs <inputDir> <outputDir>
 *
 * Example:
 *   node scripts/remove-bg.mjs ./assets/images/workout ./assets/images/workout-transparent
 */

import { readdir, mkdir, stat } from "fs/promises";
import { join, parse } from "path";
import sharp from "sharp";

/** Target background — matches app darkBg in src/theme.ts */
const BG = { r: 0x0e, g: 0x0e, b: 0x10 };

/** Max color distance for flood-fill background connectivity. */
const FLOOD_TOLERANCE = 16;

/** Max color distance for edge-feather partial transparency. */
const FEATHER_MAX = 32;

/** Edge-only alpha blur (px sigma). 0 = off. Avoid global blur — it bleeds into small subjects. */
const EDGE_BLUR_SIGMA = 0.6;

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

function colorDistance(r, g, b) {
  const dr = r - BG.r;
  const dg = g - BG.g;
  const db = b - BG.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function isBgColor(r, g, b, tolerance = FLOOD_TOLERANCE) {
  return colorDistance(r, g, b) <= tolerance;
}

/** Smoothstep alpha for edge pixels that blend into the background. */
function featherAlpha(dist) {
  if (dist <= FLOOD_TOLERANCE) return 0;
  if (dist >= FEATHER_MAX) return 255;
  const t = (dist - FLOOD_TOLERANCE) / (FEATHER_MAX - FLOOD_TOLERANCE);
  const smooth = t * t * (3 - 2 * t);
  return Math.round(smooth * 255);
}

/**
 * Flood-fill background from image borders. Only pixels connected to the
 * border AND matching the bg color are marked — interior dark objects survive.
 */
function floodFillBackground(data, width, height) {
  const total = width * height;
  const bg = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  function seed(x, y) {
    const p = y * width + x;
    if (bg[p]) return;
    const i = p * 4;
    if (isBgColor(data[i], data[i + 1], data[i + 2])) {
      bg[p] = 1;
      queue[tail++] = p;
    }
  }

  for (let x = 0; x < width; x++) {
    seed(x, 0);
    seed(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    seed(0, y);
    seed(width - 1, y);
  }

  while (head < tail) {
    const p = queue[head++];
    const x = p % width;
    const y = (p / width) | 0;

    if (x > 0) tryNeighbor(p - 1);
    if (x < width - 1) tryNeighbor(p + 1);
    if (y > 0) tryNeighbor(p - width);
    if (y < height - 1) tryNeighbor(p + width);
  }

  function tryNeighbor(np) {
    if (bg[np]) return;
    const i = np * 4;
    if (isBgColor(data[i], data[i + 1], data[i + 2])) {
      bg[np] = 1;
      queue[tail++] = np;
    }
  }

  return bg;
}

function touchesBackground(bg, width, height, p) {
  const x = p % width;
  const y = (p / width) | 0;
  if (x > 0 && bg[p - 1]) return true;
  if (x < width - 1 && bg[p + 1]) return true;
  if (y > 0 && bg[p - width]) return true;
  if (y < height - 1 && bg[p + width]) return true;
  return false;
}

function buildAlphaMask(data, width, height) {
  const total = width * height;
  const bg = floodFillBackground(data, width, height);
  const alpha = new Uint8Array(total);

  for (let p = 0; p < total; p++) {
    const i = p * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const dist = colorDistance(r, g, b);

    if (bg[p]) {
      alpha[p] = 0;
    } else if (touchesBackground(bg, width, height, p) && dist <= FEATHER_MAX) {
      alpha[p] = featherAlpha(dist);
    } else {
      alpha[p] = 255;
    }
  }

  return alpha;
}

async function removeBackground(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const alpha = buildAlphaMask(data, width, height);

  // Blur only edge-transition pixels so interior foreground stays opaque.
  if (EDGE_BLUR_SIGMA > 0) {
    const edgeOnly = Buffer.from(alpha);
    for (let p = 0; p < alpha.length; p++) {
      if (alpha[p] === 0 || alpha[p] === 255) edgeOnly[p] = 128;
    }
    const blurredEdge = await sharp(edgeOnly, {
      raw: { width, height, channels: 1 },
    })
      .blur(EDGE_BLUR_SIGMA)
      .raw()
      .toBuffer();
    for (let p = 0; p < alpha.length; p++) {
      if (alpha[p] > 0 && alpha[p] < 255) {
        alpha[p] = blurredEdge[p];
      }
    }
  }

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    data[i + 3] = alpha[p];
  }

  await sharp(data, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toFile(outputPath);
}

async function collectImages(dir) {
  const entries = await readdir(dir);
  return entries.filter((name) => IMAGE_EXT.test(name)).sort();
}

async function main() {
  const [inputDir, outputDir] = process.argv.slice(2);

  if (!inputDir || !outputDir) {
    console.error("Usage: node scripts/remove-bg.mjs <inputDir> <outputDir>");
    process.exit(1);
  }

  const inputStat = await stat(inputDir).catch(() => null);
  if (!inputStat?.isDirectory()) {
    console.error(`Input path is not a directory: ${inputDir}`);
    process.exit(1);
  }

  await mkdir(outputDir, { recursive: true });

  const files = await collectImages(inputDir);
  if (files.length === 0) {
    console.log(`No images found in ${inputDir}`);
    return;
  }

  console.log(
    `Processing ${files.length} image(s) from ${inputDir} → ${outputDir}`,
  );
  console.log(
    `Background #0E0E10 | flood=${FLOOD_TOLERANCE} feather=${FEATHER_MAX} edgeBlur=${EDGE_BLUR_SIGMA}`,
  );

  let ok = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const { name } = parse(file);
    const inputPath = join(inputDir, file);
    const outputPath = join(outputDir, `${name}.png`);

    process.stdout.write(`[${i + 1}/${files.length}] ${file} … `);

    try {
      await removeBackground(inputPath, outputPath);
      console.log(`→ ${name}.png`);
      ok++;
    } catch (err) {
      console.log("FAILED");
      console.error(`  ${err instanceof Error ? err.message : err}`);
      failed++;
    }
  }

  console.log(`Done. ${ok} succeeded, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
