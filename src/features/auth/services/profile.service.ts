import AsyncStorage from "@react-native-async-storage/async-storage";
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

  await AsyncStorage.setItem(
    profileKey(session.user.id),
    JSON.stringify(metrics),
  );
}

export async function fetchProfile(): Promise<ProfileMetrics | null> {
  const session = await getSession();
  if (!session?.user) return null;

  const raw = await AsyncStorage.getItem(profileKey(session.user.id));
  if (!raw) return null;

  return JSON.parse(raw) as ProfileMetrics;
}
