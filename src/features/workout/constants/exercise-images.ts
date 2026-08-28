import rawIds from "./exercise-image-ids.json";

type ExerciseImageIds = {
  placeholder: string;
  byName: Record<string, string>;
};

const imageIds = rawIds as ExerciseImageIds;

/**
 * Soft-3D exercise art is served from Cloudinary so the APK does not embed
 * ~34MB of JPGs. Set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME (and upload assets
 * with `npm run media:upload-exercises`).
 *
 * Delivery URL shape:
 *   https://res.cloudinary.com/{cloud}/image/upload/{transforms}/{folder}/{publicId}
 */
const CLOUD = (process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "").trim();
const FOLDER = (
  process.env.EXPO_PUBLIC_CLOUDINARY_FOLDER ?? "potential-peak/exercises"
)
  .trim()
  .replace(/^\/+|\/+$/g, "");

/** Cloudinary auto format/quality; cap width for list + hero cards. */
const TRANSFORMS = "f_auto,q_auto:good,c_limit,w_1200";

function deliveryUrl(publicId: string): string {
  const encodedId = publicId
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  const path = FOLDER ? `${FOLDER}/${encodedId}` : encodedId;
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${TRANSFORMS}/${path}`;
}

function publicIdFor(name?: string | null): string {
  const key = name?.trim().toLowerCase() ?? "";
  if (key && imageIds.byName[key]) return imageIds.byName[key];
  return imageIds.placeholder;
}

/** Resolved HTTPS URI for an exercise illustration (or shared placeholder). */
export function imageForExercise(name?: string | null): string {
  if (!CLOUD) {
    if (__DEV__) {
      console.warn(
        "[exercise-images] EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME is unset — exercise art URLs will 404 until you set it and upload.",
      );
    }
    // Still return a well-formed URL so Image components don't crash;
    // without a cloud name this is intentionally invalid.
    return deliveryUrl(publicIdFor(name)).replace(
      "res.cloudinary.com//",
      "res.cloudinary.com/missing-cloud/",
    );
  }
  return deliveryUrl(publicIdFor(name));
}

/** Whether a dedicated illustration exists for this exercise name. */
export function hasExerciseImage(name?: string | null): boolean {
  const key = name?.trim().toLowerCase() ?? "";
  return Boolean(key && imageIds.byName[key]);
}
