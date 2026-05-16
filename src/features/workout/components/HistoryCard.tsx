import { COLORS, VOLUME_SPARKLINE } from "@/src/theme";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Defs, LinearGradient, Polyline, Stop } from "react-native-svg";

const C = COLORS;

// ─── Sparkline with gradient fill ───────────────────────────────────────────
function SparkLine({ data, color, W = 72, H = 32 }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = max - min || 1;

  const pts = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * W},${H - 6 - ((v - min) / rng) * (H - 12)}`,
    )
    .join(" ");

  // Build polygon for the gradient fill: line points + bottom corners
  const polyPts = [
    `0,${H}`,
    ...data.map(
      (v, i) =>
        `${(i / (data.length - 1)) * W},${H - 6 - ((v - min) / rng) * (H - 12)}`,
    ),
    `${W},${H}`,
  ].join(" ");

  return (
    <Svg width={W} height={H}>
      <Defs>
        <LinearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.28" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      {/* Fill */}
      <Svg.Polygon points={polyPts} fill="url(#sparkGrad)" />
      {/* Line */}
      <Polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      {data.length > 0 &&
        (() => {
          const last = data[data.length - 1];
          const x = W;
          const y = H - 6 - ((last - min) / rng) * (H - 12);
          return <Svg.Circle cx={x} cy={y} r="3" fill={color} opacity="0.9" />;
        })()}
    </Svg>
  );
}

// ─── Stat cell ───────────────────────────────────────────────────────────────
function StatCell({ value, label }) {
  return (
    <View style={s.historyStat}>
      <Text style={s.historyStatVal}>{value}</Text>
      <Text style={s.historyStatLabel}>{label}</Text>
    </View>
  );
}

// ─── History Card ────────────────────────────────────────────────────────────
export default function HistoryCard({ session, onPress }) {
  return (
    <TouchableOpacity
      style={s.historyCard}
      onPress={onPress}
      activeOpacity={0.82}
    >
      {/* Accent top edge */}
      <View style={s.accentBar} />

      {/* Header row */}
      <View style={s.historyTop}>
        <View style={s.historyTitleCol}>
          <Text style={s.historyName} numberOfLines={1}>
            {session.name}
          </Text>
          <Text style={s.historyDate}>{session.date}</Text>
        </View>
        <SparkLine data={VOLUME_SPARKLINE} color={C.accent} />
      </View>

      {/* Divider */}
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

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  historyCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
  },

  /* Accent stripe at top */
  accentBar: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: C.accent,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    opacity: 0.55,
  },

  /* Header */
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
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 20,
    color: C.text,
    letterSpacing: 0.3,
  },
  historyDate: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: C.muted,
    letterSpacing: 0.2,
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 14,
  },

  /* Stats */
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
    backgroundColor: C.border,
  },
  historyStatVal: {
    fontFamily: "BarlowCondensed_800ExtraBold",
    fontSize: 20,
    color: C.text,
  },
  historyStatLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  /* Tags */
  tagScroll: {
    gap: 7,
    paddingBottom: 2,
  },
  historyExTag: {
    backgroundColor: C.bg3,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  historyExTagText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
    color: C.muted,
    letterSpacing: 0.2,
  },
});
