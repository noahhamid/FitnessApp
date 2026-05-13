import { StyleSheet, Text, View } from "react-native";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg1: "#111114",
  bg3: "#222228",
  border: "#FFFFFF0F",
  lime: "#C8F135",
  orange: "#FF8A00",
  text: "#F2F2F5",
  sub: "#7A7A8C",
  muted: "#4A4A58",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Props = {
  days?: number;
  message?: string;
  /** Optional best streak to compare against */
  best?: number;
};

// ─── Component ────────────────────────────────────────────────────────────────
export function StreakBanner({ days = 12, message, best = 21 }: Props) {
  const isRecord = days >= best;
  const accentColor = isRecord ? T.lime : T.orange;
  const pct = Math.min((days / best) * 100, 100);

  return (
    <View style={[s.wrap, { borderColor: accentColor + "30" }]}>
      {/* Left: icon in tinted box */}
      <View style={[s.iconBox, { backgroundColor: accentColor + "1A" }]}>
        <Text style={s.icon}>🔥</Text>
      </View>

      {/* Center: text + progress bar */}
      <View style={s.body}>
        <Text style={s.message}>
          {message ??
            (isRecord
              ? `${days}-day streak — new record! 🏆`
              : `${days}-day streak — keep it going!`)}
        </Text>

        {/* Mini progress bar toward best */}
        <View style={s.progressTrack}>
          <View
            style={[
              s.progressFill,
              { width: `${pct}%`, backgroundColor: accentColor },
            ]}
          />
        </View>
        <Text style={s.progressLabel}>
          {isRecord
            ? "Personal best!"
            : `${best - days} days to beat your record`}
        </Text>
      </View>

      {/* Right: day count badge */}
      <View
        style={[
          s.badge,
          {
            backgroundColor: accentColor + "15",
            borderColor: accentColor + "35",
          },
        ]}
      >
        <Text style={[s.badgeDays, { color: accentColor }]}>{days}</Text>
        <Text style={[s.badgeUnit, { color: accentColor }]}>days</Text>
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 20,
  },
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
    backgroundColor: T.bg3,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },
  badge: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeDays: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 22,
    lineHeight: 22,
  },
  badgeUnit: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    letterSpacing: 0.5,
    marginTop: 1,
  },
});
