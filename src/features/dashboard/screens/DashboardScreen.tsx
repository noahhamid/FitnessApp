import { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useMealLog } from "@/src/features/nutrition/hooks/useNutrition";
import { ChallengeReminderCard } from "../components/ChallengeReminderCard";

import { T } from "../theme";
import { DashboardHeader } from "../components/DashboardHeader";
import { LinearGradient } from "expo-linear-gradient";
import { DashboardCalendar } from "../components/DashboardCalendar";
import {
  TodaySnapshotRow,
  SNAPSHOT_ICONS,
} from "../components/TodaySnapshotRow";
import { ProgressCoachCard } from "../components/ProgressCoachCard";

import { FadeInUp } from "../components/FadeInUp";
import { UpNextWorkoutCard } from "../components/UpNextWorkoutCard";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useWeekOverview } from "../hooks/useWeekOverview";
import { useCoachCard } from "../hooks/useCoachCard";
import { useTodaysWorkoutSummary } from "../hooks/useTodaysWorkoutSummary";
import {
  useNutritionGoals,
  useDailyTotals,
  useWater,
} from "@/src/features/nutrition/hooks/useNutrition";
import { useWeeklyTrend } from "@/src/features/nutrition/hooks/useNutrition";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function todayStr(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

export default function DashboardScreen() {
  const today = todayStr();
  const [selectedDate, setSelectedDate] = useState(today);

  const { user } = useAuth();
  const { days } = useWeekOverview();

  const isToday = selectedDate === today;

  const { data: goals } = useNutritionGoals();
  const { data: totals } = useDailyTotals(selectedDate);
  const { data: water } = useWater(selectedDate);
  const { data: weekly } = useWeeklyTrend(today);
  const { data: mealsForDay } = useMealLog(selectedDate);

  // --- Challenge card derivation (selected day) ---
  const loggedMealTypes = new Set((mealsForDay ?? []).map((m) => m.meal));
  const breakfastDone = loggedMealTypes.has("Breakfast");
  const lunchDone = loggedMealTypes.has("Lunch");
  const dinnerDone = loggedMealTypes.has("Dinner");

  // Single source of truth for "was a workout actually completed" —
  // comes from useWeekOverview's real completed-session data, shared
  // by both the challenge card and the snapshot row below.
  const workoutCompletedForDay =
    days.find((d) => d.fullDate === selectedDate)?.hasWorkout ?? false;

  const dayKind: "today" | "past" | "future" =
    selectedDate === today ? "today" : selectedDate < today ? "past" : "future";

  const challengeIncomplete =
    !workoutCompletedForDay || !breakfastDone || !lunchDone || !dinnerDone;

  function handleChallengePress() {
    if (dayKind !== "today") return;
    if (!workoutCompletedForDay) router.push("/(app)/(tabs)/train");
    else router.push("/log-meal");
  }

  // --- Snapshot row workout status (today only) ---
  const todayWorkoutDone =
    days.find((d) => d.fullDate === today)?.hasWorkout ?? false;

  const {
    isLoading: coachLoading,
    hasEnoughData,
    progressValue,
    sparklinePoints,
    coachHeadline,
    coachBody,
  } = useCoachCard();

  const { summary: todaysWorkout } = useTodaysWorkoutSummary(selectedDate);

  const caloriesConsumed = totals ? totals.cal : null;

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <LinearGradient
        colors={["rgba(28,63,46,0.06)", "rgba(28,63,46,0)"]}
        style={styles.topWash}
        pointerEvents="none"
      />
      <StatusBar
        barStyle="dark-content"
        backgroundColor={T.bg}
        translucent={false}
      />

      <DashboardHeader
        greeting={getGreeting()}
        name={user?.name ?? "there"}
        streakDays={weekly?.streak ?? 0}
      />

      <View style={styles.calendarWrap}>
        <DashboardCalendar
          days={days}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
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

        {todaysWorkout && (
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
              <UpNextWorkoutCard
                title={todaysWorkout.title}
                tag={todaysWorkout.tag}
                minutes={todaysWorkout.minutes}
                exerciseCount={todaysWorkout.exerciseCount}
                imageUrl={todaysWorkout.imageUrl}
                onPress={() => router.push("/(app)/(tabs)/train")}
                onStartPress={() => router.push("/(app)/(tabs)/train")}
              />
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  calendarWrap: { paddingHorizontal: 20, paddingBottom: 4 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 60,
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
