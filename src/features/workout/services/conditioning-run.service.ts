import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { ConditioningModality } from "@/src/lib/conditioning-plan";
import { ensureNotificationHandler } from "@/src/lib/meal-workout-reminders";

const STORAGE_KEY = "conditioning-run-v1";
const NOTIF_ID = "conditioning-timer";
const CHANNEL_ID = "conditioning-timer";

/** WorkoutSession.notes for cardio logs — also used to hide them from Continue. */
export const CONDITIONING_SESSION_NOTES = "Conditioning";

export type ConditioningRun = {
  label: string;
  modality: ConditioningModality;
  targetMinutes: number;
  startedAt: number;
  index: number;
};

function isStoredRun(
  value: unknown,
): value is Omit<ConditioningRun, "index"> & { index?: number } {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.label === "string" &&
    typeof v.modality === "string" &&
    typeof v.targetMinutes === "number" &&
    typeof v.startedAt === "number" &&
    (typeof v.index === "number" || v.index === undefined)
  );
}

export async function loadConditioningRun(): Promise<ConditioningRun | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredRun(parsed)) return null;
    return { ...parsed, index: parsed.index ?? 0 };
  } catch {
    return null;
  }
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Conditioning timer",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250],
  });
}

export async function saveConditioningRun(run: ConditioningRun): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(run));
}

export async function clearConditioningRun(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
  await cancelConditioningNotification();
}

export async function scheduleConditioningNotification(
  run: ConditioningRun,
): Promise<void> {
  if (Platform.OS === "web") return;
  const fireAt = new Date(run.startedAt + run.targetMinutes * 60 * 1000);
  if (fireAt.getTime() <= Date.now()) return;

  try {
    ensureNotificationHandler();
    await ensureAndroidChannel();
    const current = await Notifications.getPermissionsAsync();
    if (!current.granted) {
      if (current.status !== "undetermined") return;
      const asked = await Notifications.requestPermissionsAsync();
      if (!asked.granted) return;
    }
    await Notifications.cancelScheduledNotificationAsync(NOTIF_ID);
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIF_ID,
      content: {
        title: "Conditioning time is up",
        body: `${run.label} · ${run.targetMinutes} min. Open the app to mark it done.`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
        ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}),
      },
    });
  } catch {
    // Permission missing or scheduler unavailable — timer still runs locally.
  }
}

export async function cancelConditioningNotification(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.cancelScheduledNotificationAsync(NOTIF_ID);
  } catch {
    // ignore
  }
}
