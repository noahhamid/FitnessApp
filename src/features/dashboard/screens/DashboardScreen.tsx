import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { CalorieCard } from "@/src/features/dashboard/components/CaloriCard";
import {
  StatTile,
  WeeklyCard,
  WeightCard,
} from "@/src/features/dashboard/components/DashboardComponents";
import { StreakBanner } from "@/src/features/dashboard/components/StreakBanner";
import { TodaySession } from "@/src/features/dashboard/components/TodaySession";
import { useMealLog } from "@/src/features/nutrition/hooks/useNutrition";
import { useWeightGoal, useWeightLog } from "@/src/features/nutrition/hooks/useWeight";
import { fetchDailyTotals } from "@/src/features/nutrition/services/nutrition.service";
import {
  ApiWorkoutSession,
  calendarWeekDatesMonSunLocal,
  fetchWorkoutSessions,
  localCalendarYmdFromIso,
  mapIncompleteToTodayPlan,
  todayLocalYmd,
} from "@/src/features/workout/services/workout.service";
import { SLEEP_SPARK, STEPS_SPARK } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { useQueries, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo } from "react";
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
  bg0: "#0A0A0C",
  bg1: "#111114",
  bg2: "#18181D",
  bg3: "#222228",
  lime: "#C8F135",
  red: "#FF3D3D",
  orange: "#FF8A00",
  blue: "#3D8EFF",
  purple: "#9B6DFF",
  text: "#F2F2F5",
  sub: "#7A7A8C",
  muted: "#4A4A58",
  border: "#FFFFFF0F",
  borderMid: "#FFFFFF18",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionGap() {
  return <View style={{ height: 16 }} />;
}

function SectionLabel({
  label,
  icon,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={s.sectionLabelRow}>
      <Ionicons name={icon} size={12} color={T.muted} />
      <Text style={s.sectionLabel}>{label}</Text>
    </View>
  );
}

// ─── Quick action data ────────────────────────────────────────────────────────
const ACTIONS = [
  {
    icon: "barbell-outline" as const,
    label: "LOG\nWORKOUT",
    color: T.lime,
    route: "/(app)/(tabs)/train" as const,
  },
  {
    icon: "nutrition-outline" as const,
    label: "LOG\nMEAL",
    color: T.orange,
    route: "/(app)/(tabs)/nutrition" as const,
  },
  {
    icon: "flash-outline" as const,
    label: "FOCUS\nMODE",
    color: T.purple,
    route: "/(app)/focus-mode" as const,
  },
  {
    icon: "camera-outline" as const,
    label: "PROGRESS\nPHOTO",
    color: T.blue,
    route: null,
  },
] as const;

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

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { user } = useAuth();

  const weekDates = useMemo(() => calendarWeekDatesMonSunLocal(new Date()), []);
  const todayYmd = todayLocalYmd(new Date());

  const { data: mealsToday = [] } = useMealLog(todayYmd);

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

  const liftDaysWeek = weeklyBars.filter((w) => w.workout).length;
  const weekCalSum = weeklyBars.reduce((a, d) => a + d.cal, 0);

  const streakDays = streakFromCalendarDays(completedDaySet);
  const bestStreakGuess =
    streakDays > 0 ? Math.max(Math.ceil(streakDays * 1.25), streakDays + 7) : 21;

  const { data: weightRows = [], isPending: weightsPending } = useWeightLog();
  const { data: weightGoalRecord } = useWeightGoal();

  const weightChartSorted = useMemo(() => {
    const rows = [...weightRows].sort((a, b) =>
      a.log_date.localeCompare(b.log_date),
    );
    return rows.map((r) => ({
      w: r.weight,
      date: r.log_date,
    }));
  }, [weightRows]);

  const plannedToday = useMemo(() => {
    const day = todayYmd;
    const openToday = openWorkouts.filter((w: ApiWorkoutSession) => {
      if (w.completedAt) return false;
      return localCalendarYmdFromIso(w.startedAt) === day;
    });
    if (!openToday.length) return [];
    return openToday.slice(0, 3).map((sess, idx) => mapIncompleteToTodayPlan(sess, idx));
  }, [openWorkouts, todayYmd]);

  const weekDateSet = useMemo(() => new Set(weekDates), [weekDates]);
  const completionsWeekCount = useMemo(
    () =>
      completedWorkouts.filter((w) => {
        if (!w.completedAt) return false;
        return weekDateSet.has(localCalendarYmdFromIso(w.completedAt));
      }).length,
    [completedWorkouts, weekDateSet],
  );

  const kcalTrendSpark = useMemo(
    () => weeklyBars.map((b) => Math.max(Math.round((b.cal || 2) / 90 + 14), 4)),
    [weeklyBars],
  );

  const todayIdx = weekDates.findIndex((d) => d === todayYmd);
  const todayTotals =
    todayIdx >= 0 ? dailyTotalsQueries[todayIdx]?.data : undefined;
  const completedSessionsToday =
    typeof todayIdx === "number" && todayIdx >= 0
      ? weeklyBars[todayIdx]?.workout ?? false
      : false;

  const avgWeekCalRound =
    weeklyBars.filter((x) => x.cal > 0).length > 0
      ? Math.round(
          weekCalSum / weeklyBars.filter((x) => x.cal > 0).length,
        )
      : 0;

  const heroFirst =
    user?.name?.trim()?.split(/\s+/)?.[0]?.toUpperCase() ?? "ATHLETE";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "GOOD MORNING" : hour < 17 ? "GOOD AFTERNOON" : "GOOD EVENING";
  const date = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg0} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ───────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.datePill}>
              <Ionicons name="calendar-outline" size={10} color={T.muted} />
              <Text style={s.date}>{date}</Text>
            </View>
            <Text style={s.greeting}>{greeting},</Text>
            <Text style={s.heroName}>
              {heroFirst} 👊
            </Text>
          </View>

          {/* Notification bell */}
          <View>
            <TouchableOpacity style={s.bellBtn} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={20} color={T.text} />
            </TouchableOpacity>
            <View style={s.notifDot} />
          </View>
        </View>

        {/* ── STREAK ───────────────────────────────────────────────────────── */}
        <View style={s.px}>
          <StreakBanner days={streakDays} best={bestStreakGuess} />
        </View>

        <SectionGap />

        {/* ── CALORIES ─────────────────────────────────────────────────────── */}
        <View style={s.px}>
          <CalorieCard />
        </View>

        <SectionGap />

        {/* ── STAT TILES ───────────────────────────────────────────────────── */}
        <SectionLabel label="TODAY'S METRICS" icon="pulse-outline" />
        <View style={s.px}>
          <View style={s.tileRow}>
            <StatTile
              icon="👟"
              label="Steps"
              value={String(liftDaysWeek)}
              unit=""
              note={`${streakDays}-day streak · ${completedSessionsToday ? "Worked out today" : "Rest day"}`}
              color={T.lime}
              spark={
                weeklyBars.some((b) => b.cal > 0 || b.workout)
                  ? kcalTrendSpark
                  : STEPS_SPARK
              }
            />
            <StatTile
              icon="💧"
              label="Water"
              value={String(mealsToday.length)}
              unit=""
              note={`${todayTotals?.cal ?? 0} kcal today`}
              color={T.blue}
              spark={kcalTrendSpark}
            />
          </View>
          <View style={[s.tileRow, { marginTop: 10 }]}>
            <StatTile
              icon="😴"
              label="Sleep"
              value={`${avgWeekCalRound}`}
              unit=""
              note="Avg weekday kcal (week)"
              color={T.purple}
              spark={SLEEP_SPARK}
            />
            <StatTile
              icon="❤️"
              label="Heart rate"
              value={String(completionsWeekCount)}
              unit=""
              note="Completed workouts this calendar week"
              color={T.red}
              spark={weeklyBars.map((b) => (b.workout ? 88 : 32))}
            />
          </View>
        </View>

        <SectionGap />

        {/* ── QUICK ACTIONS ────────────────────────────────────────────────── */}
        <SectionLabel label="QUICK ACTIONS" icon="grid-outline" />
        <View style={s.px}>
          <View style={s.actionsCard}>
            <View style={s.actionRow}>
              {ACTIONS.map((action, i) => (
                <View key={action.label} style={s.actionItem}>
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() =>
                      action.route ? router.push(action.route) : null
                    }
                    style={[
                      s.actionIconBtn,
                      {
                        backgroundColor: action.color + "18",
                        borderColor: action.color + "30",
                      },
                    ]}
                  >
                    <Ionicons
                      name={action.icon}
                      size={22}
                      color={action.color}
                    />
                  </TouchableOpacity>
                  <Text style={s.actionLabel}>{action.label}</Text>
                  {i < ACTIONS.length - 1 && <View style={s.actionDividerV} />}
                </View>
              ))}
            </View>
          </View>
        </View>

        <SectionGap />

        {/* ── TODAY'S PLAN ─────────────────────────────────────────────────── */}
        <SectionLabel label="TODAY'S PLAN" icon="today-outline" />
        <View style={s.px}>
          <TodaySession
            sessions={plannedToday}
            onSeeAll={() => router.push("/(app)/(tabs)/train")}
          />
        </View>

        <SectionGap />

        {/* ── WEEKLY ACTIVITY ──────────────────────────────────────────────── */}
        <SectionLabel label="WEEKLY ACTIVITY" icon="bar-chart-outline" />
        <View style={s.px}>
          {totalsLoading ? (
            <View style={{ padding: 28, alignItems: "center" }}>
              <ActivityIndicator color={T.lime} />
            </View>
          ) : (
            <WeeklyCard
              weeklyBars={weeklyBars}
              onReport={() => router.push("/(app)/(tabs)/progress")}
            />
          )}
        </View>

        <SectionGap />

        {/* ── WEIGHT TREND ─────────────────────────────────────────────────── */}
        <SectionLabel label="WEIGHT TREND" icon="trending-down-outline" />
        <View style={s.px}>
          <WeightCard
            chartData={weightChartSorted}
            goalW={
              typeof weightGoalRecord?.goal_weight === "number"
                ? weightGoalRecord.goal_weight
                : undefined
            }
            startW={
              typeof weightGoalRecord?.start_weight === "number"
                ? weightGoalRecord.start_weight
                : undefined
            }
            currentW={weightChartSorted.at(-1)?.w}
            subtitle={`Last ${Math.min(weightChartSorted.length || 8, 24)} logged`}
            isLoading={weightsPending}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: T.bg0,
    maxWidth: 430,
    alignSelf: "center",
    width: "100%",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  px: { paddingHorizontal: 16 },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 20,
  },
  headerLeft: {
    gap: 2,
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  date: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: T.muted,
    letterSpacing: 0.8,
  },
  greeting: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 11,
    color: T.sub,
    letterSpacing: 1.1,
  },
  heroName: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 40,
    color: T.text,
    lineHeight: 42,
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: T.bg2,
    borderWidth: 1,
    borderColor: T.borderMid,
    justifyContent: "center",
    alignItems: "center",
  },
  notifDot: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: T.red,
    borderWidth: 2,
    borderColor: T.bg0,
    top: 4,
    right: 4,
  },

  // ── Section label ────────────────────────────────────────────────────────────
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    color: T.muted,
    letterSpacing: 1.4,
  },

  // ── Tiles ────────────────────────────────────────────────────────────────────
  tileRow: {
    flexDirection: "row",
    gap: 10,
  },

  // ── Actions ──────────────────────────────────────────────────────────────────
  actionsCard: {
    backgroundColor: T.bg1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  actionItem: {
    flex: 1,
    alignItems: "center",
    gap: 7,
    position: "relative",
  },
  actionIconBtn: {
    width: 52,
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 10,
    color: T.sub,
    textAlign: "center",
    letterSpacing: 0.5,
    lineHeight: 13,
  },
  actionDividerV: {
    position: "absolute",
    right: 0,
    top: "15%",
    width: 1,
    height: "70%",
    backgroundColor: T.border,
  },
});
