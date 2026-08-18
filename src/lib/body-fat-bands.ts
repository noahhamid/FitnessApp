export type BodyFatGender = "male" | "female";

export type BodyFatBandId =
  | "lean"
  | "athletic"
  | "average"
  | "soft"
  | "higher";

export type BodyFatBand = {
  id: BodyFatBandId;
  label: string;
  min: number;
  max: number;
  midpoint: number;
};

export const BODY_FAT_MIN = 5;
export const BODY_FAT_MAX = 50;

export const BODY_FAT_BANDS: Record<BodyFatGender, BodyFatBand[]> = {
  male: [
    { id: "lean", label: "Lean", min: 8, max: 14, midpoint: 11 },
    { id: "athletic", label: "Athletic", min: 15, max: 19, midpoint: 17 },
    { id: "average", label: "Average", min: 20, max: 24, midpoint: 22 },
    { id: "soft", label: "Soft", min: 25, max: 29, midpoint: 27 },
    { id: "higher", label: "Higher", min: 30, max: 40, midpoint: 35 },
  ],
  female: [
    { id: "lean", label: "Lean", min: 16, max: 20, midpoint: 18 },
    { id: "athletic", label: "Athletic", min: 21, max: 25, midpoint: 23 },
    { id: "average", label: "Average", min: 26, max: 31, midpoint: 28.5 },
    { id: "soft", label: "Soft", min: 32, max: 37, midpoint: 34.5 },
    { id: "higher", label: "Higher", min: 38, max: 45, midpoint: 41.5 },
  ],
};

export function formatBodyFatPercent(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1);
}

export function clampBodyFatPercent(n: number): number {
  return Math.min(
    BODY_FAT_MAX,
    Math.max(BODY_FAT_MIN, Math.round(n * 10) / 10),
  );
}

export function bandContaining(
  gender: BodyFatGender,
  percent: number,
): BodyFatBand {
  const bands = BODY_FAT_BANDS[gender];
  const hit = bands.find((b) => percent >= b.min && percent <= b.max);
  if (hit) return hit;
  return bands.reduce((best, b) =>
    Math.abs(b.midpoint - percent) < Math.abs(best.midpoint - percent)
      ? b
      : best,
  );
}

export function bandIndex(gender: BodyFatGender, band: BodyFatBand): number {
  return BODY_FAT_BANDS[gender].findIndex((b) => b.id === band.id);
}

export function formatBandRange(band: BodyFatBand): string {
  return `${band.min}–${band.max}%`;
}

/** Keep one integer part (up to 2 digits) and at most one decimal. */
export function sanitizeBodyFatDraft(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const dot = cleaned.indexOf(".");
  if (dot === -1) return cleaned.slice(0, 2);
  const whole = cleaned.slice(0, dot).slice(0, 2);
  const dec = cleaned.slice(dot + 1).replace(/\./g, "").slice(0, 1);
  return `${whole}.${dec}`;
}
