/**
 * Upper bound on an inbound base64 image payload.
 *
 * Both upload paths resize to 1024px first, which lands well under 400 KB of
 * base64. base64 spends 4 characters per 3 bytes, so 2M characters is roughly
 * 1.5 MB of image — several times the headroom a real photo needs, while still
 * refusing the arbitrarily large bodies a modified client could push into
 * Gemini or Blob storage. Vercel rejects bodies over ~4.5 MB before this runs,
 * so treat this as the app-level guard rather than the only one.
 */
export const MAX_IMAGE_BASE64_CHARS = 2_000_000;

export const IMAGE_TOO_LARGE_MESSAGE =
  "That photo is too large. Try taking it again.";
