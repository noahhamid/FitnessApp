import { useCallback, useEffect, useRef } from "react";
import { AppState, type AppStateStatus, Platform } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { usePermissions } from "@/src/hooks/usePermissions";
import { localDateOnly } from "@/src/features/progress/lib/localDate";
import { fetchMealLog } from "@/src/features/nutrition/services/nutrition.service";
import { fetchUserProfile } from "@/src/features/profile/services/profile.service";
import { fetchWorkoutPlan } from "@/src/features/workout/hooks/useWorkoutPlan";
import { api } from "@/src/lib/api";
import { getPlanDayIndexForDate } from "@/src/lib/plan-day-selection";
import { dayTitleFromMuscleGroups } from "@/src/lib/plan-day-title";
import {
  ensureNotificationHandler,
  hasSeenReminderSoftPrompt,
  markReminderSoftPromptSeen,
  normalizeReminderSlots,
  promptForReminderPermissions,
  rescheduleTodayReminders,
  syncWeeklyWorkoutReminders,
} from "@/src/lib/meal-workout-reminders";
import { markNotificationFired } from "@/src/lib/notification-history";
import type { MealType } from "@/src/features/nutrition/types/nutrition.types";

type SessionRow = {
  completedAt: string | null;
};

/**
 * On mount + each return to foreground: soft-prompt once if needed, then
 * cancel/reschedule today's meal & workout local reminders from live state.
 * Also listens for delivered local notifications to mark history "fired".
 */
export function useMealWorkoutReminders(enabled: boolean) {
  const { requestNotifications, refresh } = usePermissions();
  const queryClient = useQueryClient();
  const appState = useRef(AppState.currentState);
  const running = useRef(false);
  const softPromptInFlight = useRef(false);

  const sync = useCallback(async () => {
    if (!enabled || Platform.OS === "web") return;
    if (running.current) return;
    running.current = true;
    try {
      ensureNotificationHandler();

      const seen = await hasSeenReminderSoftPrompt();
      const perms = await refresh();

      if (!seen && perms === "undetermined" && !softPromptInFlight.current) {
        softPromptInFlight.current = true;
        try {
          const ok = await promptForReminderPermissions(requestNotifications);
          if (!ok) return;
        } finally {
          softPromptInFlight.current = false;
        }
      } else if (!seen) {
        // Already decided at OS level (or unavailable) — don't re-Alert.
        await markReminderSoftPromptSeen();
      }

      const latest = await refresh();
      if (latest !== "granted") return;

      const today = localDateOnly();
      const [meals, plan, sessions, profile] = await Promise.all([
        fetchMealLog(today),
        queryClient.fetchQuery({
          queryKey: ["workout-plan"],
          queryFn: fetchWorkoutPlan,
        }),
        api.get<SessionRow[]>(
          `/api/workouts?completed=true&from=${today}&to=${today}&limit=20`,
        ),
        queryClient.fetchQuery({
          queryKey: ["user", "profile", "full"],
          queryFn: fetchUserProfile,
        }),
      ]);

      const loggedMeals: Partial<Record<MealType, boolean>> = {};
      for (const m of meals) {
        loggedMeals[m.meal] = true;
      }

      const workoutCompleted = sessions.some(
        (s) =>
          !!s.completedAt &&
          localDateOnly(new Date(s.completedAt)) === today,
      );

      let workoutTitle: string | undefined;
      const daysPerWeek = plan?.daysPerWeek ?? 0;
      if (plan && daysPerWeek > 0) {
        const dayIndex = getPlanDayIndexForDate(
          new Date(),
          daysPerWeek,
          plan.trainingDays,
        );
        if (dayIndex != null) {
          const day = plan.days[dayIndex];
          if (day) {
            workoutTitle = dayTitleFromMuscleGroups(day.exercises);
          }
        }
      }

      const reminderOn = profile?.reminderEnabled !== false;
      const workoutHour = profile?.reminderHour ?? 18;
      const trainingDays = plan?.trainingDays ?? profile?.trainingDays ?? [];
      const reminderSlots = normalizeReminderSlots(profile?.reminderSlots);
      const workoutSlotOn = reminderSlots.includes("workout");

      await syncWeeklyWorkoutReminders({
        enabled: reminderOn && workoutSlotOn,
        hour: workoutHour,
        trainingDays,
      });

      await rescheduleTodayReminders({
        date: today,
        loggedMeals,
        workoutCompleted,
        daysPerWeek,
        trainingDays,
        workoutTitle,
        reminderEnabled: reminderOn,
        workoutHour,
        reminderSlots,
      });
    } catch (err) {
      console.warn("[reminders] sync failed", err);
    } finally {
      running.current = false;
    }
  }, [enabled, queryClient, refresh, requestNotifications]);

  useEffect(() => {
    if (!enabled) return;
    void sync();
  }, [enabled, sync]);

  useEffect(() => {
    if (!enabled) return;
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        next === "active"
      ) {
        void sync();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [enabled, sync]);

  // Local delivery → history "fired" (works in Expo Go; remote push does not).
  useEffect(() => {
    if (!enabled || Platform.OS === "web") return;
    ensureNotificationHandler();
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const id = notification.request.identifier;
      if (!id?.startsWith("reminder-")) return;
      void markNotificationFired(id);
    });
    return () => sub.remove();
  }, [enabled]);
}
