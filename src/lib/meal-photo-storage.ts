import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { publicApiBase } from "./public-api-url";

/**
 * Persist a meal-scan photo and return a publicly fetchable HTTPS URL.
 *
 * Production (Vercel): uploads to Vercel Blob (`BLOB_READ_WRITE_TOKEN`).
 * Local/dev without a blob token: writes under ./uploads/meals (served by
 * Hono serveStatic when not on Vercel).
 */
export async function storeMealPhoto(input: {
  userId: string;
  base64: string;
  mimeType: string;
}): Promise<string> {
  const mime = input.mimeType.toLowerCase();
  const ext =
    mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
  const filename = `${input.userId.slice(0, 8)}-${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const bytes = Buffer.from(input.base64, "base64");
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  const onVercel = Boolean(process.env.VERCEL);

  if (blobToken) {
    const blob = await put(`meals/${filename}`, bytes, {
      access: "public",
      contentType: mime.startsWith("image/") ? mime : `image/${ext}`,
      token: blobToken,
    });
    return blob.url;
  }

  if (onVercel) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set — meal photos cannot be stored on Vercel without Blob.",
    );
  }

  const dir = path.join(process.cwd(), "uploads", "meals");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return `${publicApiBase()}/uploads/meals/${filename}`;
}
