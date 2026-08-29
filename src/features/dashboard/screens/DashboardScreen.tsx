import { useCallback, useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { useMealLog } from "@/src/features/nutrition/hooks/useNutrition";

import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { DashboardHeader } from "../components/DashboardHeader";
import { LinearGradient } from "expo-linear-gradient";
import { DaySelector } from "@/src/features/nutrition/components/DaySelector";
import {
  usePersonalRecords,
  useWorkoutHistory,
} from "@/src/features/progress/hooks/useProgress";
import { localDateOnly } from "@/src/features/progress/lib/localDate";
import { weekScheduleStats } from "@/src/features/progress/lib/analytics";
import { dayLabel, formatWeekLabel } from "@/src/lib/week-days";
import { useDiaryDate } from "@/src/hooks/useDiaryDate";
import { ProgressCoachCard } from "../components/ProgressCoachCard";
import { UpNextWorkoutCard } from "../components/UpNextWorkoutCard";
import { ContinueWorkoutCard } from "@/src/features/workout/components/ContinueWorkoutCard";
import { TodayPulseRow } from "../components/TodayPulseRow";
import { WeekAdherenceBar } from "../components/WeekAdherenceBar";
import {
  TodayChecklistCard,
  type ChecklistStepKey,
} from "../components/TodayChecklistCard";
import { ReminderNudgeCard } from "../components/ReminderNudgeCard";
import { useDailyReminderStatus } from "../hooks/useDailyReminderStatus";
import { getReminderContent } from "@/src/lib/reminder-content";
import { suggestMealSlotForQuickAdd } from "@/src/lib/meal-workout-reminders";
import { useUserProfile } from "@/src/features/profile/hooks/useUserProfile";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useCoachCard } from "../hooks/useCoachCard";
import { useTodaysWorkoutSummary } from "../hooks/useTodaysWorkoutSummary";
import { useInProgressSession } from "@/src/features/workout/hooks/useInProgressSession";
import { useWorkoutStreak } from "@/src/features/workout/hooks/useWorkoutStreak";
import { useWorkoutPlan } from "@/src/features/workout/hooks/useWorkoutPlan";
import {
  useAdjustWater,
  useWater,
} from "@/src/features/nutrition/hooks/useNutrition";
import {
  invalidateQueryPrefixes,
  usePullToRefresh,
} from "@/src/hooks/usePullToRefresh";
import { tabContentBottomPad } from "@/src/lib/tab-chrome";
import { useRequirePremium } from "@/src/features/billing/useRequirePremium";

function SectionSkeleton({
  height,
  style,
}: {
  height: number;
  style?: object;
}) {
  const { styles } = useThemedStyles(makeSkeletonStyles);
  return (
    <View
      style={[styles.block, { height }, style]}
      accessibilityLabel="Loading"
    />
  );
}

function makeSkeletonStyles(T: AppTheme) {
  return StyleSheet.create({
    block: {
      borderRadius: T.radius.xl,
      backgroundColor: T.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.border,
      overflow: "hidden",
    },
  });
}

function sessionMinutes(
  startedAt: string,
  completedAt: string | null,
): number | null {
  if (!completedAt) return null;
  const ms =
    new Date(completedAt).getTime() - new Date(startedAt).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return null;
  return Math.max(1, Math.round(ms / 60000));
}

export default function DashboardScreen() {
  const { T, styles, resolved } = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const requirePremium = useRequirePremium();
  const {
    today,
    selectedDate,
    setSelectedDate,
    weekOffset,
    weekStart,
    weekEnd,
    weekDates,
    canGoPrevWeek,
    canGoNextWeek,
    shiftWeek,
    isToday,
    joinDate,
  } = useDiaryDate(user?.createdAt);
  const { inProgress, isLoading: inProgressLoading } = useInProgressSession();
  const { data: personalRecords } = usePersonalRecords();

  const refreshDashboard = useCallback(
    () =>
      invalidateQueryPrefixes(queryClient, [
        ["workout-history"],
        ["nutrition"],
        ["dashboard-coach"],
        ["in-progress-session"],
        ["week-overview"],
        ["user", "profile"],
        ["workout-sessions", "streak"],
        ["workout-plan"],
      ]),
    [queryClient],
  );
  const { refreshing, onRefresh } = usePullToRefresh(refreshDashboard);

  const { data: weekSessions } = useWorkoutHistory(weekStart, weekEnd);
  const { data: daySessions } = useWorkoutHistory(selectedDate, selectedDate);
  const { streakDays } = useWorkoutStreak();
  const { data: apiPlan } = useWorkoutPlan();
  const { data: profile } = useUserProfile();

  const workoutDates = useMemo(() => {
    const set = new Set<string>();
    for (const s of weekSessions ?? []) {
      if (s.completedAt) set.add(localDateOnly(new Date(s.completedAt)));
    }
    return set;
  }, [weekSessions]);

  const weekStats = useMemo(
    () =>
      weekScheduleStats(
        apiPlan?.daysPerWeek ?? 0,
        workoutDates,
        apiPlan?.trainingDays,
        weekDates[0],
      ),
    [apiPlan?.daysPerWeek, apiPlan?.trainingDays, workoutDates, weekDates],
  );

  const days = useMemo(
    () =>
      weekDates.map((d) => {
        const date = localDateOnly(d);
        return {
          label: dayLabel(date),
          num: d.getDate(),
          hasLog: workoutDates.has(date),
          date,
          // Only future days are blocked — past days stay tappable to review.
          disabled: date > today,
        };
      }),
    [weekDates, workoutDates, today],
  );

  const activeDayIndex = days.findIndex((d) => d.date === selectedDate);

  const { data: water } = useWater(selectedDate);
  const { data: mealsForDay } = useMealLog(selectedDate);
  const adjustWater = useAdjustWater(selectedDate);

  const loggedMealTypes = new Set((mealsForDay ?? []).map((m) => m.meal));
  const breakfastDone = loggedMealTypes.has("Breakfast");
  const lunchDone = loggedMealTypes.has("Lunch");
  const dinnerDone = loggedMealTypes.has("Dinner");

  const workoutCompletedForDay = workoutDates.has(selectedDate);

  const completedMinutes = useMemo(() => {
    const finished = (daySessions ?? []).find((s) => !!s.completedAt);
    if (!finished) return null;
    return sessionMinutes(finished.startedAt, finished.completedAt);
  }, [daySessions]);

  const dayKind: "today" | "past" | "future" =
    selectedDate === today ? "today" : selectedDate < today ? "past" : "future";

  const {
    isLoading: coachLoading,
    progressValue,
    sparklinePoints,
    coachHeadline,
    coachBody,
    goalHit,
  } = useCoachCard();

  const {
    day: todaysWorkoutDay,
    isLoading: workoutSummaryLoading,
  } = useTodaysWorkoutSummary(selectedDate);

  const isRestDay = todaysWorkoutDay?.kind === "rest";
  const reminderState = useDailyReminderStatus({
    workoutDone: workoutCompletedForDay || !!isRestDay,
    mealsLogged: (mealsForDay ?? []).length > 0,
    reminderEnabled: profile?.reminderEnabled,
  });
  const reminderContent = getReminderContent(reminderState);
  const showContinue = isToday && !inProgressLoading && !!inProgress;
  const showWorkoutSkeleton =
    workoutSummaryLoading || (isToday && inProgressLoading);
  const plannedMinutes = showContinue
    ? inProgress.minutesLeft
    : todaysWorkoutDay?.kind === "workout"
      ? todaysWorkoutDay.minutes
      : null;

  function openMealLog(slot: "Breakfast" | "Lunch" | "Dinner" | "Snack") {
    router.push({
      pathname: "/log-meal",
      params: { slot, date: selectedDate },
    });
  }

  function goTrain(resume?: boolean) {
    requirePremium(() =>
      router.push(
        resume
          ? { pathname: "/(app)/(tabs)/train", params: { resume: "1" } }
          : "/(app)/(tabs)/train",
      ),
    );
  }

  function handleChecklistPress(key: ChecklistStepKey) {
    if (dayKind !== "today") return;
    if (key === "workout") {
      goTrain();
      return;
    }
    const slot =
      key === "breakfast"
        ? "Breakfast"
        : key === "lunch"
          ? "Lunch"
          : "Dinner";
    openMealLog(slot);
  }

  const contentPadBottom = tabContentBottomPad(insets.bottom);

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <LinearGradient
        colors={["rgba(229,57,53,0.06)", "rgba(229,57,53,0)"]}
        style={styles.topWash}
        pointerEvents="none"
      />
      <StatusBar
        barStyle={resolved === "dark" ? "light-content" : "dark-content"}
        backgroundColor={T.bg}
        translucent={false}
      />

      <DashboardHeader name={user?.name ?? "there"} />

      <View style={styles.daySelectorWrap}>
        <DaySelector
          days={days}
          activeIndex={activeDayIndex}
          onSelect={(i) => {
            const picked = days[i];
            if (picked && !picked.disabled) setSelectedDate(picked.date);
          }}
          onPrevWeek={() => shiftWeek(-1)}
          onNextWeek={() => shiftWeek(1)}
          weekLabel={formatWeekLabel(weekStart, weekEnd, weekOffset)}
          canGoPrevWeek={canGoPrevWeek}
          canGoNextWeek={canGoNextWeek}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: contentPadBottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={T.accent}
            colors={[T.accent]}
            progressBackgroundColor={T.bgElevated}
          />
        }
      >
        <TodayPulseRow
          plannedMinutes={plannedMinutes}
          completedMinutes={completedMinutes}
          workoutDone={workoutCompletedForDay}
          isRestDay={!!isRestDay}
          streakDays={streakDays}
        />

        <WeekAdherenceBar
          completed={weekStats.completed}
          target={weekStats.target}
          onPressOverview={() => router.push("/(app)/(tabs)/progress")}
        />

        {showWorkoutSkeleton ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {isToday ? "Up next" : "Workout"}
              </Text>
            </View>
            <SectionSkeleton height={224} />
          </>
        ) : showContinue ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Continue</Text>
              <Text
                style={styles.sectionLink}
                onPress={() => router.push("/(app)/(tabs)/train")}
              >
                Full plan →
              </Text>
            </View>
            <ContinueWorkoutCard
              title={inProgress.plan.title}
              tag={inProgress.plan.tag}
              minutes={inProgress.minutesLeft}
              calories={inProgress.estCalories}
              percent={inProgress.percent}
              imageUrl={
                inProgress.plan.coverImage ||
                (todaysWorkoutDay?.kind === "workout"
                  ? todaysWorkoutDay.imageUrl
                  : undefined)
              }
              exercises={inProgress.plan.exercises}
              personalRecords={personalRecords}
              onPress={() => goTrain(true)}
            />
          </>
        ) : todaysWorkoutDay ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {isToday
                  ? workoutCompletedForDay
                    ? "Today’s workout"
                    : "Up next"
                  : "Workout"}
              </Text>
              <Text
                style={styles.sectionLink}
                onPress={() => router.push("/(app)/(tabs)/train")}
              >
                Full plan →
              </Text>
            </View>

            {todaysWorkoutDay.kind === "rest" ? (
              <UpNextWorkoutCard
                variant="rest"
                onPress={() => router.push("/(app)/(tabs)/train")}
              />
            ) : (
              <UpNextWorkoutCard
                title={todaysWorkoutDay.title}
                tag={todaysWorkoutDay.tag}
                minutes={todaysWorkoutDay.minutes}
                exerciseCount={todaysWorkoutDay.exerciseCount}
                imageUrl={todaysWorkoutDay.imageUrl}
                completed={workoutCompletedForDay}
                onPress={() => router.push("/(app)/(tabs)/train")}
                onStartPress={
                  workoutCompletedForDay ? undefined : () => goTrain()
                }
              />
            )}
          </>
        ) : null}

        <TodayChecklistCard
          dayKind={dayKind}
          workoutDone={workoutCompletedForDay || !!isRestDay}
          breakfastDone={breakfastDone}
          lunchDone={lunchDone}
          dinnerDone={dinnerDone}
          waterGlasses={water?.glasses ?? 0}
          onStepPress={
            dayKind === "today" ? handleChecklistPress : undefined
          }
          onWaterAdjust={
            dayKind === "today"
              ? (delta) => adjustWater.mutate(delta)
              : undefined
          }
        />

        {dayKind === "today" && reminderContent ? (
          <ReminderNudgeCard
            content={reminderContent}
            onPress={() => {
              if (reminderContent.navigateTo === "/log-meal") {
                const filled = Object.fromEntries(
                  (mealsForDay ?? []).map((meal) => [meal.meal, true]),
                );
                openMealLog(suggestMealSlotForQuickAdd(filled));
                return;
              }
              goTrain();
            }}
          />
        ) : null}

        {coachLoading ? (
          <SectionSkeleton height={168} />
        ) : (
          <ProgressCoachCard
            progressLabel="Weight this month"
            progressValue={progressValue}
            sparklinePoints={sparklinePoints}
            coachHeadline={coachHeadline}
            coachBody={coachBody}
            goalHit={goalHit}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bg },
    daySelectorWrap: { paddingHorizontal: 20, paddingBottom: 4 },
    scroll: { flex: 1 },
    content: {
      paddingHorizontal: 20,
      paddingTop: 12,
      gap: 12,
    },
    topWash: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 260,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    sectionTitle: { fontFamily: T.displaySemi, fontSize: 17, color: T.white },
    sectionLink: { fontFamily: T.bodySemi, fontSize: 11, color: T.accent },
  });
}
