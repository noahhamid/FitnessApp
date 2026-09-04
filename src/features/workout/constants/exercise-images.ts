import rawIds from "./exercise-image-ids.json";

export type ExerciseArtGender = "male" | "female" | null | undefined;

type ExerciseImageIds = {
  placeholder: string;
  byName: Record<string, string>;
  byNameFemale?: Record<string, string>;
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

const STOP = new Set([
  "with",
  "the",
  "and",
  "one",
  "arm",
  "leg",
  "on",
  "a",
  "of",
  "to",
  "for",
  "two",
]);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function family(s: string): string {
  const n = s.toLowerCase();
  if (/\bband\b|elastic|resistance/.test(n)) return "band";
  if (/barbell|\bbb\b|ez.?bar/.test(n)) return "barbell";
  if (/dumbbell|\bdb\b/.test(n)) return "dumbbell";
  if (/cable|machine|lat pull|smith/.test(n)) return "cable";
  if (/push-?up|pushup/.test(n)) return "pushup";
  if (/pull-?up|chin-?up/.test(n)) return "pullup";
  if (/plank|crunch|sit-?up|dead bug|bird dog/.test(n)) return "core";
  if (/squat|lunge|calf|bridge|hip|glute|deadlift|rdl|hinge/.test(n)) {
    return "lower";
  }
  if (/row|curl|press|raise|fly|extension|dip|shrug/.test(n)) return "upper";
  return "other";
}

function scoreMatch(name: string, key: string, publicId: string): number {
  const nt = tokens(name);
  const ct = new Set([...tokens(key), ...tokens(publicId)]);
  if (nt.length === 0) return 0;
  let hit = 0;
  for (const t of nt) {
    for (const c of ct) {
      if (c === t || c.includes(t) || t.includes(c)) {
        hit++;
        break;
      }
    }
  }
  let s = hit / nt.length;
  const nf = family(name);
  const cf = family(`${key} ${publicId}`);
  if (nf !== "other" && cf !== "other") {
    if (nf === cf) s += 0.4;
    else if (
      (nf === "barbell" && cf === "dumbbell") ||
      (nf === "dumbbell" && cf === "barbell") ||
      (nf === "cable" && cf === "pullup")
    ) {
      s += 0.1;
    } else {
      s -= 0.55;
    }
  }
  return s;
}

/** Closest mapped illustration — never cross equipment families into push-up. */
function fuzzyPublicId(name: string): string | null {
  let bestId: string | null = null;
  let best = 0;
  for (const [key, pid] of Object.entries(imageIds.byName)) {
    const sc = scoreMatch(name, key, pid);
    if (sc > best) {
      best = sc;
      bestId = pid;
    }
  }
  return best >= 0.45 ? bestId : null;
}

/** Family-safe default when nothing matches (avoid push-up for barbell names). */
function familyFallback(name: string): string {
  const f = family(name);
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      if (imageIds.byName[k]) return imageIds.byName[k];
    }
    return null;
  };
  switch (f) {
    case "barbell":
      return (
        pick("barbell bench press", "barbell deadlift", "barbell row") ??
        imageIds.placeholder
      );
    case "dumbbell":
      return (
        pick("dumbbell bench press", "dumbbell squat", "dumbbell curl") ??
        imageIds.placeholder
      );
    case "band":
      return pick("band hip lift", "band bicycle crunch") ?? imageIds.placeholder;
    case "cable":
      return (
        pick("cable lateral raise", "lat pulldown", "pull-up") ??
        imageIds.placeholder
      );
    case "pullup":
      return pick("pull-up", "chin-up") ?? imageIds.placeholder;
    case "pushup":
      return pick("push-up") ?? imageIds.placeholder;
    case "core":
      return (
        pick("front plank with twist", "push-up to side plank") ??
        imageIds.placeholder
      );
    case "lower":
      return (
        pick("glute bridge", "forward lunge", "jump squat") ??
        imageIds.placeholder
      );
    case "upper":
      return (
        pick("dumbbell bent over row", "dumbbell lateral raise") ??
        imageIds.placeholder
      );
    default:
      return imageIds.placeholder;
  }
}

function deliveryUrl(publicId: string): string {
  const encodedId = publicId
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  const path = FOLDER ? `${FOLDER}/${encodedId}` : encodedId;
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${TRANSFORMS}/${path}`;
}

function publicIdFor(
  name?: string | null,
  gender?: ExerciseArtGender,
): string {
  const key = name?.trim().toLowerCase() ?? "";
  if (gender === "female" && key && imageIds.byNameFemale?.[key]) {
    return imageIds.byNameFemale[key];
  }
  if (key && imageIds.byName[key]) return imageIds.byName[key];
  if (key) {
    const fuzzy = fuzzyPublicId(key);
    if (fuzzy) return fuzzy;
    return familyFallback(key);
  }
  return imageIds.placeholder;
}

/** Resolved HTTPS URI for an exercise illustration (or shared placeholder). */
export function imageForExercise(
  name?: string | null,
  gender?: ExerciseArtGender,
): string {
  if (!CLOUD) {
    if (__DEV__) {
      console.warn(
        "[exercise-images] EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME is unset — exercise art URLs will 404 until you set it and upload.",
      );
    }
    // Still return a well-formed URL so Image components don't crash;
    // without a cloud name this is intentionally invalid.
    return deliveryUrl(publicIdFor(name, gender)).replace(
      "res.cloudinary.com//",
      "res.cloudinary.com/missing-cloud/",
    );
  }
  return deliveryUrl(publicIdFor(name, gender));
}

/** Whether a dedicated illustration exists for this exercise name. */
export function hasExerciseImage(
  name?: string | null,
  gender?: ExerciseArtGender,
): boolean {
  const key = name?.trim().toLowerCase() ?? "";
  if (!key) return false;
  if (gender === "female" && imageIds.byNameFemale?.[key]) return true;
  return Boolean(imageIds.byName[key]);
}
