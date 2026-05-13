import {
  ActionBtn,
  CalorieCard,
  StatTile,
  WeeklyCard,
  WeightCard,
} from "@/src/features/dashboard/components/DashboardComponents";
import { StreakBanner } from "@/src/features/dashboard/components/StreakBanner";
import { TodaySession } from "@/src/features/dashboard/components/TodaySession";
import { SLEEP_SPARK, STEPS_SPARK } from "@/src/theme";
import { router } from "expo-router";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Design tokens ────────────────────────────────────────────────────────────
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
  return <View style={{ height: 14 }} />;
}

function SectionLabel({ label }: { label: string }) {
  return <Text style={s.sectionLabel}>{label}</Text>;
}

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
        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.date}>{date}</Text>
            <Text style={s.greeting}>{greeting},</Text>
            <Text style={s.heroName}>ALEX 👊</Text>
          </View>

          {/* Notification bell */}
          <View>
            <TouchableOpacity style={s.bellBtn} activeOpacity={0.7}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
            </TouchableOpacity>
            <View style={s.notifDot} />
          </View>
        </View>

        {/* ── STREAK ─────────────────────────────────────────────────────────── */}
        <View style={s.px}>
          <StreakBanner days={12} best={21} />
        </View>

        <SectionGap />

        {/* ── CALORIES ───────────────────────────────────────────────────────── */}
        <View style={s.px}>
          <CalorieCard />
        </View>

        <SectionGap />

        {/* ── STAT TILES ─────────────────────────────────────────────────────── */}
        <SectionLabel label="TODAY'S METRICS" />
        <View style={s.px}>
          <View style={s.tileRow}>
            <StatTile
              icon="👟"
              label="Steps"
              value="7,842"
              unit=""
              note="↑ 12% vs yesterday"
              color={T.blue}
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
              color={T.orange}
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

        {/* ── QUICK ACTIONS ──────────────────────────────────────────────────── */}
        <SectionLabel label="QUICK ACTIONS" />
        <View style={s.px}>
          <View style={s.actionsCard}>
            <View style={s.actionRow}>
              <ActionBtn
                icon="🏋️"
                label={"LOG\nWORKOUT"}
                color={T.lime}
                onPress={() => router.push("/(app)/(tabs)/train")}
              />
              <View style={s.actionDividerV} />
              <ActionBtn
                icon="🍎"
                label={"LOG\nMEAL"}
                color={T.orange}
                onPress={() => router.push("/(app)/(tabs)/nutrition")}
              />
              <View style={s.actionDividerV} />
              <ActionBtn
                icon="⚡"
                label={"FOCUS\nMODE"}
                color={T.lime}
                onPress={() => router.push("/(app)/focus-mode")}
              />
              <View style={s.actionDividerV} />
              <ActionBtn
                icon="📸"
                label={"PROGRESS\nPHOTO"}
                color={T.purple}
                onPress={() => {}}
              />
            </View>
          </View>
        </View>

        <SectionGap />

        {/* ── TODAY'S PLAN ───────────────────────────────────────────────────── */}
        <View style={s.px}>
          <TodaySession onSeeAll={() => router.push("/(app)/(tabs)/train")} />
        </View>

        <SectionGap />

        {/* ── WEEKLY ACTIVITY ────────────────────────────────────────────────── */}
        <View style={s.px}>
          <WeeklyCard />
        </View>

        <SectionGap />

        {/* ── WEIGHT TREND ───────────────────────────────────────────────────── */}
        <View style={s.px}>
          <WeightCard />
        </View>

        {/* Bottom breathing room */}
        <View style={{ height: 32 }} />
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

  // Horizontal padding wrapper — keeps all sections aligned
  px: {
    paddingHorizontal: 16,
  },

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
    gap: 1,
  },
  date: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: T.muted,
    letterSpacing: 0.8,
    marginBottom: 4,
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
    borderColor: T.border,
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
    borderColor: T.bg0, // creates a "cut out" halo effect
    top: 4,
    right: 4,
  },

  // ── Section label ────────────────────────────────────────────────────────────
  sectionLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    color: T.muted,
    letterSpacing: 1.4,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  // ── Tiles ────────────────────────────────────────────────────────────────────
  tileRow: {
    flexDirection: "row",
    gap: 10,
  },

  // ── Actions card ─────────────────────────────────────────────────────────────
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
  },
  actionDividerV: {
    width: 1,
    height: 44,
    backgroundColor: T.border,
  },
});
