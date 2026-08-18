import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Href } from "expo-router";
import {
  hasCompletedOnboardingPayload,
  onboardingParamsForNavigation,
  type OnboardingAuthParams,
} from "./onboarding-payload.service";

const DRAFT_KEY = "onboarding-draft-v1";

export type OnboardingDraft = Record<string, string>;

const RESUME_STEPS = [
  { field: "gender", path: "/(auth)/onboarding/gender" },
  { field: "goalId", path: "/(auth)/onboarding/goals" },
  { field: "goalDetail", path: "/(auth)/onboarding/goal-detail" },
  { field: "focusAreas", path: "/(auth)/onboarding/focus-areas" },
  { field: "age", path: "/(auth)/onboarding/age" },
  { field: "heightCm", path: "/(auth)/onboarding/height" },
  { field: "weightKg", path: "/(auth)/onboarding/weight" },
  { field: "bodyFatStep", path: "/(auth)/onboarding/body-fat" },
  { field: "targetWeightKg", path: "/(auth)/onboarding/target-weight" },
  { field: "pace", path: "/(auth)/onboarding/pace" },
  { field: "bodyIssues", path: "/(auth)/onboarding/body-issues" },
  { field: "injuries", path: "/(auth)/onboarding/injuries" },
  { field: "experience", path: "/(auth)/onboarding/experience" },
  { field: "equipment", path: "/(auth)/onboarding/equipment" },
  { field: "daysPerWeek", path: "/(auth)/onboarding/schedule" },
] as const;

function isDraft(value: unknown): value is OnboardingDraft {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every((v) => typeof v === "string");
}

export async function loadOnboardingDraft(): Promise<OnboardingDraft> {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return isDraft(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/** Merge incoming answers into the saved draft. Empty payloads are ignored so a blank screen cannot wipe progress. */
export async function saveOnboardingDraft(
  params: OnboardingAuthParams,
): Promise<void> {
  const incoming = onboardingParamsForNavigation(params);
  if (Object.keys(incoming).length === 0) return;
  const existing = await loadOnboardingDraft();
  const merged = { ...existing, ...incoming };
  await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(merged));
}

export async function clearOnboardingDraft(): Promise<void> {
  await AsyncStorage.removeItem(DRAFT_KEY);
}

export function resumeHrefFromDraft(draft: OnboardingDraft): Href {
  const params = onboardingParamsForNavigation(draft);

  if (hasCompletedOnboardingPayload(params)) {
    return { pathname: "/(auth)/paywall", params };
  }

  for (const step of RESUME_STEPS) {
    if (!params[step.field]) {
      return { pathname: step.path, params };
    }
  }

  return { pathname: "/(auth)/onboarding/ready", params };
}

export async function getOnboardingResumeHref(): Promise<Href> {
  const draft = await loadOnboardingDraft();
  return resumeHrefFromDraft(draft);
}

/** New quiz — wipe the local draft so reinstall / a second email starts clean. */
export async function startFreshOnboarding(): Promise<void> {
  await clearOnboardingDraft();
}
