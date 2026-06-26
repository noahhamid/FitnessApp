import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { WorkoutRow } from "./DashboardComponents";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg1: "#1E1E1E",
  bg2: "#282828",
  bg3: "#303030",
  border: "#FFFFFF0A",
  borderMid: "#FFFFFF14",
  gold: "#FFC700",
  goldDim: "#FFC70020",
  goldBorder: "#FFC70030",
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#555555",
};

type Session = {
  title: string;
  duration: string;
  sets: string;
  tag: string;
  tagColor: string;
};

type Props = {
  onSeeAll?: () => void;
  sessions?: Session[];
};

export function TodaySession({ onSeeAll, sessions = [] }: Props) {
  const totalMins = sessions.reduce(
    (acc, s) =>
      acc + (parseInt(String(s.duration).replace(/\D/g, "") || "0", 10) || 0),
    0,
  );

  return (
    <View style={s.card}>
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.title}>TODAY'S PLAN</Text>
          <Text style={s.subtitle}>
            {sessions.length} session{sessions.length !== 1 ? "s" : ""} ·{" "}
            {totalMins} min
          </Text>
        </View>
        {onSeeAll && (
          <TouchableOpacity
            onPress={onSeeAll}
            activeOpacity={0.7}
            style={s.seeAllBtn}
          >
            <Text style={s.seeAllText}>See all →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Progress strip ── */}
      <View style={s.progressTrack}>
        {sessions.map((session, i) => (
          <View
            key={i}
            style={[
              s.progressSeg,
              {
                // All segments gold — vary opacity to show composition
                // without breaking the monochromatic system
                backgroundColor: T.gold,
                opacity: 1 - i * (0.25 / Math.max(sessions.length - 1, 1)),
                flex:
                  parseInt(
                    String(session.duration).replace(/\D/g, "") || "1",
                    10,
                  ) || 1,
              },
            ]}
          />
        ))}
      </View>
      <Text style={s.progressLabel}>{totalMins} min planned · 0 completed</Text>

      {/* ── Session rows ── */}
      {sessions.length > 0 ? (
        <View style={s.rows}>
          {sessions.map((session, i) => (
            <WorkoutRow key={i} {...session} />
          ))}
        </View>
      ) : (
        <View style={s.emptyState}>
          <Text style={s.emptyTitle}>No sessions planned</Text>
          <Text style={s.emptySub}>Head to Train to build today's workout</Text>
        </View>
      )}

      {/* ── CTA ── */}
      <TouchableOpacity
        style={s.startBtn}
        activeOpacity={0.85}
        onPress={() => router.push("/(app)/(tabs)/train")}
      >
        <Text style={s.startBtnText}>START WORKOUT</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  card: {
    backgroundColor: T.bg1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.borderMid,
    marginHorizontal: 16,
    padding: 20,
    gap: 10,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { gap: 3 },
  title: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    color: T.sub,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
  },
  seeAllBtn: {
    backgroundColor: T.goldDim,
    borderWidth: 1,
    borderColor: T.goldBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  seeAllText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 11,
    color: T.gold,
  },

  // Progress strip
  progressTrack: {
    flexDirection: "row",
    height: 4,
    backgroundColor: T.bg3,
    borderRadius: 2,
    overflow: "hidden",
    gap: 2,
  },
  progressSeg: {
    height: "100%",
    borderRadius: 2,
  },
  progressLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },

  // Session rows
  rows: {
    marginTop: 4,
    gap: 0,
  },

  // Empty state
  emptyState: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 4,
  },
  emptyTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 13,
    color: T.sub,
  },
  emptySub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
  },

  // CTA
  startBtn: {
    marginTop: 6,
    backgroundColor: T.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  startBtnText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: "#121212",
    letterSpacing: 1.4,
  },
});
