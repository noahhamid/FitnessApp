import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchUserProfile,
  saveUserProfile,
  type Gender,
  type ExperienceLevel,
  type EquipmentAccess,
} from "@/src/features/profile/services/profile.service";
import { getSession } from "./auth.service";

const PROFILE_PREFIX = "user-profile-metrics";

// All optional: ProfileMetricsForm and TrainingSetupForm each send a
// different subset of these across the onboarding flow, so no single
// call is required to supply everything.
export type ProfileMetrics = {
  weight_kg?: number;
  height_cm?: number;
  age?: number;
  weight_unit?: "kg" | "lbs";
  goalId?: string;
  gender?: Gender;
  daysPerWeek?: number;
  experience?: ExperienceLevel;
  equipment?: EquipmentAccess;
};

function profileKey(userId: string) {
  return `${PROFILE_PREFIX}:${userId}`;
}

export async function upsertProfile(metrics: ProfileMetrics): Promise<void> {
  const session = await getSession();
  if (!session?.user) return;

  try {
    await saveUserProfile({
      ...(metrics.goalId !== undefined && { goalId: metrics.goalId }),
      ...(metrics.gender !== undefined && { gender: metrics.gender }),
      ...(metrics.weight_kg !== undefined && { weightKg: metrics.weight_kg }),
      ...(metrics.height_cm !== undefined && { heightCm: metrics.height_cm }),
      ...(metrics.age !== undefined && { age: metrics.age }),
      ...(metrics.daysPerWeek !== undefined && {
        daysPerWeek: metrics.daysPerWeek,
      }),
      ...(metrics.experience !== undefined && {
        experience: metrics.experience,
      }),
      ...(metrics.equipment !== undefined && {
        equipment: metrics.equipment,
      }),
    });
  } catch (e) {
    // TEMP: was silently swallowed before — logging so real failures
    // are visible instead of masquerading as "offline". Once this is
    // confirmed stable, this can go back to being fully silent if
    // offline-first behavior is actually wanted.
    console.log("saveUserProfile FAILED:", e);
  }

  // Merge into existing cache rather than overwrite, since partial saves
  // (e.g. training-setup screen only sending days/experience/equipment)
  // would otherwise wipe out weight/height/age cached from the previous screen.
  const existingRaw = await AsyncStorage.getItem(profileKey(session.user.id));
  const existing: ProfileMetrics = existingRaw ? JSON.parse(existingRaw) : {};
  const merged: ProfileMetrics = { ...existing, ...metrics };

  await AsyncStorage.setItem(profileKey(session.user.id), JSON.stringify(merged));
}

export async function fetchProfile(): Promise<ProfileMetrics | null> {
  const session = await getSession();
  if (!session?.user) return null;

  try {
    const remote = await fetchUserProfile();
    if (remote) {
      const hydrated: ProfileMetrics = {
        weight_kg: remote.weightKg ?? undefined,
        height_cm: remote.heightCm ?? undefined,
        age: remote.age ?? undefined,
        weight_unit: "kg",
        goalId: remote.goalId ?? undefined,
        gender: remote.gender ?? undefined,
        daysPerWeek: remote.daysPerWeek ?? undefined,
        experience: remote.experience ?? undefined,
        equipment: remote.equipment ?? undefined,
      };
      await AsyncStorage.setItem(
        profileKey(session.user.id),
        JSON.stringify(hydrated),
      );
      return hydrated;
    }
  } catch {
    // Fallback to local cache below.
  }

  const raw = await AsyncStorage.getItem(profileKey(session.user.id));
  if (!raw) return null;

  return JSON.parse(raw) as ProfileMetrics;
}