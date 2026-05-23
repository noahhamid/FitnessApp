import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Polygon,
  Polyline,
  Stop,
} from "react-native-svg";

// Fixed: import directly from tokens, NOT from @/src/theme
import { COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";
// Fixed: VOLUME_SPARKLINE belongs in workout service, not theme
import { VOLUME_SPARKLINE } from "@/src/features/workout/services/workout.service";

// ── Types ─────────────────────────────────────────────────────────────────────

type Session = {
  id: string;
  name: string;
  date: string;
  duration: string;
  volume: string;
  sets: number;
  exercises: string[];
};

type Props = {
  session: Session;
  onPress?: () => void;
};

// ── Sparkline ─────────────────────────────────────────────────────────────────

type SparkLineProps = {
  data: number[];
  color: string;
  W?: number;
  H?: number;
};

function SparkLine({ data, color, W = 72, H = 32 }: SparkLineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = max - min || 1;

  const toY = (v: number) => H - 6 - ((v - min) / rng) * (H - 12);
  const toX = (i: number) => (i / (data.length - 1)) * W;

  const linePts = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");

  // Fixed: was Svg.Polygon — Polygon must be imported directly from react-native-svg
  const polyPts = [
    `0,${H}`,
    ...data.map((v, i) => `${toX(i)},${toY(v)}`),
    `${W},${H}`,
  ].join(" ");

  const lastX = toX(data.length - 1);
  const lastY = toY(data[data.length - 1]);

  return (
    <Svg width={W} height={H}>
      <Defs>
        <LinearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.28" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Gradient fill */}
      <Polygon points={polyPts} fill="url(#sparkGrad)" />

      {/* Line */}
      <Polyline
        points={linePts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Fixed: was Svg.Circle — Circle must be imported directly */}
      <Circle cx={lastX} cy={lastY} r="3" fill={color} opacity="0.9" />
    </Svg>
  );
}

// ── Stat cell ─────────────────────────────────────────────────────────────────

type StatCellProps = {
  value: string;
  label: string;
};

function StatCell({ value, label }: StatCellProps) {
  return (
    <View style={s.historyStat}>
      <Text style={s.historyStatVal}>{value}</Text>
      <Text style={s.historyStatLabel}>{label}</Text>
    </View>
  );
}

// ── History Card ──────────────────────────────────────────────────────────────

export default function HistoryCard({ session, onPress }: Props) {
  return (
    <TouchableOpacity
      style={s.historyCard}
      onPress={onPress}
      activeOpacity={0.82}
    >
      {/* Accent top edge */}
      <View style={s.accentBar} />

      {/* Header */}
      <View style={s.historyTop}>
        <View style={s.historyTitleCol}>
          <Text style={s.historyName} numberOfLines={1}>
            {session.name}
          </Text>
          <Text style={s.historyDate}>{session.date}</Text>
        </View>
        <SparkLine data={VOLUME_SPARKLINE as number[]} color={COLORS.accent} />
      </View>

      <View style={s.divider} />

      {/* Stats */}
      <View style={s.historySummary}>
        <StatCell value={session.duration} label="Duration" />
        <View style={s.statDivider} />
        <StatCell value={session.volume} label="Volume" />
        <View style={s.statDivider} />
        <StatCell value={String(session.sets)} label="Sets" />
      </View>

      {/* Exercise tags */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tagScroll}
      >
        {session.exercises.map((ex) => (
          <View key={ex} style={s.historyExTag}>
            <Text style={s.historyExTagText}>{ex}</Text>
          </View>
        ))}
      </ScrollView>
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  historyCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: COLORS.accent,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    opacity: 0.55,
  },
  historyTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 10,
    marginBottom: 14,
  },
  historyTitleCol: {
    flex: 1,
    paddingRight: 12,
    gap: 4,
  },
  historyName: {
    // Fixed: hardcoded font string → FONTS token
    fontFamily: FONTS.extraBold,
    fontSize: 20,
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  historyDate: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 14,
  },
  historySummary: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  historyStat: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  historyStatVal: {
    fontFamily: FONTS.extraBold,
    fontSize: 20,
    color: COLORS.text,
  },
  historyStatLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  tagScroll: {
    gap: 7,
    paddingBottom: 2,
  },
  historyExTag: {
    backgroundColor: COLORS.bg3,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  historyExTagText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.muted,
    letterSpacing: 0.2,
  },
});
