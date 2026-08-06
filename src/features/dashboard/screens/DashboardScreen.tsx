import { useMemo, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useMealLog } from "@/src/features/nutrition/hooks/useNutrition";
import { ChallengeReminderCard } from "../components/ChallengeReminderCard";

import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { DashboardHeader } from "../components/DashboardHeader";
import { LinearGradient } from "expo-linear-gradient";
import { DaySelector } from "@/src/features/nutrition/components/DaySelector";
import { useWorkoutHistory } from "@/src/features/progress/hooks/useProgress";
import { localDateOnly } from "@/src/features/progress/lib/localDate";
import {
  dayLabel,
  formatWeekLabel,
  shiftDateStr,
  weekDatesFor,
} from "@/src/lib/week-days";
import {
  TodaySnapshotRow,
  SNAPSHOT_ICONS,
} from "../components/TodaySnapshotRow";
import { ProgressCoachCard } from "../components/ProgressCoachCard";

import { FadeInUp } from "../components/FadeInUp";
import { UpNextWorkoutCard } from "../components/UpNextWorkoutCard";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useCoachCard } from "../hooks/useCoachCard";
import { useTodaysWorkoutSummary } from "../hooks/useTodaysWorkoutSummary";
import { useInProgressSession } from "@/src/features/workout/hooks/useInProgressSession";
import {
  useDailyTotals,
  useWater,
  useWeeklyTrend,
} from "@/src/features/nutrition/hooks/useNutrition";
import { getGreeting } from "@/src/lib/greeting";

export default function DashboardScreen() {
  const { T, styles, resolved } = useThemedStyles(makeStyles);
  const today = localDateOnly();
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekOffset, setWeekOffset] = useState(0);

  const { user } = useAuth();
  // Mount shared hook so past-day in-progress sessions auto-complete even
  // if the user never opens the Workout tab this session.
  useInProgressSession();

  const { weekStart, weekEnd, weekDates } = useMemo(
    () => weekDatesFor(weekOffset),
    [weekOffset],
  );

  const shiftWeek = (delta: number) => {
    setWeekOffset((o) => o + delta);
    // Keep the same weekday selected in the newly visible week.
    setSelectedDate((prev) => shiftDateStr(prev, delta * 7));
  };

  const { data: weekSessions } = useWorkoutHistory(weekStart, weekEnd);
  // Today's chip must stay accurate even when the strip is on another week.
  const { data: todaySessions } = useWorkoutHistory(today, today);

  const workoutDates = useMemo(() => {
    const set = new Set<string>();
    for (const s of weekSessions ?? []) {
      if (s.completedAt) set.add(localDateOnly(new Date(s.completedAt)));
    }
    return set;
  }, [weekSessions]);

  const days = useMemo(
    () =>
      weekDates.map((d) => {
        const date = localDateOnly(d);
        return {
          label: dayLabel(date),
          num: d.getDate(),
          hasLog: workoutDates.has(date),
          date,
        };
      }),
    [weekDates, workoutDates],
  );

  const activeDayIndex = days.findIndex((d) => d.date === selectedDate);

  const isToday = selectedDate === today;

  const { data: totals } = useDailyTotals(selectedDate);
  const { data: water } = useWater(selectedDate);
  const { data: weekly } = useWeeklyTrend(today);
  const { data: mealsForDay } = useMealLog(selectedDate);

  // --- Challenge card derivation (selected day) ---
  const loggedMealTypes = new Set((mealsForDay ?? []).map((m) => m.meal));
  const breakfastDone = loggedMealTypes.has("Breakfast");
  const lunchDone = loggedMealTypes.has("Lunch");
  const dinnerDone = loggedMealTypes.has("Dinner");

  const workoutCompletedForDay = workoutDates.has(selectedDate);

  const dayKind: "today" | "past" | "future" =
    selectedDate === today ? "today" : selectedDate < today ? "past" : "future";

  const challengeIncomplete =
    !workoutCompletedForDay || !breakfastDone || !lunchDone || !dinnerDone;

  function handleChallengePress() {
    if (dayKind !== "today") return;
    if (!workoutCompletedForDay) router.push("/(app)/(tabs)/train");
    else router.push("/log-meal");
  }

  const todayWorkoutDone = useMemo(
    () =>
      (todaySessions ?? []).some(
        (s) =>
          !!s.completedAt &&
          localDateOnly(new Date(s.completedAt)) === today,
      ),
    [todaySessions, today],
  );

  const {
    isLoading: coachLoading,
    hasEnoughData,
    progressValue,
    sparklinePoints,
    coachHeadline,
    coachBody,
  } = useCoachCard();

  const { day: todaysWorkoutDay, summary: todaysWorkout } =
    useTodaysWorkoutSummary(selectedDate);

  const caloriesConsumed = totals ? totals.cal : null;

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <LinearGradient
        colors={["rgba(28,63,46,0.06)", "rgba(28,63,46,0)"]}
        style={styles.topWash}
        pointerEvents="none"
      />
      <StatusBar
        barStyle={resolved === "dark" ? "light-content" : "dark-content"}
        backgroundColor={T.bg}
        translucent={false}
      />

      <DashboardHeader
        greeting={getGreeting()}
        name={user?.name ?? "there"}
        streakDays={weekly?.streak ?? 0}
      />

      <View style={styles.daySelectorWrap}>
        <DaySelector
          days={days}
          activeIndex={activeDayIndex}
          onSelect={(i) => {
            const picked = days[i];
            if (picked) setSelectedDate(picked.date);
          }}
          onPrevWeek={() => shiftWeek(-1)}
          onNextWeek={() => shiftWeek(1)}
          weekLabel={formatWeekLabel(weekStart, weekEnd, weekOffset)}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ChallengeReminderCard
          dayKind={dayKind}
          workoutDone={workoutCompletedForDay}
          breakfastDone={breakfastDone}
          lunchDone={lunchDone}
          dinnerDone={dinnerDone}
          onPress={
            dayKind === "today" && challengeIncomplete
              ? handleChallengePress
              : undefined
          }
        />

        <TodaySnapshotRow
          items={[
            {
              icon: SNAPSHOT_ICONS.calories,
              value: caloriesConsumed != null ? String(caloriesConsumed) : "—",
              label: "Calories",
            },
            {
              icon: SNAPSHOT_ICONS.workout,
              value: isToday
                ? todayWorkoutDone
                  ? "Done"
                  : "Not yet"
                : todaysWorkout
                  ? "Done"
                  : "—",
              label: "Workout",
            },
            {
              icon: SNAPSHOT_ICONS.water,
              value: water ? `${water.glasses}/8` : "0/8",
              label: "Water",
            },
          ]}
        />

        {todaysWorkoutDay && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {isToday ? "Up next" : "Workout"}
              </Text>
              <Text
                style={styles.sectionLink}
                onPress={() => router.push("/(app)/(tabs)/train")}
              >
                Full plan →
              </Text>
            </View>

            <FadeInUp>
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
                  onPress={() => router.push("/(app)/(tabs)/train")}
                  onStartPress={() => router.push("/(app)/(tabs)/train")}
                />
              )}
            </FadeInUp>
          </>
        )}

        {!coachLoading && hasEnoughData && (
          <FadeInUp delay={80}>
            <ProgressCoachCard
              progressLabel="Weight this month"
              progressValue={progressValue}
              sparklinePoints={sparklinePoints}
              coachHeadline={coachHeadline}
              coachBody={coachBody}
            />
          </FadeInUp>
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
      paddingTop: 14,
      // Clears the absolute floating tab pill (~64 + safe-area + gap).
      paddingBottom: 110,
      gap: 16,
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
