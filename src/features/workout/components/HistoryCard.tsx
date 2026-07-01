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

import { COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";
import { VOLUME_SPARKLINE } from "@/src/features/workout/services/workout.service";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg0: "#121212",
  bg1: "#1E1E1E",
  bg2: "#282828",
  bg3: "#303030",
  border: "#FFFFFF0A",
  borderMid: "#FFFFFF14",
  gold: "#FFC700",
  goldDim: "#FFC70018",
  goldBorder: "#FFC70030",
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#555555",
};

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Sparkline ────────────────────────────────────────────────────────────────

function SparkLine({
  data,
  W = 64,
  H = 28,
}: {
  data: number[];
  W?: number;
  H?: number;
}) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = max - min || 1;

  const toY = (v: number) => H - 4 - ((v - min) / rng) * (H - 8);
  const toX = (i: number) => (i / (data.length - 1)) * W;

  const linePts = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
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
          <Stop offset="0" stopColor={T.gold} stopOpacity="0.22" />
          <Stop offset="1" stopColor={T.gold} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Polygon points={polyPts} fill="url(#sparkGrad)" />
      <Polyline
        points={linePts}
        fill="none"
        stroke={T.gold}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={lastX} cy={lastY} r="2.5" fill={T.gold} />
    </Svg>
  );
}

// ─── Stat Cell ────────────────────────────────────────────────────────────────

function StatCell({
  value,
  label,
  highlight = false,
}: {
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <View style={s.statCell}>
      <Text style={[s.statVal, highlight && { color: T.gold }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ─── History Card ─────────────────────────────────────────────────────────────

export default function HistoryCard({ session, onPress }: Props) {
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.82}>
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.titleCol}>
          <Text style={s.name} numberOfLines={1}>
            {session.name}
          </Text>
          <Text style={s.date}>{session.date}</Text>
        </View>
        <SparkLine data={VOLUME_SPARKLINE as number[]} />
      </View>

      {/* ── Stats ── */}
      <View style={s.statsRow}>
        <StatCell value={session.duration} label="DURATION" />
        <View style={s.statDivider} />
        <StatCell value={session.volume} label="VOLUME" highlight />
        <View style={s.statDivider} />
        <StatCell value={String(session.sets)} label="SETS" />
      </View>

      {/* ── Exercise tags ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tagScroll}
      >
        {session.exercises.map((ex) => (
          <View key={ex} style={s.tag}>
            <Text style={s.tagText}>{ex}</Text>
          </View>
        ))}
      </ScrollView>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    backgroundColor: T.bg1,
    borderWidth: 1,
    borderColor: T.borderMid,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    gap: 14,
    overflow: "hidden",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleCol: {
    flex: 1,
    paddingRight: 12,
    gap: 4,
  },
  name: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 20,
    color: T.text,
    letterSpacing: 0.3,
    lineHeight: 22,
  },
  date: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg2,
    borderRadius: 12,
    paddingVertical: 12,
  },
  statCell: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  statVal: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 20,
    color: T.text,
    lineHeight: 22,
  },
  statLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    color: T.muted,
    letterSpacing: 1.0,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: T.border,
  },

  // Tags
  tagScroll: {
    gap: 6,
    paddingBottom: 2,
  },
  tag: {
    backgroundColor: T.bg2,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: T.sub,
  },
});
