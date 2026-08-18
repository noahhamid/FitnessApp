import { useCallback, useMemo, useState } from "react";
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
import { useWorkoutHistory } from "@/src/features/progress/hooks/useProgress";
import { localDateOnly } from "@/src/features/progress/lib/localDate";
import { weekScheduleStats } from "@/src/features/progress/lib/analytics";
import {
  dayLabel,
  formatWeekLabel,
  minWeekOffsetSince,
  shiftDateStr,
  signupDateOnly,
  weekDatesFor,
} from "@/src/lib/week-days";
import { ProgressCoachCard } from "../components/ProgressCoachCard";
import { UpNextWorkoutCard } from "../components/UpNextWorkoutCard";
import { TodayPulseRow } from "../components/TodayPulseRow";
import { WeekAdherenceBar } from "../components/WeekAdherenceBar";
import {
  TodayChecklistCard,
  nextChecklistAction,
} from "../components/TodayChecklistCard";

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
  const today = localDateOnly();
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekOffset, setWeekOffset] = useState(0);

  const { user } = useAuth();
  const joinDate = signupDateOnly(user?.createdAt);
  const minWeekOffset = minWeekOffsetSince(user?.createdAt);
  useInProgressSession();

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

  const { weekStart, weekEnd, weekDates } = useMemo(
    () => weekDatesFor(weekOffset),
    [weekOffset],
  );

  const canGoPrevWeek =
    minWeekOffset == null ? true : weekOffset > minWeekOffset;
  const canGoNextWeek = weekOffset < 0;

  const shiftWeek = (delta: number) => {
    const next = weekOffset + delta;
    if (minWeekOffset != null && next < minWeekOffset) return;
    if (next > 0) return;
    setWeekOffset(next);
    setSelectedDate((prev) => {
      const shifted = shiftDateStr(prev, delta * 7);
      if (joinDate && shifted < joinDate) return joinDate;
      if (shifted > today) return today;
      return shifted;
    });
  };

  const { data: weekSessions } = useWorkoutHistory(weekStart, weekEnd);
  const { data: daySessions } = useWorkoutHistory(selectedDate, selectedDate);
  const { streakDays } = useWorkoutStreak();
  const { data: apiPlan } = useWorkoutPlan();

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
          disabled: joinDate ? date < joinDate : false,
        };
      }),
    [weekDates, workoutDates, joinDate],
  );

  const activeDayIndex = days.findIndex((d) => d.date === selectedDate);
  const isToday = selectedDate === today;

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
    hasEnoughData,
    progressValue,
    sparklinePoints,
    coachHeadline,
    coachBody,
  } = useCoachCard();

  const {
    day: todaysWorkoutDay,
    isLoading: workoutSummaryLoading,
  } = useTodaysWorkoutSummary(selectedDate);

  const isRestDay = todaysWorkoutDay?.kind === "rest";
  const plannedMinutes =
    todaysWorkoutDay?.kind === "workout" ? todaysWorkoutDay.minutes : null;

  const nextAction = nextChecklistAction({
    workoutDone: workoutCompletedForDay || !!isRestDay,
    breakfastDone,
    lunchDone,
    dinnerDone,
    isRestDay,
  });

  function handlePrimaryAction() {
    if (nextAction.key === "workout") {
      router.push("/(app)/(tabs)/train");
      return;
    }
    if (nextAction.key !== "complete") {
      router.push("/log-meal");
    }
  }

  function handleChecklistPress() {
    if (dayKind !== "today") return;
    handlePrimaryAction();
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

        {workoutSummaryLoading ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {isToday ? "Up next" : "Workout"}
              </Text>
            </View>
            <SectionSkeleton height={224} />
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
                  workoutCompletedForDay
                    ? undefined
                    : () => router.push("/(app)/(tabs)/train")
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
            dayKind === "today" && nextAction.key !== "complete"
              ? handleChecklistPress
              : undefined
          }
          onWaterAdjust={
            dayKind === "today"
              ? (delta) => adjustWater.mutate(delta)
              : undefined
          }
        />

        {coachLoading ? (
          <SectionSkeleton height={168} />
        ) : hasEnoughData ? (
          <ProgressCoachCard
            progressLabel="Weight this month"
            progressValue={progressValue}
            sparklinePoints={sparklinePoints}
            coachHeadline={coachHeadline}
            coachBody={coachBody}
          />
        ) : null}
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
