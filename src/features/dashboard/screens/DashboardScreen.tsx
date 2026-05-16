import { CalorieCard } from "@/src/features/dashboard/components/CaloriCard";
import {
  StatTile,
  WeeklyCard,
  WeightCard,
} from "@/src/features/dashboard/components/DashboardComponents";
import { StreakBanner } from "@/src/features/dashboard/components/StreakBanner";
import { TodaySession } from "@/src/features/dashboard/components/TodaySession";
import { SLEEP_SPARK, STEPS_SPARK } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
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

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
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
            <Text style={s.heroName}>ALEX 👊</Text>
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
          <StreakBanner days={12} best={21} />
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
              value="7,842"
              unit=""
              note="↑ 12% vs yesterday"
              color={T.lime}
              spark={STEPS_SPARK}
            />
            <StatTile
              icon="💧"
              label="Water"
              value="1.8"
              unit="L"
              note="Goal: 2.5 L"
              color={T.blue}
              spark={[]}
            />
          </View>
          <View style={[s.tileRow, { marginTop: 10 }]}>
            <StatTile
              icon="😴"
              label="Sleep"
              value="7.4"
              unit="hrs"
              note="Deep: 1h 52m"
              color={T.purple}
              spark={SLEEP_SPARK}
            />
            <StatTile
              icon="❤️"
              label="Heart rate"
              value="68"
              unit="bpm"
              note="Resting — good"
              color={T.red}
              spark={[]}
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
          <TodaySession onSeeAll={() => router.push("/(app)/(tabs)/train")} />
        </View>

        <SectionGap />

        {/* ── WEEKLY ACTIVITY ──────────────────────────────────────────────── */}
        <SectionLabel label="WEEKLY ACTIVITY" icon="bar-chart-outline" />
        <View style={s.px}>
          <WeeklyCard onReport={() => router.push("/(app)/(tabs)/progress")} />
        </View>

        <SectionGap />

        {/* ── WEIGHT TREND ─────────────────────────────────────────────────── */}
        <SectionLabel label="WEIGHT TREND" icon="trending-down-outline" />
        <View style={s.px}>
          <WeightCard />
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
