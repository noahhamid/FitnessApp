import { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { T } from "../theme";
import { DashboardHeader } from "../components/DashboardHeader";
import {
  DashboardCalendar,
  CalendarDay,
} from "../components/DashboardCalendar";
import {
  TodaySnapshotRow,
  SNAPSHOT_ICONS,
} from "../components/TodaySnapshotRow";
import { ProgressCoachCard } from "../components/ProgressCoachCard";
import { ChallengeReminderCard } from "../components/ChallengeReminderCard";
import { FadeInUp } from "../components/FadeInUp";

import { UpNextWorkoutCard } from "../components/UpNextWorkoutCard";

const DAYS: CalendarDay[] = [
  { label: "MON", date: 3, hasWorkout: true, hasMeal: true },
  { label: "TUE", date: 4, hasWorkout: true, hasMeal: true },
  { label: "WED", date: 5, hasWorkout: false, hasMeal: true },
  { label: "THU", date: 6, hasWorkout: false, hasMeal: false },
  { label: "FRI", date: 7, hasWorkout: false, hasMeal: false },
  { label: "SAT", date: 8, hasWorkout: false, hasMeal: false },
];

export default function DashboardScreen() {
  const [selectedDate, setSelectedDate] = useState(6); // THU

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={T.bg}
        translucent={false}
      />

      <DashboardHeader greeting="Good afternoon" name="Alex" streakDays={5} />

      <View style={styles.calendarWrap}>
        <DashboardCalendar
          days={DAYS}
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
          message="Don't miss today's challenge"
          deadlineLabel="Before 6:00 PM"
          onPress={() => {}}
        />

        <TodaySnapshotRow
          items={[
            {
              icon: SNAPSHOT_ICONS.calories,
              value: "1,644",
              label: "Cal left",
            },
            {
              icon: SNAPSHOT_ICONS.workout,
              value: "Not yet",
              label: "Workout",
            },
            { icon: SNAPSHOT_ICONS.water, value: "3/6", label: "Water" },
          ]}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Up next</Text>
          <Text style={styles.sectionLink}>Full plan →</Text>
        </View>

        <FadeInUp>
          <UpNextWorkoutCard
            title="Chest & Triceps"
            tag="Push Day"
            minutes={45}
            exerciseCount={6}
            imageUrl="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=480&fit=crop"
            onPress={() => {}}
            onStartPress={() => {}}
          />
        </FadeInUp>

        <FadeInUp delay={80}>
          <ProgressCoachCard
            progressLabel="Weight this month"
            progressValue="-1.2 kg"
            sparklinePoints={[19, 17, 21, 13, 15, 7, 9, 3]}
            coachHeadline="2 more workouts to hit your weekly goal."
            coachBody="You're ahead of last week's pace — a session today keeps the streak alive."
          />
        </FadeInUp>
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  sectionTitle: { fontFamily: T.display, fontSize: 17, color: T.white },
  sectionLink: { fontFamily: T.bodySemi, fontSize: 11, color: T.accent },
});
