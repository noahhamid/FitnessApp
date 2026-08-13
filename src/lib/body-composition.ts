/**
 * Body-composition estimators — pure functions, no I/O, safe in RN + Node.
 *
 * Shared by the onboarding prediction engine (body-recomp-prediction.ts) and
 * the nutrition targets (nutrition-calc.ts) so a user's estimated lean mass is
 * the same number in both places.
 */

export type Gender = "male" | "female";

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/**
 * U.S. Navy body-fat estimate (%).
 * Male: waist + neck + height. Female: waist + hip + neck + height.
 * Returns null if required circumferences are missing.
 */
export function navyBodyFatPercent(input: {
  gender: Gender;
  heightCm: number;
  waistCm?: number;
  neckCm?: number;
  hipCm?: number;
}): number | null {
  const { gender, heightCm, waistCm, neckCm, hipCm } = input;
  if (!waistCm || !neckCm || heightCm <= 0) return null;

  if (gender === "male") {
    const diff = waistCm - neckCm;
    if (diff <= 0) return null;
    // log10 form of the DoD equation (cm).
    const bf =
      495 /
        (1.0324 -
          0.19077 * Math.log10(diff) +
          0.15456 * Math.log10(heightCm)) -
      450;
    return clamp(bf, 4, 55);
  }

  if (!hipCm) return null;
  const sum = waistCm + hipCm - neckCm;
  if (sum <= 0) return null;
  const bf =
    495 /
      (1.29579 -
        0.35004 * Math.log10(sum) +
        0.221 * Math.log10(heightCm)) -
    450;
  return clamp(bf, 8, 55);
}

/**
 * Deurenberg-style BF% estimate from BMI, age, and sex when no tape measure.
 */
export function estimateBodyFatPercent(input: {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
}): number {
  const heightM = input.heightCm / 100;
  const bmi = input.weightKg / (heightM * heightM);
  const sex = input.gender === "male" ? 1 : 0;
  // Deurenberg et al. (1991)
  const bf = 1.2 * bmi + 0.23 * input.age - 10.8 * sex - 5.4;
  const lo = input.gender === "male" ? 5 : 12;
  return clamp(bf, lo, 55);
}

export type BodyFatInput = {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  /** Measured BF% wins when supplied. */
  bodyFatPercent?: number;
  /** U.S. Navy circumference inputs (cm) — used when no measured BF%. */
  waistCm?: number;
  neckCm?: number;
  hipCm?: number;
};

/** Best available BF%: measured → Navy circumferences → BMI estimate. */
export function resolveBodyFatPercent(input: BodyFatInput): number {
  if (
    input.bodyFatPercent != null &&
    Number.isFinite(input.bodyFatPercent) &&
    input.bodyFatPercent > 0
  ) {
    return clamp(input.bodyFatPercent, 4, 55);
  }

  const navy = navyBodyFatPercent({
    gender: input.gender,
    heightCm: input.heightCm,
    waistCm: input.waistCm,
    neckCm: input.neckCm,
    hipCm: input.hipCm,
  });
  if (navy != null) return navy;

  return estimateBodyFatPercent({
    gender: input.gender,
    age: input.age,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
  });
}

/** Estimated lean body mass (kg) from the best available BF%. */
export function estimateLeanMassKg(input: BodyFatInput): number {
  const bf = resolveBodyFatPercent(input);
  return input.weightKg * (1 - bf / 100);
}
