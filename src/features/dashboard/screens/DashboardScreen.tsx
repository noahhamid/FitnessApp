import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { CalorieCard } from "@/src/features/dashboard/components/CaloriCard";
import {
  WeeklyCard,
  WeightCard,
} from "@/src/features/dashboard/components/DashboardComponents";
import { StreakBanner } from "@/src/features/dashboard/components/StreakBanner";

import {
  useWeightGoal,
  useWeightLog,
} from "@/src/features/nutrition/hooks/useWeight";
import { fetchDailyTotals } from "@/src/features/nutrition/services/nutrition.service";
import {
  ApiWorkoutSession,
  calendarWeekDatesMonSunLocal,
  fetchWorkoutSessions,
  localCalendarYmdFromIso,
  mapIncompleteToTodayPlan,
  todayLocalYmd,
} from "@/src/features/workout/services/workout.service";
import { Ionicons } from "@expo/vector-icons";
import { useQueries, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const T = {
  bg0: "#0A0A0A",
  bg1: "#141414",
  bg2: "#1A1A1A",
  bg3: "#242424",
  gold: "#FF1F4D",
  text: "#FFFFFF",
  sub: "#A8A8A8",
  muted: "#5A5A5A",
  border: "#FFFFFF0A",
  borderMid: "#FFFFFF15",
  red: "#FF1F4D",
};

function SectionGap() {
  return <View style={{ height: 20 }} />;
}

function SectionLabel({ label }: { label: string }) {
  return <Text style={s.sectionLabel}>{label}</Text>;
}

function streakFromCalendarDays(days: Set<string>): number {
  let count = 0;
  const cursor = new Date();
  for (let i = 0; i < 400; i++) {
    const ymd = todayLocalYmd(cursor);
    if (days.has(ymd)) count += 1;
    else break;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export default function DashboardScreen() {
  const { user } = useAuth();

  const weekDates = useMemo(() => calendarWeekDatesMonSunLocal(new Date()), []);
  const todayYmd = todayLocalYmd(new Date());

  const dailyTotalsQueries = useQueries({
    queries: weekDates.map((date) => ({
      queryKey: ["nutrition", "totals", date] as const,
      queryFn: () => fetchDailyTotals(date),
    })),
  });

  const totalsLoading = dailyTotalsQueries.some((q) => q.isPending);

  const { data: completedWorkouts = [] } = useQuery({
    queryKey: ["dashboard", "workouts", "completed"] as const,
    queryFn: () => fetchWorkoutSessions(`?limit=80&completed=true`),
  });

  const { data: openWorkouts = [] } = useQuery({
    queryKey: ["dashboard", "workouts", "open"] as const,
    queryFn: () => fetchWorkoutSessions(`?limit=20&completed=false`),
  });

  const completedDaySet = useMemo(() => {
    const next = new Set<string>();
    for (const row of completedWorkouts) {
      if (!row.completedAt) continue;
      next.add(localCalendarYmdFromIso(row.completedAt));
    }
    return next;
  }, [completedWorkouts]);

  const weeklyBars = useMemo(() => {
    return weekDates.map((ymd, i) => {
      const cal = dailyTotalsQueries[i]?.data?.cal ?? 0;
      const workout = completedWorkouts.some((w) => {
        const endTs = w.completedAt ?? w.startedAt;
        return localCalendarYmdFromIso(endTs) === ymd;
      });
      return { cal, workout };
    });
  }, [weekDates, dailyTotalsQueries, completedWorkouts]);

  const streakDays = streakFromCalendarDays(completedDaySet);
  const bestStreakGuess =
    streakDays > 0
      ? Math.max(Math.ceil(streakDays * 1.25), streakDays + 7)
      : 21;

  const { data: weightRows = [], isPending: weightsPending } = useWeightLog();
  const { data: weightGoalRecord } = useWeightGoal();

  const weightChartSorted = useMemo(() => {
    const rows = [...weightRows].sort((a, b) =>
      a.log_date.localeCompare(b.log_date),
    );
    return rows.map((r) => ({ w: r.weight, date: r.log_date }));
  }, [weightRows]);

  const plannedToday = useMemo(() => {
    const openToday = openWorkouts.filter((w: ApiWorkoutSession) => {
      if (w.completedAt) return false;
      return localCalendarYmdFromIso(w.startedAt) === todayYmd;
    });
    if (!openToday.length) return [];
    return openToday
      .slice(0, 3)
      .map((sess, idx) => mapIncompleteToTodayPlan(sess, idx));
  }, [openWorkouts, todayYmd]);

  const heroFirst =
    user?.name?.trim()?.split(/\s+/)?.[0]?.toUpperCase() ?? "ATHLETE";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <SafeAreaView edges={["top"]} style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg0} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ─────────────────────────────── */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{greeting}</Text>
            <Text style={s.heroName}>{heroFirst}</Text>
          </View>
          <TouchableOpacity
            style={s.bellBtn}
            activeOpacity={0.75}
            onPress={() => router.push("/(app)/(tabs)/train")}
          >
            <Ionicons name="barbell-outline" size={20} color={T.gold} />
          </TouchableOpacity>
        </View>

        {/* ── STREAK ─────────────────────────────── */}
        <View style={s.px}>
          <StreakBanner days={streakDays} best={bestStreakGuess} />
        </View>

        <SectionGap />

        {/* ── AI FOOD SCANNER CTA ─────────────────── */}
        <View style={s.px}>
          <TouchableOpacity
            style={s.scannerBtn}
            activeOpacity={0.85}
            onPress={() => router.push("/(app)/(tabs)/nutrition")}
          >
            <View style={s.scannerIconWrap}>
              <Ionicons name="camera-outline" size={26} color={T.bg0} />
            </View>
            <View style={s.scannerText}>
              <Text style={s.scannerTitle}>AI Food Scanner</Text>
              <Text style={s.scannerSub}>Scan your meal — instant macros</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={T.bg0} />
          </TouchableOpacity>
        </View>

        <SectionGap />

        {/* ── CALORIES ───────────────────────────── */}
        <View style={s.px}>
          <CalorieCard />
        </View>

        <SectionGap />

        {/* ── QUICK ACTIONS ──────────────────────── */}
        <View style={s.px}>
          <View style={s.actionsRow}>
            {[
              {
                icon: "barbell-outline" as const,
                label: "TRAIN",
                route: "/(app)/(tabs)/train" as const,
              },
              {
                icon: "nutrition-outline" as const,
                label: "NUTRITION",
                route: "/(app)/(tabs)/nutrition" as const,
              },
              {
                icon: "trending-up-outline" as const,
                label: "PROGRESS",
                route: "/(app)/(tabs)/progress" as const,
              },
              {
                icon: "flash-outline" as const,
                label: "FOCUS",
                route: "/(app)/focus-mode" as const,
              },
            ].map((action) => (
              <TouchableOpacity
                key={action.label}
                style={s.actionBtn}
                activeOpacity={0.75}
                onPress={() => router.push(action.route)}
              >
                <Ionicons name={action.icon} size={22} color={T.gold} />
                <Text style={s.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: T.bg0,
    maxWidth: 430,
    alignSelf: "center",
    width: "100%",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 110 },
  px: { paddingHorizontal: 16 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: T.sub,
  },
  heroName: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 42,
    color: T.text,
    lineHeight: 44,
    letterSpacing: 0.5,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: T.gold + "18",
    borderWidth: 1,
    borderColor: T.gold + "35",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    color: T.muted,
    letterSpacing: 2,
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  // ── AI Scanner CTA ──────────────────────────────────────────────────────
  scannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.gold,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 14,
  },
  scannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  scannerText: {
    flex: 1,
  },
  scannerTitle: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 18,
    color: T.bg0,
    letterSpacing: 0.3,
  },
  scannerSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.bg0,
    opacity: 0.7,
    marginTop: 2,
  },

  // ── Quick actions ────────────────────────────────────────────────────────
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: T.bg1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.borderMid,
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
  },
  actionLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 10,
    color: T.sub,
    letterSpacing: 1,
  },

  loadingBox: {
    padding: 28,
    alignItems: "center",
    backgroundColor: T.bg1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
  },
});
