import { Alert, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { localDateOnly, parseLocalDateKey } from "@/src/features/progress/lib/localDate";
import {
  computeWeeklySchedule,
  getWeekdayMondayIndex,
} from "@/src/lib/plan-day-selection";
import type { MealType } from "@/src/features/nutrition/types/nutrition.types";
import {
  markNotificationCanceled,
  recordNotificationScheduled,
} from "@/src/lib/notification-history";

export type ReminderSlot =
  | "breakfast"
  | "lunch"
  | "snack"
  | "dinner"
  | "workout";

const CHANNEL_ID = "meal-workout-reminders";
const SOFT_PROMPT_KEY = "exo:reminders-soft-prompt-v1";

/** Local clock times for each reminder (device timezone). */
export const REMINDER_TIMES: Record<
  ReminderSlot,
  { hour: number; minute: number }
> = {
  breakfast: { hour: 8, minute: 0 },
  lunch: { hour: 13, minute: 0 },
  snack: { hour: 16, minute: 0 },
  dinner: { hour: 19, minute: 0 },
  workout: { hour: 18, minute: 0 },
};

const MEAL_SLOTS: ReminderSlot[] = [
  "breakfast",
  "lunch",
  "snack",
  "dinner",
];

const ALL_SLOTS: ReminderSlot[] = [...MEAL_SLOTS, "workout"];

export function reminderId(slot: ReminderSlot, date: string): string {
  return `reminder-${slot}-${date}`;
}

export function mealTypeToSlot(meal: MealType): ReminderSlot {
  switch (meal) {
    case "Breakfast":
      return "breakfast";
    case "Lunch":
      return "lunch";
    case "Dinner":
      return "dinner";
    case "Snack":
      return "snack";
  }
}

const MEAL_TYPE_ORDER: MealType[] = [
  "Breakfast",
  "Lunch",
  "Snack",
  "Dinner",
];

/**
 * Pick a meal slot for quick-add (suggestion chips, etc.).
 * Uses reminder clock windows: current window if empty, else next empty
 * in chronological order, else Snack as last resort.
 */
export function suggestMealSlotForQuickAdd(
  filled: Partial<Record<MealType, unknown>>,
  now: Date = new Date(),
): MealType {
  const minutes = now.getHours() * 60 + now.getMinutes();

  let current: MealType = "Breakfast";
  for (const meal of MEAL_TYPE_ORDER) {
    const { hour, minute } = REMINDER_TIMES[mealTypeToSlot(meal)];
    if (hour * 60 + minute <= minutes) current = meal;
  }

  if (!filled[current]) return current;

  const start = MEAL_TYPE_ORDER.indexOf(current);
  for (let i = 1; i < MEAL_TYPE_ORDER.length; i++) {
    const meal = MEAL_TYPE_ORDER[(start + i) % MEAL_TYPE_ORDER.length];
    if (!filled[meal]) return meal;
  }

  return "Snack";
}

function copyFor(
  slot: ReminderSlot,
  workoutTitle?: string,
): { title: string; body: string } {
  switch (slot) {
    case "breakfast":
      return {
        title: "Breakfast check-in",
        body: "Don't forget breakfast — keep the streak going",
      };
    case "lunch":
      return {
        title: "Lunchtime fuel",
        body: "Log lunch when you can — your body will thank you",
      };
    case "snack":
      return {
        title: "Snack window",
        body: "A quick snack keeps energy steady this afternoon",
      };
    case "dinner":
      return {
        title: "Dinner time",
        body: "Don't skip dinner — finish strong today",
      };
    case "workout": {
      const title = workoutTitle?.trim() || "today's workout";
      return {
        title: "Training day",
        body: `Today's a training day — ${title} is ready when you are`,
      };
    }
  }
}

/** True if the reminder's local trigger is still in the future. */
export function isReminderTimeUpcoming(
  slot: ReminderSlot,
  now: Date = new Date(),
): boolean {
  const { hour, minute } = REMINDER_TIMES[slot];
  const trigger = new Date(now);
  trigger.setHours(hour, minute, 0, 0);
  return trigger.getTime() > now.getTime();
}

export function isTrainingDayToday(
  daysPerWeek: number,
  now = new Date(),
  trainingDays?: readonly number[] | null,
): boolean {
  const schedule = computeWeeklySchedule(daysPerWeek, trainingDays);
  return schedule[getWeekdayMondayIndex(now)] === true;
}

let handlerConfigured = false;

/** Show reminders while the app is foregrounded (expo default is silent). */
export function ensureNotificationHandler(): void {
  if (handlerConfigured || Platform.OS === "web") return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureAndroidReminderChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Meal & workout reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250],
    lightColor: "#E53935",
  });
}

/** Cancel OS schedule + tray only — does not touch notification history. */
async function cancelOsReminder(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // No pending schedule for this id — fine.
  }
  try {
    await Notifications.dismissNotificationAsync(id);
  } catch {
    // Not in the tray — fine.
  }
}

/**
 * Cancel a pending schedule and dismiss from the tray if already delivered.
 * Records history status "canceled" (kept as history, not deleted).
 */
export async function cancelReminder(
  slot: ReminderSlot,
  date: string = localDateOnly(),
): Promise<void> {
  if (Platform.OS === "web") return;
  const id = reminderId(slot, date);
  await cancelOsReminder(id);
  await markNotificationCanceled(id);
}

/**
 * Clear OS reminders for a calendar day without rewriting history.
 * Used by daily reschedule so we don't mark everything "canceled"
 * before re-arming the ones that still apply.
 */
export async function cancelAllRemindersForDate(
  date: string = localDateOnly(),
): Promise<void> {
  if (Platform.OS === "web") return;
  await Promise.all(
    ALL_SLOTS.map((slot) => cancelOsReminder(reminderId(slot, date))),
  );
}

export type TodayReminderState = {
  /** Device-local YYYY-MM-DD */
  date?: string;
  loggedMeals: Partial<Record<MealType, boolean>>;
  workoutCompleted: boolean;
  /** From workout plan; if missing/0, workout reminder is skipped. */
  daysPerWeek: number;
  /** Chosen weekdays; empty falls back to the default pattern. */
  trainingDays?: readonly number[] | null;
  /** Used in workout notification body when it's a training day. */
  workoutTitle?: string;
};

async function scheduleOne(
  slot: ReminderSlot,
  date: string,
  workoutTitle?: string,
): Promise<void> {
  const now = new Date();
  if (!isReminderTimeUpcoming(slot, now)) return;

  const { hour, minute } = REMINDER_TIMES[slot];
  const triggerDate = new Date(now);
  triggerDate.setHours(hour, minute, 0, 0);

  const { title, body } = copyFor(slot, workoutTitle);
  const id = reminderId(slot, date);

  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title,
      body,
      sound: true,
      data: { type: "reminder", slot, date },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}),
    },
  });

  await recordNotificationScheduled({
    id,
    type: slot,
    title,
    body,
    scheduledFor: triggerDate,
  });
}

/**
 * Cancel today's reminders, then schedule only what's still undone and
 * still upcoming. Skips entirely when notification permission is missing.
 */
export async function rescheduleTodayReminders(
  state: TodayReminderState,
): Promise<void> {
  if (Platform.OS === "web") return;

  const date = state.date ?? localDateOnly();
  ensureNotificationHandler();
  await ensureAndroidReminderChannel();

  const perms = await Notifications.getPermissionsAsync();
  if (!perms.granted) {
    await cancelAllRemindersForDate(date);
    return;
  }

  // Clear yesterday + today so day-rollover never leaves stale pending IDs.
  const yesterdayDate = parseLocalDateKey(date);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  await cancelAllRemindersForDate(localDateOnly(yesterdayDate));
  await cancelAllRemindersForDate(date);

  const mealDone: Record<ReminderSlot, boolean> = {
    breakfast: !!state.loggedMeals.Breakfast,
    lunch: !!state.loggedMeals.Lunch,
    snack: !!state.loggedMeals.Snack,
    dinner: !!state.loggedMeals.Dinner,
    workout: state.workoutCompleted,
  };

  for (const slot of MEAL_SLOTS) {
    if (mealDone[slot]) continue;
    await scheduleOne(slot, date);
  }

  const training =
    state.daysPerWeek > 0 &&
    isTrainingDayToday(state.daysPerWeek, new Date(), state.trainingDays);
  if (training && !state.workoutCompleted) {
    await scheduleOne("workout", date, state.workoutTitle);
  }
}

export async function hasSeenReminderSoftPrompt(): Promise<boolean> {
  const v = await AsyncStorage.getItem(SOFT_PROMPT_KEY);
  return v === "1";
}

export async function markReminderSoftPromptSeen(): Promise<void> {
  await AsyncStorage.setItem(SOFT_PROMPT_KEY, "1");
}

/**
 * Brief in-app explanation, then the OS permission dialog.
 * Returns whether notifications are granted afterward.
 */
export function promptForReminderPermissions(
  requestNotifications: () => Promise<boolean>,
): Promise<boolean> {
  return new Promise((resolve) => {
    if (Platform.OS === "web") {
      resolve(false);
      return;
    }

    Alert.alert(
      "Stay on track",
      "We'll remind you about meals and workouts at the right times — only for what you haven't logged yet.",
      [
        {
          text: "Not now",
          style: "cancel",
          onPress: () => {
            void markReminderSoftPromptSeen();
            resolve(false);
          },
        },
        {
          text: "Enable reminders",
          onPress: () => {
            void (async () => {
              await markReminderSoftPromptSeen();
              const ok = await requestNotifications();
              resolve(ok);
            })();
          },
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
