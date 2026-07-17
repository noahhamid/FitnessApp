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
  bg0: "#0A0A0A",
  bg1: "#141414",
  bg2: "#1A1A1A",
  bg3: "#242424",
  border: "#FFFFFF0A",
  borderMid: "#FFFFFF14",
  gold: "#FF1F4D",
  goldDim: "#FF1F4D18",
  goldBorder: "#FF1F4D30",
  text: "#FFFFFF",
  sub: "#A8A8A8",
  muted: "#5A5A5A",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Session = {
  id: string;
  name: string;
  date: string;
  time?: string; // e.g. "7:14 AM"
  duration: string;
  volume: string;
  sets: number;
  prs?: number; // count of PRs hit this session
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
  const hasPRs = !!session.prs && session.prs > 0;

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.82}>
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.titleCol}>
          <Text style={s.name} numberOfLines={1}>
            {session.name}
          </Text>
          <Text style={s.dateTime}>
            {session.date}
            {session.time ? `  ·  ${session.time}` : ""}
          </Text>
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
        {hasPRs && (
          <>
            <View style={s.statDivider} />
            <StatCell value={`🔥 ${session.prs}`} label="PRS" highlight />
          </>
        )}
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
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    gap: 14,
    overflow: "hidden",
    // subtle depth instead of a border — keeps the "borderless" surface
    // while still separating the card from the #0A0A0A background
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
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
  dateTime: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg2,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  statCell: {
    flex: 1,
    alignItems: "center",
    gap: 4,
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
    height: 26,
    // no border — a faint fill on the bg2 surface reads as a seam,
    // not a "harsh" line
    backgroundColor: T.bg3,
  },

  // Tags
  tagScroll: {
    gap: 6,
    paddingBottom: 2,
  },
  tag: {
    backgroundColor: T.bg2,
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
