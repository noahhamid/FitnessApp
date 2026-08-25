import type {
  EquipmentAccess,
  ExperienceLevel,
  Gender,
  Pace,
} from "@/src/features/profile/services/profile.service";
import { saveUserProfile } from "@/src/features/profile/services/profile.service";
import { getSession } from "./auth.service";

export type OnboardingAuthParams = {
  email?: string | string[];
  onboardingComplete?: string | string[];
  goalId?: string | string[];
  goalDetail?: string | string[];
  focusAreas?: string | string[];
  gender?: string | string[];
  age?: string | string[];
  heightCm?: string | string[];
  weightKg?: string | string[];
  /** "1" after the body-fat step is completed or skipped. */
  bodyFatStep?: string | string[];
  bodyFatPercent?: string | string[];
  bodyFatSource?: string | string[];
  targetWeightKg?: string | string[];
  pace?: string | string[];
  bodyIssues?: string | string[];
  injuries?: string | string[];
  daysPerWeek?: string | string[];
  /** Comma-separated Monday-indexed weekdays, e.g. "0,2,4". */
  trainingDays?: string | string[];
  experience?: string | string[];
  equipment?: string | string[];
  reminderEnabled?: string | string[];
  reminderHour?: string | string[];
  /** "1" if user accepted the paywall discount offer. */
  offerAccepted?: string | string[];
};

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function numberParam(value: string | string[] | undefined): number | undefined {
  const parsed = Number(single(value));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function numberListParam(
  value: string | string[] | undefined,
): number[] | undefined {
  const list = listParam(value);
  if (!list) return undefined;
  const numbers = list.map(Number).filter((n) => Number.isInteger(n));
  return numbers.length > 0 ? numbers : undefined;
}

function listParam(value: string | string[] | undefined): string[] | undefined {
  const raw = single(value);
  if (!raw) return undefined;
  const list = raw.split(",").filter(Boolean);
  return list.length > 0 ? list : undefined;
}

export function hasCompletedOnboardingPayload(
  params: OnboardingAuthParams,
): boolean {
  return single(params.onboardingComplete) === "1";
}

export function onboardingParamsForNavigation(params: OnboardingAuthParams) {
  return {
    ...(hasCompletedOnboardingPayload(params)
      ? { onboardingComplete: "1" }
      : {}),
    ...(single(params.goalId) ? { goalId: single(params.goalId)! } : {}),
    ...(single(params.goalDetail)
      ? { goalDetail: single(params.goalDetail)! }
      : {}),
    ...(single(params.focusAreas)
      ? { focusAreas: single(params.focusAreas)! }
      : {}),
    ...(single(params.gender) ? { gender: single(params.gender)! } : {}),
    ...(single(params.age) ? { age: single(params.age)! } : {}),
    ...(single(params.heightCm) ? { heightCm: single(params.heightCm)! } : {}),
    ...(single(params.weightKg) ? { weightKg: single(params.weightKg)! } : {}),
    ...(single(params.bodyFatStep) ? { bodyFatStep: "1" } : {}),
    ...(single(params.bodyFatPercent)
      ? {
          bodyFatPercent: single(params.bodyFatPercent)!,
          bodyFatSource: single(params.bodyFatSource) ?? "range",
        }
      : single(params.bodyFatStep)
        ? { bodyFatPercent: "", bodyFatSource: "" }
        : {}),
    ...(single(params.targetWeightKg)
      ? { targetWeightKg: single(params.targetWeightKg)! }
      : {}),
    ...(single(params.pace) ? { pace: single(params.pace)! } : {}),
    ...(single(params.bodyIssues)
      ? { bodyIssues: single(params.bodyIssues)! }
      : {}),
    ...(single(params.injuries) ? { injuries: single(params.injuries)! } : {}),
    ...(single(params.daysPerWeek)
      ? { daysPerWeek: single(params.daysPerWeek)! }
      : {}),
    ...(single(params.trainingDays)
      ? { trainingDays: single(params.trainingDays)! }
      : {}),
    ...(single(params.experience)
      ? { experience: single(params.experience)! }
      : {}),
    ...(single(params.equipment)
      ? { equipment: single(params.equipment)! }
      : {}),
    ...(single(params.reminderEnabled)
      ? { reminderEnabled: single(params.reminderEnabled)! }
      : {}),
    ...(single(params.reminderHour)
      ? { reminderHour: single(params.reminderHour)! }
      : {}),
    ...(single(params.offerAccepted)
      ? { offerAccepted: single(params.offerAccepted)! }
      : {}),
  };
}

async function waitForSession(): Promise<boolean> {
  const { readSessionToken } = await import("@/src/lib/session-token");
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const session = await getSession();
    if (session?.user) return true;
    // Web cross-origin: Bearer token is enough for our API even when
    // authClient.getSession() still has no cookie jar entry.
    if (await readSessionToken()) return true;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return false;
}

/**
 * Persist the values collected before authentication. Backend profile routes
 * require a session, so this must run only after sign-up/sign-in succeeds.
 * Returns false when no session/token is available yet (e.g. email verify pending).
 */
export async function saveCompletedOnboardingPayload(
  params: OnboardingAuthParams,
): Promise<boolean> {
  if (!hasCompletedOnboardingPayload(params)) return false;

  const ready = await waitForSession();
  if (!ready) return false;
  const gender = single(params.gender);
  const experience = single(params.experience);
  const equipment = single(params.equipment);
  const pace = single(params.pace);
  const reminderEnabled = single(params.reminderEnabled);
  const bodyIssues = (listParam(params.bodyIssues) ?? []).filter((i) => i !== "none");
  const injuries = (listParam(params.injuries) ?? []).filter((i) => i !== "none");
  const bodyFatPercent = numberParam(params.bodyFatPercent);
  const hasBodyFat =
    bodyFatPercent != null && bodyFatPercent > 0 && single(params.bodyFatPercent) !== "";
  const rawSource = single(params.bodyFatSource);
  const bodyFatSource =
    rawSource === "measured" || rawSource === "range" ? rawSource : undefined;

  await saveUserProfile({
    goalId: single(params.goalId),
    goalDetail: single(params.goalDetail),
    gender:
      gender === "male" || gender === "female"
        ? (gender as Gender)
        : undefined,
    age: numberParam(params.age),
    heightCm: numberParam(params.heightCm),
    weightKg: numberParam(params.weightKg),
    targetWeightKg: numberParam(params.targetWeightKg),
    pace:
      pace === "slow" || pace === "moderate" || pace === "aggressive"
        ? (pace as Pace)
        : undefined,
    daysPerWeek: numberParam(params.daysPerWeek),
    trainingDays: numberListParam(params.trainingDays),
    experience: experience as ExperienceLevel | undefined,
    equipment: equipment as EquipmentAccess | undefined,
    focusAreas: listParam(params.focusAreas),
    bodyIssues,
    injuries,
    reminderEnabled: reminderEnabled != null ? reminderEnabled === "1" : undefined,
    reminderHour: numberParam(params.reminderHour),
    bodyFatPercent: hasBodyFat ? bodyFatPercent : null,
    bodyFatSource: hasBodyFat ? (bodyFatSource ?? "range") : null,
  });
  return true;
}
