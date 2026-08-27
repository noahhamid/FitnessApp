import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
  ActionSheetIOS,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { tabContentBottomPad } from "@/src/lib/tab-chrome";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useWaterResync } from "@/src/features/nutrition/hooks/useNutrition";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { resolveAssetUri } from "@/src/lib/resolve-asset";
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
import { AdaptiveCalorieCard } from "../components/AdaptiveCalorieCard";
import { useProfile } from "@/src/features/auth/hooks/useProfile";
import { useRequirePremium } from "@/src/features/billing/useRequirePremium";
import { goalLabel } from "@/src/features/auth/services/goals.service";

import {
  useMealLog,
  useDailyTotals,
  useNutritionGoals,
  useWater,
  useAdjustWater,
  useWeeklyTrend,
  useSuggestion,
  useAdaptiveSuggestion,
  useApplyAdaptiveSuggestion,
  useDeleteMeal,
} from "../hooks/useNutrition";
import type { MealLogEntry, MealType } from "../types/nutrition.types";
import { GYM_FOODS } from "@/src/lib/gymFoods";
import { dayLabel, formatWeekLabel } from "@/src/lib/week-days";
import { currentMealSlot } from "@/src/lib/meal-workout-reminders";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useDiaryDate } from "@/src/hooks/useDiaryDate";
import {
  invalidateQueryPrefixes,
  usePullToRefresh,
} from "@/src/hooks/usePullToRefresh";
import { AdaptiveSuggestionCard } from "../components/AdaptiveSuggestionCard";
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

// `require` at module scope is fine; resolveAssetSource must stay lazy
// (breaks `expo export:embed` if called at import time).
const NUTRITION_SUGGESTION = require("../../../../assets/images/nutrition-suggestion.jpg");
let nutritionSuggestionUri: string | undefined;

function getNutritionSuggestionUri(): string {
  if (nutritionSuggestionUri === undefined) {
    nutritionSuggestionUri = resolveAssetUri(NUTRITION_SUGGESTION);
  }
  return nutritionSuggestionUri;
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
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
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
  const [targetsOpen, setTargetsOpen] = useState(false);
  const [adaptiveDismissed, setAdaptiveDismissed] = useState(false);
  const deleteMeal = useDeleteMeal(selectedDate);

  const refreshNutrition = useCallback(
    () =>
      invalidateQueryPrefixes(queryClient, [
        ["nutrition"],
        ["user", "profile"],
        ["week-overview", "meals"],
      ]),
    [queryClient],
  );
  const { refreshing, onRefresh } = usePullToRefresh(refreshNutrition);

  const { data: goals } = useNutritionGoals();
  const { data: profile } = useProfile();
  const requirePremium = useRequirePremium();
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
  const { data: adaptive } = useAdaptiveSuggestion();
  const applyAdaptive = useApplyAdaptiveSuggestion();

  const mealsBySlot = useMemo(() => {
    const map: Record<MealType, MealLogEntry[]> = {
      Breakfast: [],
      Lunch: [],
      Dinner: [],
      Snack: [],
    };
    for (const entry of meals) {
      map[entry.meal]?.push(entry);
    }
    return map;
  }, [meals]);

  const firstEmptySlot =
    MEAL_SLOTS.find((s) => mealsBySlot[s].length === 0) ?? "Snack";
  const quickAddSlot = isToday ? currentMealSlot() : firstEmptySlot;

  function openLogMeal(slot: MealType) {
    router.push({
      pathname: "/log-meal",
      params: { slot, date: selectedDate },
    });
  }

  function openScanMeal(slot: MealType) {
    requirePremium(() =>
      router.push({
        pathname: "/scan-meal",
        params: { slot, date: selectedDate },
      }),
    );
  }

  const openMealActions = useCallback(
    (entry: MealLogEntry) => {
      const goEdit = () => {
        router.push({
          pathname: "/log-meal",
          params: {
            id: entry.id,
            slot: entry.meal,
            date: entry.log_date,
            name: entry.name,
            cal: String(entry.cal),
            protein: String(entry.protein),
            carbs: String(entry.carbs),
            fat: String(entry.fat),
          },
        });
      };

      const confirmDelete = () => {
        Alert.alert("Delete this meal log?", "This cannot be undone.", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteMeal.mutate(entry.id),
          },
        ]);
      };

      if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ["Cancel", "Edit", "Delete"],
            cancelButtonIndex: 0,
            destructiveButtonIndex: 2,
          },
          (index) => {
            if (index === 1) goEdit();
            if (index === 2) confirmDelete();
          },
        );
        return;
      }

      Alert.alert(entry.name, undefined, [
        { text: "Cancel", style: "cancel" },
        { text: "Edit", onPress: goEdit },
        { text: "Delete", style: "destructive", onPress: confirmDelete },
      ]);
    },
    [deleteMeal, router],
  );

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
        barStyle={resolved === "dark" ? "light-content" : "dark-content"}
        backgroundColor={T.bg}
        translucent={false}
      />

      <MealHeader
        eyebrow={`${dayLabel(selectedDate)} · Diet`}
        title={isToday ? "Today's plate" : "Plate"}
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
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabContentBottomPad(insets.bottom) },
        ]}
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
        <DailySummaryCard
          consumed={consumed}
          calorieGoal={calorieGoal}
          carbs={{ value: totals?.carbs ?? 0, goal: goals?.carbs ?? 0 }}
          protein={{ value: totals?.protein ?? 0, goal: goals?.protein ?? 0 }}
          fat={{ value: totals?.fat ?? 0, goal: goals?.fat ?? 0 }}
          goalLabel={goalLabel(profile?.goalId)}
          onEditGoal={() => setTargetsOpen(true)}
        />

        {adaptive?.eligible &&
        adaptive.adjustmentNeeded &&
        !adaptiveDismissed ? (
          <AdaptiveCalorieCard
            currentCalories={adaptive.currentCalories}
            suggestedCalories={adaptive.suggestedCalories}
            explanation={adaptive.explanation}
            applying={applyAdaptive.isPending}
            error={applyAdaptive.isError}
            onApply={() =>
              requirePremium(() =>
                applyAdaptive.mutate(adaptive.suggestedCalories, {
                  onSuccess: () => setAdaptiveDismissed(true),
                }),
              )
            }
            onDismiss={() => setAdaptiveDismissed(true)}
          />
        ) : null}

        <WaterTracker
          glasses={water?.glasses ?? 0}
          total={WATER_GOAL_GLASSES}
          onAdd={() => adjustWater.mutate(1)}
          onRemove={() => adjustWater.mutate(-1)}
        />

        <LogActionsRow
          actions={[
            {
              key: "scan",
              label: "Scan food",
              icon: LOG_ACTION_ICONS.camera,
              primary: true,
              onPress: () => openScanMeal(quickAddSlot),
            },
            {
              key: "manual",
              label: "Manual",
              icon: LOG_ACTION_ICONS.manual,
              onPress: () => openLogMeal(quickAddSlot),
            },
          ]}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {isToday ? "Today's meals" : "Meals"}
          </Text>
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
          const entries = mealsBySlot[slot];
          return (
            <FadeInUp key={slot} delay={i * 70} style={styles.slotGroup}>
              {entries.length === 0 ? (
                <EmptyMealSlot
                  slot={slot}
                  recommendedRange={RECOMMENDED_RANGE[slot]}
                  onAdd={() => openLogMeal(slot)}
                />
              ) : (
                <>
                  {entries.map((entry) => (
                    <MealPhotoCard
                      key={entry.id}
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
                      onPress={() =>
                        router.push({
                          pathname: "/log-meal",
                          params: {
                            id: entry.id,
                            slot: entry.meal,
                            date: selectedDate,
                            name: entry.name,
                            cal: String(entry.cal),
                            protein: String(entry.protein),
                            carbs: String(entry.carbs),
                            fat: String(entry.fat),
                          },
                        })
                      }
                      entranceDelay={0}
                    />
                  ))}
                  <Pressable
                    onPress={() => openLogMeal(slot)}
                    hitSlop={8}
                    style={styles.addAnother}
                    accessibilityRole="button"
                    accessibilityLabel={`Add another ${slot}`}
                  >
                    <Text style={styles.addAnotherText}>
                      + Add another {slot.toLowerCase()}
                    </Text>
                  </Pressable>
                </>
              )}
            </FadeInUp>
          );
        })}

        {suggestion && (
          <AiSuggestionCard
            headline={suggestion.headline}
            body={suggestion.body}
            imageUrl={getNutritionSuggestionUri()}
            suggestions={suggestion.suggestions}
            onSelect={(s) => {
              const food = GYM_FOODS.find((f) => f.name === s.label);
              const emptySlot = isToday ? currentMealSlot() : firstEmptySlot;
              router.push({
                pathname: "/log-meal",
                params: {
                  slot: emptySlot,
                  date: selectedDate,
                  name: s.label,
                  cal: String(s.calories),
                  ...(food
                    ? {
                        protein: String(food.protein),
                        carbs: String(food.carbs),
                        fat: String(food.fat),
                      }
                    : {}),
                },
              });
            }}
          />
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {weekOffset === 0 ? "This week" : "Week"}
          </Text>
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
        onUpdateProfile={() => {
          setTargetsOpen(false);
          router.push({
            pathname: "/(app)/(tabs)/profile",
            params: { editPlan: "1" },
          });
        }}
        goals={goals ?? null}
        goalId={profile?.goalId}
        daysPerWeek={profile?.daysPerWeek}
        bodyFatSource={profile?.bodyFatSource}
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
  slotGroup: { gap: 10 },
  addAnother: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  addAnotherText: { fontFamily: T.bodySemi, fontSize: 12, color: T.accent },
  });
}
