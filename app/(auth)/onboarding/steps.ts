// Only screens that collect a real answer get a step number in the header.
// Transitions, computed predictions, the plan reveal, and the paywall are
// presentation-only and intentionally excluded from this count.
export const ONBOARDING_STEPS = [
  "gender",
  "goals",
  "goal-detail",
  "focus-areas",
  "age",
  "height",
  "weight",
  "body-fat",
  "target-weight",
  "pace",
  "body-issues",
  "injuries",
  "experience",
  "equipment",
  "schedule",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export function onboardingStepIndex(step: OnboardingStep): number {
  return ONBOARDING_STEPS.indexOf(step);
}

export function onboardingStepLabel(step: OnboardingStep): string {
  const index = onboardingStepIndex(step);
  return `STEP ${index + 1} OF ${ONBOARDING_STEPS.length}`;
}
