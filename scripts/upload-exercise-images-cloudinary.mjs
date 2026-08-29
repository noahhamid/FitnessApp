/**
 * Upload local exercise JPGs to Cloudinary.
 *
 * Required env (in .env.local):
 *   CLOUDINARY_CLOUD_NAME=...
 *   CLOUDINARY_API_KEY=...
 *   CLOUDINARY_API_SECRET=...
 * Optional:
 *   CLOUDINARY_FOLDER=potential-peak/exercises   (must match EXPO_PUBLIC_CLOUDINARY_FOLDER)
 *
 * Usage:
 *   npm run media:upload-exercises
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { v2 as cloudinary } from "cloudinary";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

loadEnv({ path: path.join(root, ".env.local") });
loadEnv({ path: path.join(root, ".env") });

/** Prefer CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name */
function credentialsFromUrl(raw) {
  const value = raw?.trim();
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "cloudinary:") return null;
    const cloud = parsed.hostname?.trim();
    const key = decodeURIComponent(parsed.username || "").trim();
    const secret = decodeURIComponent(parsed.password || "").trim();
    if (!cloud || !key || !secret) return null;
    if (key.includes("<") || secret.includes("<")) return null;
    return { cloudName: cloud, apiKey: key, apiSecret: secret };
  } catch {
    return null;
  }
}

const fromUrl = credentialsFromUrl(process.env.CLOUDINARY_URL);
const cloudName =
  fromUrl?.cloudName || process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = fromUrl?.apiKey || process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret =
  fromUrl?.apiSecret || process.env.CLOUDINARY_API_SECRET?.trim();
const folder = (
  process.env.CLOUDINARY_FOLDER ??
  process.env.EXPO_PUBLIC_CLOUDINARY_FOLDER ??
  "potential-peak/exercises"
)
  .trim()
  .replace(/^\/+|\/+$/g, "");

if (!cloudName || !apiKey || !apiSecret) {
  console.error(
    "Missing Cloudinary credentials. Add ONE of these to .env.local:\n\n" +
      "  CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME\n\n" +
      "or:\n\n" +
      "  CLOUDINARY_CLOUD_NAME=...\n" +
      "  CLOUDINARY_API_KEY=...\n" +
      "  CLOUDINARY_API_SECRET=...\n",
  );
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

const workoutDir = path.join(root, "assets", "images", "workout");

function collectUploads(dir, publicPrefix = "") {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      if (ent.name === "woman_workouts") {
        out.push(
          ...collectUploads(path.join(dir, ent.name), "woman/"),
        );
      }
      continue;
    }
    if (/\.(jpe?g|png|webp)$/i.test(ent.name)) {
      out.push({
        abs: path.join(dir, ent.name),
        file: publicPrefix ? `${publicPrefix}${ent.name}` : ent.name,
        publicId: `${publicPrefix}${path.parse(ent.name).name}`,
      });
    }
  }
  return out.sort((a, b) => a.file.localeCompare(b.file));
}

const files = collectUploads(workoutDir);

if (files.length === 0) {
  console.error(`No images found in ${workoutDir}`);
  process.exit(1);
}

console.log(
  `Uploading ${files.length} files → cloud=${cloudName} folder=${folder}`,
);

let ok = 0;
let fail = 0;

for (const item of files) {
  try {
    const result = await cloudinary.uploader.upload(item.abs, {
      folder,
      public_id: item.publicId,
      overwrite: true,
      resource_type: "image",
      invalidate: true,
    });
    ok += 1;
    console.log(`  ✓ ${item.file} → ${result.secure_url}`);
  } catch (err) {
    fail += 1;
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ ${item.file}: ${message}`);
  }
}

console.log(`\nDone. uploaded=${ok} failed=${fail}`);
if (fail > 0) process.exit(1);

console.log(
  `\nNext:\n` +
    `  1. Set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=${cloudName} in eas.json + .env.local\n` +
    `  2. Set EXPO_PUBLIC_CLOUDINARY_FOLDER=${folder} (optional if default)\n` +
    `  3. Rebuild the APK — workout JPGs are excluded from the asset bundle\n`,
);
