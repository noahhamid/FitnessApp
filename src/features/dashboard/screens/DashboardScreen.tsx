import { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { T } from "@/src/theme";
import { DashboardHeader } from "../components/DashboardHeader";
import { LinearGradient } from "expo-linear-gradient";
import { DashboardCalendar } from "../components/DashboardCalendar";
import {
  TodaySnapshotRow,
  SNAPSHOT_ICONS,
} from "../components/TodaySnapshotRow";
import { ProgressCoachCard } from "../components/ProgressCoachCard";
import { ChallengeReminderCard } from "../components/ChallengeReminderCard";
import { FadeInUp } from "../components/FadeInUp";
import { UpNextWorkoutCard } from "../components/UpNextWorkoutCard";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useWeekOverview } from "../hooks/useWeekOverview";
import { useDailyReminderStatus } from "../hooks/useDailyReminderStatus";
import { getReminderContent } from "@/src/lib/reminder-content";
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
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardScreen() {
  const today = todayStr();
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  const { user } = useAuth();
  const { days } = useWeekOverview();

  const { data: goals } = useNutritionGoals();
  const { data: totals } = useDailyTotals(today);
  const { data: water } = useWater(today);
  const { data: weekly } = useWeeklyTrend(today);

  const { state: reminderState, workoutDoneToday } = useDailyReminderStatus();
  const reminderContent = getReminderContent(reminderState);

  const {
    isLoading: coachLoading,
    hasEnoughData,
    progressValue,
    sparklinePoints,
    coachHeadline,
    coachBody,
  } = useCoachCard();

  const { summary: todaysWorkout } = useTodaysWorkoutSummary();

  const caloriesLeft =
    goals && totals ? Math.max(0, goals.calories - totals.cal) : null;

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <LinearGradient
        colors={["rgba(28,63,46,0.07)", "rgba(28,63,46,0)"]}
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
        {reminderContent && (
          <FadeInUp delay={40}>
            <ChallengeReminderCard
              message={reminderContent.message}
              deadlineLabel={reminderContent.actionLabel}
              onPress={() => router.push(reminderContent.navigateTo)}
            />
          </FadeInUp>
        )}

        <FadeInUp delay={80}>
          <TodaySnapshotRow
            items={[
              {
                icon: SNAPSHOT_ICONS.calories,
                value: caloriesLeft != null ? String(caloriesLeft) : "—",
                label: "Cal left",
              },
              {
                icon: SNAPSHOT_ICONS.workout,
                value: workoutDoneToday ? "Done" : "Not yet",
                label: "Workout",
              },
              {
                icon: SNAPSHOT_ICONS.water,
                value: water ? `${water.glasses}/8` : "0/8",
                label: "Water",
              },
            ]}
          />
        </FadeInUp>

        {todaysWorkout && (
          <FadeInUp delay={120}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Up next</Text>
              <Text
                style={styles.sectionLink}
                onPress={() => router.push("/(app)/(tabs)/train")}
              >
                Full plan
              </Text>
            </View>

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
        )}

        {!coachLoading && hasEnoughData && (
          <FadeInUp delay={160}>
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
  calendarWrap: {
    paddingHorizontal: T.space.xl,
    paddingBottom: T.space.xs,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: T.space.xl,
    paddingTop: T.space.lg,
    paddingBottom: T.space.xxxl + 20,
    gap: T.space.lg,
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
    marginBottom: T.space.sm,
  },
  sectionTitle: {
    fontFamily: T.displaySemi,
    fontSize: 17,
    color: T.white,
    letterSpacing: -0.2,
  },
  sectionLink: {
    fontFamily: T.bodySemi,
    fontSize: 12,
    color: T.accent,
  },
});
