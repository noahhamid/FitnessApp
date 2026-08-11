import { useMemo, useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { useWaterResync } from "@/src/features/nutrition/hooks/useNutrition";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
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
import { NutritionTargetsModal } from "../components/NutritionTargetsModal";
import { useProfile } from "@/src/features/auth/hooks/useProfile";
import { goalLabel } from "@/src/features/auth/services/goals.service";

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
import {
  dayLabel,
  formatWeekLabel,
  minWeekOffsetSince,
  shiftDateStr,
  signupDateOnly,
  weekDatesFor,
} from "@/src/lib/week-days";
import { useAuth } from "@/src/features/auth/hooks/useAuth";

const WATER_GOAL_GLASSES = 8;
const MEAL_SLOTS: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];
const RECOMMENDED_RANGE: Record<MealType, string> = {
  Breakfast: "Recommended 300–450 Cal",
  Lunch: "Recommended 450–600 Cal",
  Dinner: "Recommended 550–700 Cal",
  Snack: "Recommended 150–250 Cal",
};
/** Display-only fallback when NutritionGoal row is missing (see STEP 4 note). */
const FALLBACK_CALORIE_GOAL = 2400;

function todayStr(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

export default function MealScreen() {
  const { T, styles, resolved } = useThemedStyles(makeStyles);
  const router = useRouter();
  const { user } = useAuth();
  const joinDate = signupDateOnly(user?.createdAt);
  const minWeekOffset = minWeekOffsetSince(user?.createdAt);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [weekOffset, setWeekOffset] = useState(0);
  const [targetsOpen, setTargetsOpen] = useState(false);

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
      const today = todayStr();
      if (shifted > today) return today;
      return shifted;
    });
  };

  const { data: goals } = useNutritionGoals();
  const { data: profile } = useProfile();
  const { data: meals = [] } = useMealLog(selectedDate);
  const { data: totals } = useDailyTotals(selectedDate);
  const { data: water } = useWater(selectedDate);
  const adjustWater = useAdjustWater(selectedDate);
  useWaterResync(selectedDate);
  // Rolling / current-week trend for the chart at the bottom of the screen.
  const { data: weekly } = useWeeklyTrend();
  // Mon–Sun window ending on Sunday — feeds DaySelector hasLog dots.
  // API returns end-6…end inclusive (7 days), so Sunday is included.
  const { data: weekDots } = useWeeklyTrend(weekEnd);
  const { data: suggestion } = useSuggestion(selectedDate);

  const mealsBySlot = useMemo(() => {
    const map: Partial<Record<MealType, MealLogEntry>> = {};
    for (const entry of meals) {
      if (!map[entry.meal]) map[entry.meal] = entry;
    }
    return map;
  }, [meals]);

  const loggedByDate = useMemo(() => {
    const set = new Set<string>();
    for (const d of weekDots?.days ?? []) {
      if (d.pct > 0) set.add(d.date);
    }
    return set;
  }, [weekDots]);

  const days = useMemo(
    () =>
      weekDates.map((d, i) => {
        const date = toDateStr(d);
        // Prefer date-key match; fall back to index in the Mon–Sun window
        // (API builds end-6…end, so Sunday is always the last slot).
        const hasLog =
          loggedByDate.has(date) || (weekDots?.days[i]?.pct ?? 0) > 0;
        return {
          label: dayLabel(date),
          num: d.getDate(),
          hasLog,
          date,
          disabled: joinDate ? date < joinDate : false,
        };
      }),
    [weekDates, loggedByDate, weekDots, joinDate],
  );

  const activeDayIndex = days.findIndex((d) => d.date === selectedDate);

  // Prefer server NutritionGoal. Fallback is for loading/gap only — after
  // completed onboarding, PUT /api/profile always upserts a goal row.
  const calorieGoal = goals?.calories ?? FALLBACK_CALORIE_GOAL;
  const consumed = totals?.cal ?? 0;
  const caloriesLeft = Math.max(0, calorieGoal - consumed);

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <LinearGradient
        colors={["rgba(229,57,53,0.06)", "rgba(229,57,53,0)"]}
        style={styles.topWash}
        pointerEvents="none"
      />
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
        translucent={false}
      />

      <MealHeader
        eyebrow={`${dayLabel(selectedDate)} · Diet`}
        title="Today's plate"
        caloriesLeft={caloriesLeft}
      />

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
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DailySummaryCard
          consumed={consumed}
          calorieGoal={calorieGoal}
          carbs={{ value: totals?.carbs ?? 0, goal: goals?.carbs ?? 0 }}
          protein={{ value: totals?.protein ?? 0, goal: goals?.protein ?? 0 }}
          fat={{ value: totals?.fat ?? 0, goal: goals?.fat ?? 0 }}
          goalLabel={goalLabel(profile?.goalId)}
          onEditGoal={() => setTargetsOpen(true)}
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
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(app)/(tabs)/progress",
                params: { section: "meals" },
              })
            }
            hitSlop={8}
          >
            <Text style={styles.sectionLink}>See all →</Text>
          </Pressable>
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
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(app)/(tabs)/progress",
                params: { section: "meals" },
              })
            }
            hitSlop={8}
          >
            <Text style={styles.sectionLink}>Full report →</Text>
          </Pressable>
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

      <NutritionTargetsModal
        visible={targetsOpen}
        onClose={() => setTargetsOpen(false)}
        goals={goals ?? null}
        goalId={profile?.goalId}
        daysPerWeek={profile?.daysPerWeek}
      />
    </SafeAreaView>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
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
}
