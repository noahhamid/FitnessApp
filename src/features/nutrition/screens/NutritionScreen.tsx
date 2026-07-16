import { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { T } from "../theme";
import { MealHeader } from "../components/MealHeader";
import { DaySelector } from "../components/DaySelector";
import { DailySummaryCard } from "../components/DailySummaryCard";
import { WaterTracker } from "../components/WaterTracker";
import { LogActionsRow, LOG_ACTION_ICONS } from "../components/LogActionsRow";
import { MealPhotoCard, MealMacros } from "../components/MealPhotoCard";
import { EmptyMealSlot } from "../components/EmptyMealSlot";
import { FadeInUp } from "../components/FadeInUp";
import { AiSuggestionCard } from "../components/AiSuggestionCard";
import { WeeklyTrendCard } from "../components/WeeklyTrendCard";

// ── Mock data — replace with real state / API results ────────────────────────
const DAYS = [
  { label: "MON", num: 3, hasLog: true },
  { label: "TUE", num: 4, hasLog: true },
  { label: "WED", num: 5, hasLog: true },
  { label: "THU", num: 6, hasLog: false },
  { label: "FRI", num: 7, hasLog: false },
  { label: "SAT", num: 8, hasLog: false },
];

type Meal = {
  slot: string;
  name: string;
  time: string;
  calories: number;
  macros: MealMacros;
  imageUrl: string;
} | null;

const MEALS: Record<string, Meal> = {
  Breakfast: {
    slot: "Breakfast",
    name: "Greek yogurt bowl",
    time: "7:40 AM",
    calories: 310,
    macros: { carbs: 28, protein: 22, fat: 9 },
    imageUrl:
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=500&h=400&fit=crop",
  },
  Lunch: {
    slot: "Lunch",
    name: "Grilled chicken salad",
    time: "1:05 PM",
    calories: 546,
    macros: { carbs: 30, protein: 48, fat: 21 },
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=400&fit=crop",
  },
  Dinner: null,
  Snack: null,
};

export default function MealScreen() {
  const [activeDay, setActiveDay] = useState(3); // THU

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={T.bg}
        translucent={false}
      />

      <MealHeader
        eyebrow="Thursday · Diet"
        title="Today's plate"
        caloriesLeft={1644}
        streakDays={5}
      />
      <View style={styles.daySelectorWrap}>
        <DaySelector
          days={DAYS}
          activeIndex={activeDay}
          onSelect={setActiveDay}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DailySummaryCard
          consumed={856}
          calorieGoal={2500}
          carbs={{ value: 173, goal: 280 }}
          protein={{ value: 128, goal: 165 }}
          fat={{ value: 52, goal: 80 }}
          goalLabel="Lean muscle gain"
          onEditGoal={() => {}}
        />

        <WaterTracker glasses={3} total={6} onAdd={() => {}} />

        <LogActionsRow
          actions={[
            {
              key: "scan",
              label: "Scan food",
              icon: LOG_ACTION_ICONS.camera,
              primary: true,
              onPress: () => {},
            },
            {
              key: "search",
              label: "Search",
              icon: LOG_ACTION_ICONS.search,
              onPress: () => {},
            },
            {
              key: "manual",
              label: "Manual",
              icon: LOG_ACTION_ICONS.manual,
              onPress: () => {},
            },
          ]}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's meals</Text>
          <Text style={styles.sectionLink}>See all →</Text>
        </View>

        {Object.entries(MEALS).map(([slot, meal], i) => (
          <FadeInUp key={slot} delay={i * 70}>
            {meal ? (
              <MealPhotoCard
                slot={meal.slot}
                name={meal.name}
                time={meal.time}
                calories={meal.calories}
                macros={meal.macros}
                imageUrl={meal.imageUrl}
                onPress={() => {}}
                entranceDelay={0} // FadeInUp already staggers the wrapper
              />
            ) : (
              <EmptyMealSlot
                slot={slot}
                recommendedRange={
                  slot === "Dinner"
                    ? "Recommended 550–700 Cal"
                    : "Recommended 150–250 Cal"
                }
                onAdd={() => {}}
              />
            )}
          </FadeInUp>
        ))}

        <AiSuggestionCard
          headline="You've got 37g of protein left today."
          body="A salmon dinner or a shake after your lift closes the gap without going over on carbs."
          imageUrl="https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=500&fit=crop"
          suggestions={[
            { label: "Salmon bowl", calories: 420 },
            { label: "Protein shake", calories: 160 },
          ]}
          onSelect={() => {}}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>This week</Text>
          <Text style={styles.sectionLink}>Full report →</Text>
        </View>

        <WeeklyTrendCard
          days={[
            { label: "M", pct: 74 },
            { label: "T", pct: 88 },
            { label: "W", pct: 65 },
            { label: "T", pct: 92 },
            { label: "F", pct: 34, isToday: true },
            { label: "S", pct: 0 },
            { label: "S", pct: 0 },
          ]}
          streak={5}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  daySelectorWrap: { paddingHorizontal: 20, paddingBottom: 4 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 60,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 4,
  },
  sectionTitle: { fontFamily: T.display, fontSize: 18, color: T.white },
  sectionLink: { fontFamily: T.bodySemi, fontSize: 11, color: T.accent },
});
