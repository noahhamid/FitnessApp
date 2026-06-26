import { StyleSheet, Text, View } from "react-native";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg1: "#1E1E1E",
  bg2: "#282828",
  border: "#FFFFFF0A",
  borderMid: "#FFFFFF14",
  gold: "#FFC700",
  goldDim: "#FFC70020",
  goldBorder: "#FFC70030",
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#555555",
};

type Props = {
  days?: number;
  message?: string;
  best?: number;
};

export function StreakBanner({ days = 12, message, best = 21 }: Props) {
  const isRecord = days >= best;
  const pct = Math.min((days / best) * 100, 100);
  const daysToRecord = best - days;

  return (
    <View style={s.wrap}>
      {/* Left: day count */}
      <View style={s.countBlock}>
        <Text style={s.countNumber}>{days}</Text>
        <Text style={s.countUnit}>DAYS</Text>
      </View>

      <View style={s.divider} />

      {/* Center: message + bar */}
      <View style={s.body}>
        <Text style={s.message}>
          {message ??
            (isRecord ? "New personal record 🏆" : "Keep the streak going")}
        </Text>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${pct}%` }]} />
        </View>
        <Text style={s.progressLabel}>
          {isRecord
            ? "Personal best!"
            : `${daysToRecord} day${daysToRecord !== 1 ? "s" : ""} to beat your record`}
        </Text>
      </View>

      {/* Right: flame badge */}
      <View style={s.flameBadge}>
        <Text style={s.flame}>🔥</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    backgroundColor: T.bg1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.goldBorder,
    gap: 14,
  },

  // Left count block
  countBlock: {
    alignItems: "center",
    minWidth: 40,
  },
  countNumber: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 32,
    color: T.gold,
    lineHeight: 32,
  },
  countUnit: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 9,
    color: T.muted,
    letterSpacing: 1.2,
    marginTop: 2,
  },

  // Vertical divider
  divider: {
    width: 1,
    height: 36,
    backgroundColor: T.borderMid,
  },

  // Body
  body: {
    flex: 1,
    gap: 5,
  },
  message: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
    color: T.text,
    lineHeight: 16,
  },
  progressTrack: {
    height: 3,
    backgroundColor: T.bg2,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: T.gold,
  },
  progressLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },

  // Flame badge
  flameBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: T.goldDim,
    borderWidth: 1,
    borderColor: T.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  flame: {
    fontSize: 18,
  },
});
