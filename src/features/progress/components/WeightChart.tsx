import {
  useWeightGoal,
  useWeightChart,
  useWeightLog,
} from "@/src/features/nutrition/hooks/useWeight";
import { fetchUserProfile } from "@/src/features/profile/services/profile.service";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

const T = {
  bg: "#121212",
  card: "#1E1E1E",
  gold: "#FFC700",
  text: "#FFFFFF",
  sub: "#A0A0A0",
  dim: "#3A3A3A",
  border: "#FFFFFF0D",
};

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_W = Math.min(SCREEN_W, 430) - 48;
const CHART_H = 110;
const PAD_X = 8;
const PAD_Y = 14;

// ── Bezier path builder (Catmull-Rom → cubic bezier) ─────────────────────────
function bezierLine(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;

  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[Math.max(i - 2, 0)];
    const p1 = pts[i - 1];
    const p2 = pts[i];
    const p3 = pts[Math.min(i + 1, pts.length - 1)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

function subSample<T>(arr: T[], maxCount: number): T[] {
  if (arr.length <= maxCount) return arr;
  const result: T[] = [];
  const step = (arr.length - 1) / (maxCount - 1);
  for (let i = 0; i < maxCount; i++) {
    result.push(arr[Math.round(i * step)]);
  }
  return result;
}

function shortDate(fullDate: string): string {
  return fullDate.replace(/,.*$/, "");
}

type WeightChartProps = { periodMonths?: number };

export function WeightChart({ periodMonths }: WeightChartProps) {
  const { data: allPts = [], isPending } = useWeightChart();
  const { data: rawLogs = [] } = useWeightLog();
  const { data: goalRec } = useWeightGoal();
  const { data: profile } = useQuery({
    queryKey: ["user", "profile"],
    queryFn: fetchUserProfile,
  });

  const pts = useMemo(() => {
    if (periodMonths === undefined) return allPts;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Math.round(periodMonths * 30));
    cutoff.setHours(0, 0, 0, 0);

    const validDates = new Set(
      rawLogs
        .filter((log) => {
          const [y, m, d] = log.log_date.split("-").map(Number);
          const logDate = new Date(y, (m || 1) - 1, d || 1);
          return logDate >= cutoff;
        })
        .map((log) => {
          const [y, m, d] = log.log_date.split("-").map(Number);
          return new Date(Date.UTC(y, (m || 1) - 1, d || 1)).toLocaleDateString(
            undefined,
            { month: "short", day: "numeric", year: "numeric" },
          );
        }),
    );

    return allPts.filter((pt) => validDates.has(pt.date));
  }, [allPts, rawLogs, periodMonths]);

  const baselineWeight = profile?.weightKg ?? 70;

  const syntheticData = useMemo(() => {
    if (pts.length === 0) {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      return [
        {
          w: Number(baselineWeight),
          date: past.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        },
        {
          w: Number(baselineWeight),
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        },
      ];
    }
    if (pts.length === 1) return [pts[0], pts[0]];
    return pts;
  }, [pts, baselineWeight]);

  const DATA = syntheticData;
  const isSynthetic = pts.length < 2;
  const lineColor = isSynthetic ? T.dim : T.gold;

  const GOAL =
    typeof goalRec?.goal_weight === "number" &&
    Number.isFinite(goalRec.goal_weight)
      ? goalRec.goal_weight
      : (pts.at(-1)?.w ?? baselineWeight);

  const values = DATA.map((d) => d.w);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const rng = max - min || 1;

  const toX = (i: number) =>
    PAD_X +
    (DATA.length <= 1 ? 0 : i / (DATA.length - 1)) * (CHART_W - PAD_X * 2);
  const toY = (v: number) => PAD_Y + ((max - v) / rng) * (CHART_H - PAD_Y * 2);

  const coordPts = DATA.map((d, i) => ({ x: toX(i), y: toY(d.w) }));
  const linePath = bezierLine(coordPts);
  const areaPath =
    coordPts.length >= 2
      ? `${linePath} L ${toX(DATA.length - 1)} ${CHART_H} L ${toX(0)} ${CHART_H} Z`
      : "";

  const lastPt = coordPts[coordPts.length - 1];
  const lastWeight = DATA[DATA.length - 1].w;
  const badgeLabel = `${lastWeight.toFixed(1)} kg`;
  const badgeW = badgeLabel.length * 6.5 + 14;
  const badgeH = 18;
  const badgeX = Math.min(lastPt.x - badgeW / 2, CHART_W - badgeW - PAD_X);
  const badgeY = lastPt.y - badgeH - 8;

  const goalY = toY(Math.max(GOAL, min + 0.5));

  const current =
    pts.length > 0
      ? (pts[pts.length - 1]?.w ?? baselineWeight)
      : baselineWeight;
  const start =
    typeof goalRec?.start_weight === "number"
      ? goalRec.start_weight
      : (pts[0]?.w ?? baselineWeight);

  const dropped = +(start - current).toFixed(1);
  const journey = Math.abs(start - GOAL) || 1;
  const progress = Math.min(
    Math.round((Math.abs(start - current) / journey) * 100),
    100,
  );

  const allXLabels = DATA.map((d, i) => ({
    label: shortDate(d.date),
    x: toX(i),
  }));
  const xLabels = subSample(allXLabels, 5);

  if (isPending) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 24,
        }}
      >
        <ActivityIndicator color={T.sub} />
        <Text style={s.loadingText}>Loading weight…</Text>
      </View>
    );
  }

  return (
    <View style={s.card}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View>
          <Text style={s.cardLabel}>CURRENT WEIGHT</Text>
          <View style={s.valueRow}>
            <Text style={s.value}>{current.toFixed(1)}</Text>
            <Text style={s.unit}>kg</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          {/* Delta: pure white, no red/gold — direction shown by sign only */}
          <Text style={s.deltaText}>
            {pts.length < 2
              ? "—"
              : `${dropped >= 0 ? "↓" : "↑"} ${Math.abs(dropped)} kg`}
          </Text>
          <Text style={s.goalLabel}>Goal: {(GOAL ?? 0).toFixed(1)} kg</Text>
        </View>
      </View>

      {/* ── Chart ──────────────────────────────────────────────────────────── */}
      <Svg width={CHART_W} height={CHART_H} style={s.chart}>
        <Defs>
          <LinearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
            <Stop offset="85%" stopColor={lineColor} stopOpacity="0.03" />
            <Stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((p, i) => (
          <Line
            key={i}
            x1={PAD_X}
            y1={PAD_Y + p * (CHART_H - PAD_Y * 2)}
            x2={CHART_W - PAD_X}
            y2={PAD_Y + p * (CHART_H - PAD_Y * 2)}
            stroke={T.border}
            strokeWidth="1"
          />
        ))}

        {/* Goal dashed line — gold, low opacity, stays as the one gold chart element */}
        <Line
          x1={PAD_X}
          y1={goalY}
          x2={CHART_W - PAD_X}
          y2={goalY}
          stroke={T.gold}
          strokeWidth="1"
          strokeDasharray="4 3"
          opacity="0.35"
        />
        <SvgText
          x={CHART_W - PAD_X - 2}
          y={goalY - 3}
          fontSize="8"
          fill={T.gold}
          opacity="0.5"
          textAnchor="end"
          fontFamily="DMSans_500Medium"
        >
          GOAL
        </SvgText>

        {/* Gradient area fill */}
        {areaPath ? <Path d={areaPath} fill="url(#wGrad)" /> : null}

        {/* Trend line */}
        <Path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Intermediate dots — hollow, dim stroke */}
        {coordPts.slice(0, -1).map((pt, i) => (
          <Circle
            key={`dot-${i}`}
            cx={pt.x}
            cy={pt.y}
            r={2.5}
            fill={T.card}
            stroke={T.dim}
            strokeWidth="1.5"
          />
        ))}

        {/* Last point — solid gold dot */}
        {!isSynthetic && (
          <Circle
            cx={lastPt.x}
            cy={lastPt.y}
            r={5}
            fill={T.gold}
            stroke={T.bg}
            strokeWidth="1.5"
          />
        )}

        {/* Current weight badge — dark card, gold text */}
        {!isSynthetic && badgeY > 0 && (
          <>
            <Rect
              x={badgeX}
              y={badgeY}
              width={badgeW}
              height={badgeH}
              rx={9}
              fill={T.card}
            />
            <SvgText
              x={badgeX + badgeW / 2}
              y={badgeY + 12}
              textAnchor="middle"
              fontSize="9.5"
              fill={T.gold}
              fontFamily="DMSans_500Medium"
              fontWeight="600"
            >
              {badgeLabel}
            </SvgText>
          </>
        )}
      </Svg>

      {/* ── X-axis labels — all muted, no gold on last label ───────────────── */}
      <View style={s.xAxis}>
        {xLabels.map((lbl, i) => (
          <Text key={`xl-${i}`} style={s.xLabel}>
            {lbl.label}
          </Text>
        ))}
      </View>

      {isSynthetic && (
        <Text style={s.syntheticNote}>
          Log your weight to start tracking real progress
        </Text>
      )}

      {/* ── Footer stats ────────────────────────────────────────────────────── */}
      <View style={s.footer}>
        <View style={s.statItem}>
          <Text style={s.statVal}>{start.toFixed(1)} kg</Text>
          <Text style={s.statLabel}>START</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statVal}>{(GOAL ?? 0).toFixed(1)} kg</Text>
          <Text style={s.statLabel}>GOAL</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          {/* Progress % is the one earned highlight in this footer */}
          <Text style={[s.statVal, pts.length >= 2 && { color: T.gold }]}>
            {pts.length >= 2 ? `${progress}%` : "—"}
          </Text>
          <Text style={s.statLabel}>PROGRESS</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    marginBottom: 0,
  },
  loadingText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.sub,
    marginTop: 8,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    color: T.sub,
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },
  value: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 28,
    color: T.text,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  unit: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 16,
    color: T.sub,
    marginBottom: 4,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  deltaText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 14,
    color: T.sub, // was conditional gold/red — now always muted
    letterSpacing: 0.3,
  },
  goalLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
  },

  // Chart
  chart: { alignSelf: "center" },
  xAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: PAD_X,
    marginTop: 6,
    marginBottom: 12,
  },
  xLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.sub, // was conditionally gold on last label — now uniform
    letterSpacing: 0.3,
  },
  syntheticNote: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
    textAlign: "center",
    paddingBottom: 10,
    opacity: 0.7,
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: T.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: T.dim,
    opacity: 0.4,
  },
  statVal: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 17,
    color: T.text,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    color: T.sub,
    letterSpacing: 1.5,
  },
});
