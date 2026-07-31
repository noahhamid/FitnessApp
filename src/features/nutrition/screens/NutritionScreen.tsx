import { useMemo, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { useCallback } from "react";
import { useWaterResync } from "@/src/features/nutrition/hooks/useNutrition";
import { T } from "@/src/theme";
import { MealHeader } from "../components/MealHeader";
import { DaySelector } from "../components/DaySelector";
import { DailySummaryCard } from "../components/DailySummaryCard";
import { WaterTracker } from "../components/WaterTracker";
import { LogActionsRow, LOG_ACTION_ICONS } from "../components/LogActionsRow";
import { MealPhotoCard } from "../components/MealPhotoCard";
import { EmptyMealSlot } from "../components/EmptyMealSlot";
import { FadeInUp } from "../components/FadeInUp";
import { AiSuggestionCard } from "../components/AiSuggestionCard";
import { WeeklyTrendCard } from "../components/WeeklyTrendCard";

import {
  useMealLog,
  useDailyTotals,
  useNutritionGoals,
  useWater,
  useAdjustWater,
  useWeeklyTrend,
  useSuggestion,
} from "../hooks/useNutrition";
import type { MealLogEntry, MealType } from "../types/nutrition.types";

const WATER_GOAL_GLASSES = 8;
const MEAL_SLOTS: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];
const RECOMMENDED_RANGE: Record<MealType, string> = {
  Breakfast: "Recommended 300–450 Cal",
  Lunch: "Recommended 450–600 Cal",
  Dinner: "Recommended 550–700 Cal",
  Snack: "Recommended 150–250 Cal",
};

function todayStr(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function dayNum(dateStr: string): number {
  return new Date(dateStr + "T00:00:00").getDate();
}

function dayLabel(dateStr: string): string {
  return new Date(dateStr + "T00:00:00")
    .toLocaleDateString("en-US", { weekday: "short" })
    .toUpperCase();
}

export default function MealScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const { data: goals } = useNutritionGoals();
  const { data: meals = [] } = useMealLog(selectedDate);
  const { data: totals } = useDailyTotals(selectedDate);
  const { data: water } = useWater(selectedDate);
  const adjustWater = useAdjustWater(selectedDate);
  useWaterResync(selectedDate);
  const { data: weekly } = useWeeklyTrend();
  const { data: suggestion } = useSuggestion(selectedDate);

  const mealsBySlot = useMemo(() => {
    const map: Partial<Record<MealType, MealLogEntry>> = {};
    for (const entry of meals) {
      if (!map[entry.meal]) map[entry.meal] = entry;
    }
    return map;
  }, [meals]);

  const days = useMemo(() => {
    if (!weekly) return [];
    return weekly.days.map((d) => ({
      label: dayLabel(d.date),
      num: dayNum(d.date),
      hasLog: d.pct > 0,
      date: d.date,
    }));
  }, [weekly]);

  const activeDayIndex = days.findIndex((d) => d.date === selectedDate);

  const calorieGoal = goals?.calories ?? 2400;
  const consumed = totals?.cal ?? 0;
  const caloriesLeft = Math.max(0, calorieGoal - consumed);

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

      <MealHeader
        eyebrow={`${dayLabel(selectedDate)} · Diet`}
        title="Today's plate"
        caloriesLeft={caloriesLeft}
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
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DailySummaryCard
          consumed={consumed}
          calorieGoal={calorieGoal}
          carbs={{ value: totals?.carbs ?? 0, goal: goals?.carbs ?? 0 }}
          protein={{ value: totals?.protein ?? 0, goal: goals?.protein ?? 0 }}
          fat={{ value: totals?.fat ?? 0, goal: goals?.fat ?? 0 }}
          goalLabel="Lean muscle gain"
          onEditGoal={() => {}}
        />

        <WaterTracker
          glasses={water?.glasses ?? 0}
          total={WATER_GOAL_GLASSES}
          onAdd={() => adjustWater.mutate(1)}
        />

        <LogActionsRow
          actions={[
            {
              key: "scan",
              label: "Scan food",
              icon: LOG_ACTION_ICONS.camera,
              primary: true,
              onPress: () =>
                router.push({
                  pathname: "/scan-meal",
                  params: { date: selectedDate },
                }),
            },
            {
              key: "manual",
              label: "Manual",
              icon: LOG_ACTION_ICONS.manual,
              onPress: () =>
                router.push({
                  pathname: "/log-meal",
                  params: { date: selectedDate },
                }),
            },
          ]}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's meals</Text>
          <Text style={styles.sectionLink}>See all →</Text>
        </View>

        {MEAL_SLOTS.map((slot, i) => {
          const entry = mealsBySlot[slot];
          return (
            <FadeInUp key={slot} delay={i * 70}>
              {entry ? (
                <MealPhotoCard
                  slot={entry.meal}
                  name={entry.name}
                  time={formatTime(entry.logged_at)}
                  calories={entry.cal}
                  macros={{
                    carbs: entry.carbs,
                    protein: entry.protein,
                    fat: entry.fat,
                  }}
                  imageUrl={entry.image_url ?? undefined}
                  onPress={() => {}}
                  entranceDelay={0}
                />
              ) : (
                <EmptyMealSlot
                  slot={slot}
                  recommendedRange={RECOMMENDED_RANGE[slot]}
                  onAdd={() =>
                    router.push({
                      pathname: "/log-meal",
                      params: { slot, date: selectedDate },
                    })
                  }
                />
              )}
            </FadeInUp>
          );
        })}

        {suggestion && (
          <AiSuggestionCard
            headline={suggestion.headline}
            body={suggestion.body}
            imageUrl="https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=500&fit=crop"
            suggestions={suggestion.suggestions}
            onSelect={() => {}}
          />
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>This week</Text>
          <Text style={styles.sectionLink}>Full report →</Text>
        </View>

        {weekly && (
          <WeeklyTrendCard
            days={weekly.days.map((d) => ({
              label: d.label,
              pct: d.pct,
              isToday: d.isToday,
            }))}
            streak={weekly.streak}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  topWash: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 260,
  },
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
