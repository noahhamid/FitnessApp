import { router } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import {
  StatTile,
  SectionTitle,
  CalorieCard,
  WeeklyCard,
  WeightCard,
  ActionBtn,
} from "@/src/features/dashboard/components/DashboardComponents";
import { StreakBanner } from "@/src/features/dashboard/components/StreakBanner";
import { TodaySession } from "@/src/features/dashboard/components/TodaySession";
import { COLORS, STEPS_SPARK, SLEEP_SPARK } from "@/src/theme";

export default function DashboardScreen() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "GOOD MORNING" : hour < 17 ? "GOOD AFTERNOON" : "GOOD EVENING";

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.heroName}>ALEX 👊</Text>
          </View>
          <View>
            <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
              <Text style={{ fontSize: 20 }}>🔔</Text>
            </TouchableOpacity>
            <View style={styles.notifDot} />
          </View>
        </View>
        <StreakBanner />
        <View style={styles.section}>
          <CalorieCard />
        </View>
        <View style={styles.section}>
          <View style={styles.tileRow}>
            <StatTile
              icon="👟"
              label="Steps"
              value="7,842"
              unit=""
              note="↑ 12% vs yesterday"
              color={COLORS.blue}
              spark={STEPS_SPARK}
            />
            <StatTile
              icon="💧"
              label="Water"
              value="1.8"
              unit="L"
              note="Goal: 2.5 L"
              color={COLORS.blue}
              spark={[]}
            />
          </View>
          <View style={[styles.tileRow, { marginTop: 11 }]}>
            <StatTile
              icon="😴"
              label="Sleep"
              value="7.4"
              unit="hrs"
              note="Deep: 1h 52m"
              color={COLORS.orange}
              spark={SLEEP_SPARK}
            />
            <StatTile
              icon="❤️"
              label="Heart rate"
              value="68"
              unit="bpm"
              note="Resting — good"
              color={COLORS.red}
              spark={[]}
            />
          </View>
        </View>
        <View style={styles.section}>
          <WeeklyCard />
        </View>
        <View style={styles.section}>
          <WeightCard />
        </View>
        <View style={styles.section}>
          <SectionTitle title="QUICK ACTIONS" action={undefined} onAction={undefined} />
          <View style={styles.actionRow}>
            <ActionBtn
              icon={"🏋️"}
              label={"LOG\nWORKOUT"}
              color={COLORS.accent}
              onPress={() => router.push("/(app)/(tabs)/train")}
            />
            <ActionBtn
              icon={"🍎"}
              label={"LOG\nMEAL"}
              color={COLORS.orange}
              onPress={() => router.push("/(app)/(tabs)/nutrition")}
            />
            <ActionBtn
              icon={"⚡"}
              label={"FOCUS\nMODE"}
              color={COLORS.accent}
              onPress={() => router.push("/(app)/focus-mode")}
            />
            <ActionBtn icon={"📸"} label={"PROGRESS\nPHOTO"} color={COLORS.blue} onPress={() => {}} />
          </View>
        </View>
        <TodaySession onSeeAll={() => router.push("/(app)/(tabs)/train")} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    maxWidth: 430,
    alignSelf: "center",
    width: "100%",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  section: { paddingHorizontal: 24, paddingTop: 14 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 52,
  },
  greeting: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 1.1,
  },
  heroName: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 36,
    color: COLORS.text,
    lineHeight: 38,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.bg2,
    justifyContent: "center",
    alignItems: "center",
  },
  notifDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red,
    top: 6,
    right: 6,
  },
  tileRow: { flexDirection: "row", gap: 11 },
  actionRow: { flexDirection: "row", justifyContent: "space-between" },
});
