import { COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";
import { StyleSheet, Text, View } from "react-native";

type Props = { lift: string; weight: string; date?: string; prev?: string };

const LIFT_ICONS: Record<string, string> = {
  "Bench Press": "🏋️",
  Squat: "🦵",
  Deadlift: "⚡",
  "Overhead Press": "💪",
  "Pull-up": "🔝",
};

export function PRCard({ lift, weight, date, prev }: Props) {
  const icon = LIFT_ICONS[lift] ?? "🏆";

  const prevNum = prev ? parseFloat(prev) : null;
  const currNum = parseFloat(weight);
  const delta =
    prevNum !== null ? `+${(currNum - prevNum).toFixed(1)} kg` : null;

  return (
    <View style={s.card}>
      {/* Left: icon badge */}
      <View style={s.iconBadge}>
        <Text style={s.iconText}>{icon}</Text>
      </View>

      {/* Center: lift name + date */}
      <View style={s.middle}>
        <Text style={s.lift}>{lift}</Text>
        {date ? <Text style={s.date}>{date}</Text> : null}
      </View>

      {/* Right: weight + delta */}
      <View style={s.right}>
        <View style={s.weightRow}>
          <Text style={s.weight}>{weight}</Text>
          <Text style={s.unit}>kg</Text>
        </View>
        {delta ? (
          <View style={s.deltaPill}>
            <Text style={s.deltaText}>{delta}</Text>
          </View>
        ) : (
          <View style={s.prBadge}>
            <Text style={s.prText}>PR</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },

  // Icon badge
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: `${COLORS.accent}15`,
    borderWidth: 1,
    borderColor: `${COLORS.accent}30`,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 20,
  },

  // Middle
  middle: {
    flex: 1,
    gap: 3,
  },
  lift: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
    letterSpacing: 0.1,
  },
  date: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 0.2,
  },

  // Right
  right: {
    alignItems: "flex-end",
    gap: 5,
  },
  weightRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  weight: {
    fontFamily: FONTS.black,
    fontSize: 22,
    color: COLORS.accent,
    lineHeight: 24,
    letterSpacing: -0.5,
  },
  unit: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 2,
  },

  // Delta pill — matches BodyFatChart's deltaPill exactly
  deltaPill: {
    backgroundColor: `${COLORS.blue}18`,
    borderWidth: 1,
    borderColor: `${COLORS.blue}35`,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  deltaText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.blue,
  },

  // PR badge (when no prev weight)
  prBadge: {
    backgroundColor: `${COLORS.accent}18`,
    borderWidth: 1,
    borderColor: `${COLORS.accent}35`,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  prText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.accent,
    letterSpacing: 1.5,
  },
});
