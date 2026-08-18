import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import { useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";
import {
  useWeightLog,
  useAddWeightLog,
  useWorkoutHistory,
  usePersonalRecords,
} from "../hooks/useProgress";
import { useWorkoutPlan } from "@/src/features/workout/hooks/useWorkoutPlan";
import { WeightTrendChart } from "../components/WeightTrendChart";
import { ConsistencyCard } from "../components/ConsistencyCard";
import { WeightLogSheet } from "../components/WeightLogSheet";
import { WorkoutCalendar } from "../components/WorkoutCalendar";
import { DayDetailSheet } from "../components/DayDetailSheet";
import { PersonalRecordsSection } from "../components/PersonalRecordsSection";
import { VolumeTrendCard } from "../components/VolumeTrendCard";
import { MuscleBalanceCard } from "../components/MuscleBalanceCard";
import { StreakHeroCard } from "../components/StreakHeroCard";
import { AdherenceCard } from "../components/AdherenceCard";
import { MealHistoryCard } from "../components/MealHistoryCard";
import { ProgressSnapshotStrip } from "../components/ProgressSnapshotStrip";
import {
  ProgressSegmentBar,
  type ProgressTab,
} from "../components/ProgressSegmentBar";
import { localDateOnly, parseLocalDateKey } from "../lib/localDate";
import {
  completedDayKeys,
  contributionGrid,
  weekScheduleStats,
} from "../lib/analytics";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { tabContentBottomPad } from "@/src/lib/tab-chrome";
import { PageHeader } from "@/src/components/PageHeader";
import { useExerciseLibrary } from "@/src/features/workout/hooks/useExerciseLibrary";
import { useWorkoutStreak } from "@/src/features/workout/hooks/useWorkoutStreak";
import { useMealLogRange } from "@/src/features/nutrition/hooks/useNutrition";
import {
  invalidateQueryPrefixes,
  usePullToRefresh,
} from "@/src/hooks/usePullToRefresh";

const TAB_SUBTITLE: Record<ProgressTab, string> = {
  Body: "Weight over the last 8 weeks",
  Training: "Sessions, volume, and consistency",
  Nutrition: "Meals from the last 30 days",
  Records: "Your heaviest lifts so far",
};

function eightWeeksAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 56);
  return localDateOnly(d);
}

function thirtyDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 29);
  return localDateOnly(d);
}

export default function ProgressScreen() {
  const { T, styles: s, resolved } = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { section } = useLocalSearchParams<{ section?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [weightError, setWeightError] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProgressTab>("Body");

  const refreshProgress = useCallback(
    () =>
      invalidateQueryPrefixes(queryClient, [
        ["weight-log"],
        ["weight-goal"],
        ["workout-history"],
        ["workout-session-count"],
        ["personal-records"],
        ["workout-sessions"],
        ["nutrition"],
        ["workout-plan"],
      ]),
    [queryClient],
  );
  const { refreshing, onRefresh } = usePullToRefresh(refreshProgress);

  const monthStart = useMemo(
    () =>
      localDateOnly(
        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1),
      ),
    [calendarMonth],
  );
  const monthEnd = useMemo(
    () =>
      localDateOnly(
        new Date(
          calendarMonth.getFullYear(),
          calendarMonth.getMonth() + 1,
          0,
        ),
      ),
    [calendarMonth],
  );

  const { data: monthSessions } = useWorkoutHistory(monthStart, monthEnd);
  // Widened range for volume / balance / streak grid / adherence —
  // calendar month fetch above stays as-is for month navigation.
  const analyticsFrom = eightWeeksAgo();
  const analyticsTo = localDateOnly();
  const { data: analyticsSessions } = useWorkoutHistory(
    analyticsFrom,
    analyticsTo,
  );
  const { data: personalRecords } = usePersonalRecords();
  const { data: exerciseLibrary } = useExerciseLibrary();
  const { streakDays } = useWorkoutStreak(true);

  const mealFrom = thirtyDaysAgo();
  const mealTo = localDateOnly();
  const { data: mealHistory, isLoading: mealHistoryLoading } = useMealLogRange(
    mealFrom,
    mealTo,
  );

  const nameToGroup = useMemo(() => {
    const map = new Map<string, string>();
    for (const ex of exerciseLibrary ?? []) {
      map.set(ex.name, ex.muscleGroup);
    }
    return map;
  }, [exerciseLibrary]);

  const { data: weightEntries, isLoading: weightLoading } =
    useWeightLog(eightWeeksAgo());
  const { data: apiPlan } = useWorkoutPlan();
  const addWeight = useAddWeightLog();

  const completedDays = useMemo(
    () => completedDayKeys(analyticsSessions ?? []),
    [analyticsSessions],
  );

  const weekStats = useMemo(
    () =>
      weekScheduleStats(
        apiPlan?.daysPerWeek ?? 0,
        completedDays,
        apiPlan?.trainingDays,
      ),
    [apiPlan?.daysPerWeek, apiPlan?.trainingDays, completedDays],
  );

  // Mon→Sun cells for ConsistencyCard — scheduled days use the real weekdays.
  const thisWeekDays = useMemo(() => {
    const row = contributionGrid(completedDays, 1)[0] ?? [];
    return row.map((day, i) => ({
      ...day,
      scheduled: weekStats.scheduled[i] ?? false,
    }));
  }, [completedDays, weekStats.scheduled]);

  const sessionsThisWeek = useMemo(
    () => thisWeekDays.filter((d) => d.filled).length,
    [thisWeekDays],
  );

  // Same first→last delta WeightTrendChart shows — null until ≥2 logs.
  const weightDeltaKg = useMemo(() => {
    if (!weightEntries || weightEntries.length < 2) return null;
    const first = weightEntries[0].weight;
    const last = weightEntries[weightEntries.length - 1].weight;
    return last - first;
  }, [weightEntries]);

  // null when the user has never logged — WeightLogSheet starts blank
  // instead of inventing a fake 70kg default.
  const lastLoggedWeight =
    weightEntries?.[weightEntries.length - 1]?.weight ?? null;

  const selectedDaySessions = useMemo(() => {
    if (!selectedDate || !monthSessions) return [];
    return monthSessions.filter(
      (s) =>
        !!s.completedAt &&
        localDateOnly(new Date(s.completedAt)) === selectedDate,
    );
  }, [selectedDate, monthSessions]);

  const selectedDateLabel = selectedDate
    ? parseLocalDateKey(selectedDate).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  // Deep-link from Nutrition "See all" / "Full report" → Nutrition tab.
  useEffect(() => {
    if (section !== "meals") return;
    setActiveTab("Nutrition");
  }, [section]);

  const handleTabChange = (tab: ProgressTab) => {
    setActiveTab(tab);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleSaveWeight = async (weight: number) => {
    setWeightError(null);
    try {
      await addWeight.mutateAsync({ weight });
      setSheetVisible(false);
    } catch (e) {
      setWeightError(
        e instanceof Error
          ? e.message
          : "Couldn't save that weight. Try again.",
      );
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={s.screen}>
      <StatusBar
        barStyle={resolved === "dark" ? "light-content" : "dark-content"}
        backgroundColor={T.bg}
      />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          s.scrollContent,
          {
            paddingTop: T.space.sm,
            paddingBottom: tabContentBottomPad(insets.bottom),
          },
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
        <PageHeader
          eyebrow="Overview"
          subtitle="Body, training, and fuel — at a glance"
          title="Progress"
        />

        <ProgressSnapshotStrip
          streakDays={streakDays}
          sessionsThisWeek={sessionsThisWeek}
          weightDeltaKg={weightDeltaKg}
        />

        <View style={s.tabsWrap}>
          <ProgressSegmentBar active={activeTab} onChange={handleTabChange} />
          <Text style={s.tabHint}>{TAB_SUBTITLE[activeTab]}</Text>
        </View>

        {activeTab === "Body" && (
          <View style={s.tabPanel}>
            {weightLoading ? (
              <View style={s.centerState}>
                <ActivityIndicator color={T.accent} />
              </View>
            ) : (
              <WeightTrendChart entries={weightEntries ?? []} />
            )}

            <Pressable
              style={s.logBtn}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setWeightError(null);
                setSheetVisible(true);
              }}
            >
              <Plus size={16} color={T.onAccent} strokeWidth={2.4} />
              <Text style={s.logBtnText}>Log weight</Text>
            </Pressable>
          </View>
        )}

        {activeTab === "Training" && (
          <View style={s.tabPanel}>
            <WorkoutCalendar
              sessions={monthSessions ?? []}
              monthDate={calendarMonth}
              onMonthChange={setCalendarMonth}
              onSelectDay={setSelectedDate}
              selectedDate={selectedDate}
            />

            {apiPlan && (
              <ConsistencyCard
                completedThisWeek={weekStats.completed}
                targetPerWeek={weekStats.target}
                weekDays={thisWeekDays}
              />
            )}

            <View style={s.cardStack}>
              <StreakHeroCard
                streakDays={streakDays}
                sessions={analyticsSessions ?? []}
              />
              <VolumeTrendCard sessions={analyticsSessions ?? []} />
              <MuscleBalanceCard
                sessions={analyticsSessions ?? []}
                nameToGroup={nameToGroup}
              />
              {apiPlan && (
                <AdherenceCard
                  sessions={analyticsSessions ?? []}
                  daysPerWeek={apiPlan.daysPerWeek}
                  trainingDays={apiPlan.trainingDays}
                />
              )}
            </View>
          </View>
        )}

        {activeTab === "Nutrition" && (
          <View style={s.tabPanel}>
            <MealHistoryCard
              meals={mealHistory ?? []}
              isLoading={mealHistoryLoading}
            />
          </View>
        )}

        {activeTab === "Records" && (
          <View style={s.tabPanel}>
            <PersonalRecordsSection records={personalRecords ?? []} />
          </View>
        )}
      </ScrollView>

      <WeightLogSheet
        visible={sheetVisible}
        initialWeight={lastLoggedWeight}
        saving={addWeight.isPending}
        error={weightError}
        onClose={() => {
          setWeightError(null);
          setSheetVisible(false);
        }}
        onSave={handleSaveWeight}
      />

      <DayDetailSheet
        visible={!!selectedDate}
        dateLabel={selectedDateLabel}
        sessions={selectedDaySessions}
        onClose={() => setSelectedDate(null)}
      />
    </SafeAreaView>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: T.bg },
    scrollContent: {
      paddingHorizontal: T.space.xl,
    },
    tabsWrap: {
      marginBottom: T.space.xl,
      gap: 10,
    },
    tabHint: {
      fontFamily: T.bodyMed,
      fontSize: 12,
      color: T.muted,
      paddingHorizontal: 4,
    },
    logBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: T.space.sm,
      backgroundColor: T.accent,
      borderRadius: T.radius.pill,
      paddingVertical: 14,
      marginTop: T.space.sm,
      ...T.shadow.lifted,
      shadowColor: T.accent,
      shadowOpacity: 0.35,
      elevation: 6,
    },
    logBtnText: {
      fontFamily: T.bodyBold,
      fontSize: 14,
      color: T.onAccent,
      letterSpacing: -0.2,
    },
    tabPanel: { gap: 16 },
    cardStack: { gap: 12 },
    centerState: { alignItems: "center", paddingVertical: T.space.xl },
  });
}
