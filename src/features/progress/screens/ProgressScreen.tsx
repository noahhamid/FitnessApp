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

const T = {
  bg: "#000000",
  text: "#FFFFFF",
  faint: "#9AA0AE",
  accent: "#FFC700",
  accentText: "#1A1300",
  display: "SpaceGrotesk_700Bold",
  bodyMed: "Inter_500Medium",
};

function eightWeeksAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 56);
  return d.toISOString().slice(0, 10);
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
  const [sheetVisible, setSheetVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthStart = useMemo(() => {
    const d = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      1,
    );
    return d.toISOString().slice(0, 10);
  }, [calendarMonth]);
  const monthEnd = useMemo(() => {
    const d = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() + 1,
      0,
    );
    return d.toISOString().slice(0, 10);
  }, [calendarMonth]);

  const { data: monthSessions } = useWorkoutHistory(monthStart, monthEnd);
  const { data: personalRecords } = usePersonalRecords();

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

  const lastLoggedWeight =
    weightEntries?.[weightEntries.length - 1]?.weight ?? 70;

  const selectedDaySessions = useMemo(() => {
    if (!selectedDate || !monthSessions) return [];
    return monthSessions.filter(
      (s) => s.completedAt?.slice(0, 10) === selectedDate,
    );
  }, [selectedDate, monthSessions]);

  const selectedDateLabel = selectedDate
    ? new Date(selectedDate).toLocaleDateString(undefined, {
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
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={s.scrollContent}
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
            <Plus size={16} color={T.accentText} strokeWidth={2.4} />
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

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 128 },
  pageTitle: {
    fontFamily: T.display,
    fontSize: 28,
    color: T.text,
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  logBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: T.accent,
    borderRadius: 999,
    paddingVertical: 12,
    marginTop: 12,
  },
  logBtnText: {
    fontFamily: T.bodyMed,
    fontWeight: "700",
    fontSize: 13,
    color: T.accentText,
  },
  section: { marginTop: 28 },
  sectionTitle: {
    fontFamily: T.display,
    fontSize: 18,
    color: T.text,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  centerState: { alignItems: "center", paddingVertical: 24 },
});
