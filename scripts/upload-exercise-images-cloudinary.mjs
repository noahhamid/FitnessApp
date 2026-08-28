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

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
const folder = (
  process.env.CLOUDINARY_FOLDER ??
  process.env.EXPO_PUBLIC_CLOUDINARY_FOLDER ??
  "potential-peak/exercises"
)
  .trim()
  .replace(/^\/+|\/+$/g, "");

if (!cloudName || !apiKey || !apiSecret) {
  console.error(
    "Missing Cloudinary credentials. Add to .env.local:\n" +
      "  CLOUDINARY_CLOUD_NAME=\n" +
      "  CLOUDINARY_API_KEY=\n" +
      "  CLOUDINARY_API_SECRET=\n",
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
const files = fs
  .readdirSync(workoutDir)
  .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  .sort();

if (files.length === 0) {
  console.error(`No images found in ${workoutDir}`);
  process.exit(1);
}

console.log(
  `Uploading ${files.length} files → cloud=${cloudName} folder=${folder}`,
);

let ok = 0;
let fail = 0;

for (const file of files) {
  const abs = path.join(workoutDir, file);
  const publicId = path.parse(file).name; // keep spaces; delivery encodes them
  try {
    const result = await cloudinary.uploader.upload(abs, {
      folder,
      public_id: publicId,
      overwrite: true,
      resource_type: "image",
      invalidate: true,
    });
    ok += 1;
    console.log(`  ✓ ${file} → ${result.secure_url}`);
  } catch (err) {
    fail += 1;
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ ${file}: ${message}`);
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
