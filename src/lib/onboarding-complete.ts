/**
 * Single definition of "the quiz is done."
 * These eight fields are what onboarding collects before paywall, and what
 * the server needs to build nutrition targets and a workout plan.
 */
export type OnboardingProfileFields = {
  gender?: string | null;
  goalId?: string | null;
  weightKg?: unknown;
  heightCm?: unknown;
  age?: unknown;
  daysPerWeek?: unknown;
  experience?: string | null;
  equipment?: string | null;
};

export function isOnboardingProfileComplete(
  profile: OnboardingProfileFields | null | undefined,
): boolean {
  if (!profile) return false;
  return !!(
    profile.gender &&
    profile.goalId &&
    profile.weightKg != null &&
    profile.heightCm != null &&
    profile.age != null &&
    profile.daysPerWeek != null &&
    profile.experience &&
    profile.equipment
  );
}
