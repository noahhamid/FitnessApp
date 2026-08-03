import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import {
  useWeightLog,
  useAddWeightLog,
  useProgressionSuggestions,
  useWorkoutHistory,
  usePersonalRecords,
} from "../hooks/useProgress";
import { useWorkoutPlan } from "@/src/features/workout/hooks/useWorkoutPlan";
import { api } from "@/src/lib/api";
import { useQuery } from "@tanstack/react-query";
import { WeightTrendChart } from "../components/WeightTrendChart";
import { LevelUpSection } from "../components/LevelUpSection";
import { ConsistencyCard } from "../components/ConsistencyCard";
import { WeightLogSheet } from "../components/WeightLogSheet";
import { WorkoutCalendar } from "../components/WorkoutCalendar";
import { DayDetailSheet } from "../components/DayDetailSheet";
import { PersonalRecordsSection } from "../components/PersonalRecordsSection";
import { VolumeTrendCard } from "../components/VolumeTrendCard";
import { MuscleBalanceCard } from "../components/MuscleBalanceCard";
import { StreakHeroCard } from "../components/StreakHeroCard";
import { AdherenceCard } from "../components/AdherenceCard";
import { localDateOnly, parseLocalDateKey } from "../lib/localDate";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { topInset } from "@/src/lib/safe-area";
import { useExerciseLibrary } from "@/src/features/workout/hooks/useExerciseLibrary";
import { useWorkoutStreak } from "@/src/features/workout/hooks/useWorkoutStreak";

function eightWeeksAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 56);
  return localDateOnly(d);
}

function startOfThisWeekMonday(): Date {
  const d = new Date();
  const day = d.getDay(); // 0 = Sunday
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function ProgressScreen() {
  const { T, styles: s, resolved } = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
  const { data: suggestions, isLoading: suggestionsLoading } =
    useProgressionSuggestions();
  const addWeight = useAddWeightLog();

  // Sessions completed this week, for the consistency card. Reuses the
  // existing GET /api/workouts?completed=true endpoint rather than adding
  // a new one — filters client-side since there's no date-range param there.
  const { data: recentSessions } = useQuery({
    queryKey: ["workout-sessions", "recent-for-progress"],
    queryFn: () =>
      api.get<{ completedAt: string | null }[]>(
        "/api/workouts?completed=true&limit=30",
      ),
  });

  const completedThisWeek = useMemo(() => {
    if (!recentSessions) return 0;
    const monday = startOfThisWeekMonday();
    return recentSessions.filter(
      (s) => s.completedAt && new Date(s.completedAt) >= monday,
    ).length;
  }, [recentSessions]);

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

  const handleSaveWeight = async (weight: number) => {
    try {
      await addWeight.mutateAsync({ weight });
      setSheetVisible(false);
    } catch (e) {
      console.log("Failed to log weight:", e);
    }
  };

  return (
    <View style={s.screen}>
      <StatusBar
        barStyle={resolved === "dark" ? "light-content" : "dark-content"}
        backgroundColor={T.bg}
      />
      <ScrollView
        contentContainerStyle={[
          s.scrollContent,
          { paddingTop: topInset(insets.top) + T.space.sm },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.pageTitle}>Progress</Text>

        <WorkoutCalendar
          sessions={monthSessions ?? []}
          monthDate={calendarMonth}
          onMonthChange={setCalendarMonth}
          onSelectDay={setSelectedDate}
          selectedDate={selectedDate}
        />

        <View style={s.section}>
          {weightLoading ? (
            <View style={s.centerState}>
              <ActivityIndicator color={T.accent} />
            </View>
          ) : (
            <WeightTrendChart entries={weightEntries ?? []} />
          )}

          <Pressable style={s.logBtn} onPress={() => setSheetVisible(true)}>
            <Plus size={16} color={T.onAccent} strokeWidth={2.4} />
            <Text style={s.logBtnText}>Log weight</Text>
          </Pressable>
        </View>

        {apiPlan && (
          <View style={s.section}>
            <ConsistencyCard
              completedThisWeek={completedThisWeek}
              targetPerWeek={apiPlan.daysPerWeek}
            />
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>Training</Text>
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
              />
            )}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Personal records</Text>
          <PersonalRecordsSection records={personalRecords ?? []} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Ready to level up</Text>
          {suggestionsLoading ? (
            <View style={s.centerState}>
              <ActivityIndicator color={T.accent} />
            </View>
          ) : (
            <LevelUpSection suggestions={suggestions ?? []} />
          )}
        </View>
      </ScrollView>

      <WeightLogSheet
        visible={sheetVisible}
        initialWeight={lastLoggedWeight}
        saving={addWeight.isPending}
        onClose={() => setSheetVisible(false)}
        onSave={handleSaveWeight}
      />

      <DayDetailSheet
        visible={!!selectedDate}
        dateLabel={selectedDateLabel}
        sessions={selectedDaySessions}
        onClose={() => setSelectedDate(null)}
      />
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: T.bg },
    scrollContent: {
      paddingHorizontal: T.space.xl,
      paddingBottom: 128,
    },
    pageTitle: {
      fontFamily: T.displayBold,
      fontSize: 28,
      color: T.white,
      letterSpacing: -0.5,
      marginBottom: T.space.xl,
    },
    logBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: T.space.sm,
      backgroundColor: T.accent,
      borderRadius: T.radius.pill,
      paddingVertical: T.space.md,
      marginTop: T.space.md,
    },
    logBtnText: {
      fontFamily: T.bodyBold,
      fontSize: 13,
      color: T.onAccent,
    },
    section: { marginTop: 28 },
    sectionTitle: {
      fontFamily: T.displaySemi,
      fontSize: 18,
      color: T.white,
      letterSpacing: -0.3,
      marginBottom: T.space.md,
    },
    cardStack: { gap: 12 },
    centerState: { alignItems: "center", paddingVertical: T.space.xl },
  });
}
