import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { CalorieCard } from "@/src/features/dashboard/components/CaloriCard";
import {
  WeeklyCard,
  WeightCard,
} from "@/src/features/dashboard/components/DashboardComponents";
import { StreakBanner } from "@/src/features/dashboard/components/StreakBanner";
import { TodaySession } from "@/src/features/dashboard/components/TodaySession";
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
import { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Modal,
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

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

type NotifType = "streak" | "nutrition" | "weight" | "workout";

interface AppNotif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  createdAt: Date;
}

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}

function NotifRow({
  notif,
  isRead,
  isLast,
}: {
  notif: AppNotif;
  isRead: boolean;
  isLast: boolean;
}) {
  return (
    <View style={[m.row, isLast && { borderBottomWidth: 0 }]}>
      <View style={[m.iconBadge, { backgroundColor: notif.color + "18" }]}>
        <Ionicons name={notif.icon} size={18} color={notif.color} />
      </View>
      <View style={m.rowContent}>
        <View style={m.titleRow}>
          <Text style={m.notifTitle} numberOfLines={1}>
            {notif.title}
          </Text>
          {!isRead && <View style={m.unreadDot} />}
        </View>
        <Text style={m.notifBody}>{notif.body}</Text>
      </View>
      <Text style={m.notifTime}>{formatTimeAgo(notif.createdAt)}</Text>
    </View>
  );
}

function NotificationModal({
  visible,
  onClose,
  notifications,
  readIds,
  onMarkAllRead,
}: {
  visible: boolean;
  onClose: () => void;
  notifications: AppNotif[];
  readIds: Set<string>;
  onMarkAllRead: () => void;
}) {
  const hasUnread = notifications.some((n) => !readIds.has(n.id));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Scrim */}
      <TouchableOpacity
        style={m.scrim}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Sheet */}
      <View style={m.sheet}>
        {/* Handle bar */}
        <View style={m.handle} />

        {/* Header row */}
        <View style={m.sheetHeader}>
          <Text style={m.sheetTitle}>NOTIFICATIONS</Text>
          {hasUnread ? (
            <TouchableOpacity
              onPress={onMarkAllRead}
              activeOpacity={0.75}
              style={m.markAllBtn}
            >
              <Ionicons name="checkmark-done-outline" size={13} color={T.lime} />
              <Text style={m.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          ) : (
            <View style={m.allReadPill}>
              <Ionicons name="checkmark-circle" size={12} color={T.sub} />
              <Text style={m.allReadText}>All caught up</Text>
            </View>
          )}
        </View>

        {/* Feed */}
        <ScrollView
          style={m.feedScroll}
          contentContainerStyle={m.feedContent}
          showsVerticalScrollIndicator={false}
        >
          {notifications.length === 0 ? (
            <View style={m.emptyState}>
              <Ionicons name="notifications-off-outline" size={36} color={T.muted} />
              <Text style={m.emptyText}>No notifications right now</Text>
              <Text style={m.emptySubText}>
                We'll let you know when something needs your attention.
              </Text>
            </View>
          ) : (
            <View style={m.feedCard}>
              {notifications.map((notif, i) => (
                <NotifRow
                  key={notif.id}
                  notif={notif}
                  isRead={readIds.has(notif.id)}
                  isLast={i === notifications.length - 1}
                />
              ))}
            </View>
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

// Notification modal styles
const m = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "#00000080",
  },
  sheet: {
    backgroundColor: T.bg0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: T.borderMid,
    maxHeight: "80%",
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.bg3,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  sheetTitle: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 24,
    color: T.text,
    letterSpacing: 1.5,
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: T.lime + "12",
    borderWidth: 1,
    borderColor: T.lime + "30",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  markAllText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: T.lime,
  },
  allReadPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: T.bg2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  allReadText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
  },
  feedScroll: { flex: 1 },
  feedContent: { paddingHorizontal: 16 },
  feedCard: {
    backgroundColor: T.bg1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowContent: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notifTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 13,
    color: T.text,
    flex: 1,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: T.lime,
    flexShrink: 0,
  },
  notifBody: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.sub,
    lineHeight: 17,
  },
  notifTime: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
    marginTop: 2,
    flexShrink: 0,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 10,
  },
  emptyText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: T.sub,
  },
  emptySubText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.muted,
    textAlign: "center",
    maxWidth: 240,
    lineHeight: 17,
  },
});

// ─────────────────────────────────────────────────────────────────────────────

function SectionGap() {
  return <View style={{ height: 24 }} />;
}

function SectionLabel({
  label,
  icon,
  right,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  right?: React.ReactNode;
}) {
  return (
    <View style={s.sectionLabelRow}>
      <View style={s.sectionLabelLeft}>
        <View style={s.sectionAccentBar} />
        <Ionicons name={icon} size={11} color={T.sub} />
        <Text style={s.sectionLabel}>{label}</Text>
      </View>
      {right && <View>{right}</View>}
    </View>
  );
}

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
    route: "/(app)/(tabs)/progress" as const,
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
    return openToday
      .slice(0, 3)
      .map((sess, idx) => mapIncompleteToTodayPlan(sess, idx));
  }, [openWorkouts, todayYmd]);

  const heroFirst =
    user?.name?.trim()?.split(/\s+/)?.[0]?.toUpperCase() ?? "ATHLETE";
  const firstName = user?.name?.trim()?.split(/\s+/)?.[0] ?? "Athlete";
  const initials = (user?.name?.trim() ?? "A")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const date = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  // ── Notification system ─────────────────────────────────────────────────
  const [showNotifications, setShowNotifications] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const todayWeekIdx = weekDates.findIndex((d) => d === todayYmd);
  const todayCalories =
    todayWeekIdx >= 0
      ? (dailyTotalsQueries[todayWeekIdx]?.data?.cal ?? 0)
      : 0;

  const notifications = useMemo<AppNotif[]>(() => {
    const now = new Date();
    const list: AppNotif[] = [];

    // Morning weight reminder (5 am – 10 am), if no weight logged today
    const weightLoggedToday = weightRows.some((r) => r.log_date === todayYmd);
    if (hour >= 5 && hour <= 10 && !weightLoggedToday) {
      list.push({
        id: `weight-${todayYmd}`,
        type: "weight",
        title: "Morning weigh-in",
        body: "⚖️ Good morning! Don't forget to log your daily body weight to keep your progress chart accurate.",
        icon: "scale-outline",
        color: T.blue,
        createdAt: new Date(now.getTime() - 25 * 60_000),
      });
    }

    // Workout/streak reminder (after noon), if no workout completed today
    const workoutToday = completedDaySet.has(todayYmd);
    if (hour >= 12 && !workoutToday) {
      list.push({
        id: `workout-${todayYmd}`,
        type: "workout",
        title:
          streakDays > 0
            ? `Don't break your ${streakDays}-day streak!`
            : "Time to train",
        body:
          streakDays > 0
            ? `🔥 You're on a ${streakDays}-day streak. Log your workout session today to keep it alive.`
            : "🔥 Start building your training streak — log your first session today.",
        icon: "barbell-outline",
        color: T.lime,
        createdAt: new Date(now.getTime() - 2 * 60 * 60_000),
      });
    }

    // Evening nutrition reminder (after 6 pm), if very few calories logged
    if (hour >= 18 && todayCalories < 400) {
      list.push({
        id: `nutrition-${todayYmd}`,
        type: "nutrition",
        title: "Missing evening logs",
        body: "🥑 Track your final meals to stay on top of your macro targets and hit your daily nutrition goal.",
        icon: "nutrition-outline",
        color: T.orange,
        createdAt: new Date(now.getTime() - 60 * 60_000),
      });
    }

    return list;
  }, [
    completedDaySet,
    hour,
    streakDays,
    todayCalories,
    todayYmd,
    weightRows,
  ]);

  const hasUnread = notifications.some((n) => !readIds.has(n.id));
  const markAllRead = () =>
    setReadIds(new Set(notifications.map((n) => n.id)));

  return (
    <SafeAreaView edges={["top"]} style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg0} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ───────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            {/* Date chip */}
            <View style={s.datePill}>
              <Ionicons name="calendar-outline" size={10} color={T.muted} />
              <Text style={s.date}>{date}</Text>
            </View>
            <Text style={s.greeting}>{greeting},</Text>
            <Text style={s.heroName}>{heroFirst}</Text>
          </View>

          {/* Right: notification bell */}
          <TouchableOpacity
            style={s.bellBtn}
            activeOpacity={0.75}
            onPress={() => setShowNotifications(true)}
          >
            <Ionicons name="notifications-outline" size={19} color={T.text} />
            {hasUnread && <View style={s.bellDot} />}
          </TouchableOpacity>
        </View>

        {/* Subtle header divider */}
        <View style={s.headerDivider} />

        {/* ── STREAK ───────────────────────────────────────────────────────── */}
        <View style={[s.px, { marginTop: 20 }]}>
          <StreakBanner days={streakDays} best={bestStreakGuess} />
        </View>

        <SectionGap />

        {/* ── CALORIES ─────────────────────────────────────────────────────── */}
        <View style={s.px}>
          <CalorieCard />
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
                    activeOpacity={0.7}
                    onPress={() => router.push(action.route)}
                    style={[
                      s.actionIconBtn,
                      {
                        backgroundColor: action.color + "15",
                        borderColor: action.color + "35",
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
            <View style={s.loadingBox}>
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

      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        readIds={readIds}
        onMarkAllRead={markAllRead}
      />
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

  // ── HEADER ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
  },
  headerLeft: {
    gap: 3,
    flex: 1,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.bg2,
    borderWidth: 1,
    borderColor: T.borderMid,
    alignItems: "center",
    justifyContent: "center",
  },
  bellDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.lime,
    borderWidth: 1.5,
    borderColor: T.bg0,
  },
  headerDivider: {
    height: 1,
    backgroundColor: T.border,
    marginHorizontal: 16,
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: T.bg2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  date: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: T.sub,
    letterSpacing: 0.8,
  },
  greeting: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: T.sub,
    letterSpacing: 0.1,
  },
  heroName: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 42,
    color: T.text,
    lineHeight: 42,
    letterSpacing: 0.5,
  },

  // ── SECTION LABELS ───────────────────────────────────────────────────────
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionLabelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionAccentBar: {
    width: 2,
    height: 13,
    borderRadius: 2,
    backgroundColor: T.lime + "70",
    marginRight: 2,
  },
  sectionLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    color: T.sub,
    letterSpacing: 2,
  },

  // ── QUICK ACTIONS ────────────────────────────────────────────────────────
  actionsCard: {
    backgroundColor: T.bg2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
    paddingVertical: 20,
    paddingHorizontal: 8,
    // Subtle top highlight to lift card off bg
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 0,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  actionItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    position: "relative",
  },
  actionIconBtn: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 10,
    color: T.sub,
    textAlign: "center",
    letterSpacing: 0.8,
    lineHeight: 13,
  },
  actionDividerV: {
    position: "absolute",
    right: 0,
    top: "10%",
    width: 1,
    height: "80%",
    backgroundColor: T.border,
  },

  // ── LOADING ──────────────────────────────────────────────────────────────
  loadingBox: {
    padding: 28,
    alignItems: "center",
    backgroundColor: T.bg2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
  },
});
