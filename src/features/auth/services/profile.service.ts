import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchUserProfile,
  saveUserProfile,
} from "@/src/features/profile/services/profile.service";
import { getSession } from "./auth.service";

const PROFILE_PREFIX = "user-profile-metrics";

export type ProfileMetrics = {
  weight_kg: number;
  height_cm: number;
  age: number;
  weight_unit: "kg" | "lbs";
};

function profileKey(userId: string) {
  return `${PROFILE_PREFIX}:${userId}`;
}

export async function upsertProfile(metrics: ProfileMetrics): Promise<void> {
  const session = await getSession();
  if (!session?.user) return;

  try {
    await saveUserProfile({
      weightKg: metrics.weight_kg,
      heightCm: metrics.height_cm,
      age: metrics.age,
    });
  } catch {
    // Non-blocking fallback for offline/local continuity.
  }

  await AsyncStorage.setItem(profileKey(session.user.id), JSON.stringify(metrics));
}

export async function fetchProfile(): Promise<ProfileMetrics | null> {
  const session = await getSession();
  if (!session?.user) return null;

  try {
    const remote = await fetchUserProfile();
    if (remote) {
      const hydrated: ProfileMetrics = {
        weight_kg: remote.weightKg ?? 0,
        height_cm: remote.heightCm ?? 0,
        age: remote.age ?? 0,
        weight_unit: "kg",
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
