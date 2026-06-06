import {
  useWeightGoal,
  useWeightChart,
  useWeightLog,
} from "@/src/features/nutrition/hooks/useWeight";
import { fetchUserProfile } from "@/src/features/profile/services/profile.service";
import { COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";
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
  Stop,
  Text as SvgText,
} from "react-native-svg";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_W = Math.min(SCREEN_W, 430) - 48;
const CHART_H = 100;
const PAD_X = 8;
const PAD_Y = 10;

const COLOR = COLORS.accent;

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
    const daysBack = Math.round(periodMonths * 30);
    cutoff.setDate(cutoff.getDate() - daysBack);
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
          const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
          return dt.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
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
  const showChart = true;
  const isSynthetic = pts.length < 2;
  const lineColor = isSynthetic ? COLORS.muted : COLOR;

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

  const linePath = DATA.map(
    (d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d.w)}`,
  ).join(" ");

  const areaPath = `${linePath} L${toX(DATA.length - 1)},${CHART_H} L${toX(0)},${CHART_H} Z`;

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

  const goalY = toY(Math.max(GOAL, min + 0.5));

  if (isPending) {
    return (
      <View
        style={[s.card, { alignItems: "center", justifyContent: "center" }]}
      >
        <ActivityIndicator color={COLOR} />
        <Text style={s.mutedFoot}>Loading weight…</Text>
      </View>
    );
  }

  return (
    <View style={s.card}>
      <View style={s.header}>
        <View>
          <Text style={s.label}>WEIGHT</Text>
          <View style={s.valueRow}>
            <Text style={s.value}>{current.toFixed(1)}</Text>
            <Text style={s.unit}>kg</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <View style={s.deltaPill}>
            <Text style={s.deltaText}>
              {pts.length < 2
                ? "—"
                : `${dropped >= 0 ? "↓" : "↑"} ${Math.abs(dropped)} kg`}
            </Text>
          </View>
          <Text style={s.goalText}>Goal: {(GOAL ?? 0).toFixed(1)} kg</Text>
        </View>
      </View>

      {showChart ? (
        <>
          <Svg width={CHART_W} height={CHART_H} style={s.chart}>
            <Defs>
              <LinearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={lineColor} stopOpacity="0.2" />
                <Stop offset="100%" stopColor={lineColor} stopOpacity="0" />
              </LinearGradient>
            </Defs>

            {[0.25, 0.5, 0.75].map((p, i) => (
              <Line
                key={i}
                x1={PAD_X}
                y1={PAD_Y + p * (CHART_H - PAD_Y * 2)}
                x2={CHART_W - PAD_X}
                y2={PAD_Y + p * (CHART_H - PAD_Y * 2)}
                stroke={COLORS.border}
                strokeWidth="1"
                opacity="0.5"
              />
            ))}

            <Line
              x1={PAD_X}
              y1={goalY}
              x2={CHART_W - PAD_X}
              y2={goalY}
              stroke={COLOR}
              strokeWidth="1"
              strokeDasharray="4 3"
              opacity="0.4"
            />
            <SvgText
              x={CHART_W - PAD_X - 2}
              y={goalY - 3}
              fontSize="8"
              fill={COLOR}
              opacity="0.6"
              textAnchor="end"
              fontFamily={FONTS.medium}
            >
              GOAL
            </SvgText>

            <Path d={areaPath} fill="url(#wGrad)" />

            <Path
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {DATA.map((d, i) => (
              <Circle
                key={`${i}-${d.date}`}
                cx={toX(i)}
                cy={toY(d.w)}
                r={i === DATA.length - 1 ? 5 : 3}
                fill={i === DATA.length - 1 ? lineColor : COLORS.bg3}
                stroke={lineColor}
                strokeWidth="1.5"
              />
            ))}
          </Svg>

          <View style={s.xAxis}>
            {DATA.map((d, i) => (
              <Text
                key={`${d.date}-${i}`}
                style={[
                  s.xLabel,
                  i === DATA.length - 1 && !isSynthetic && { color: COLOR },
                ]}
              >
                {d.date.split(/\s|,/).slice(0, 2).join(" ")}
              </Text>
            ))}
          </View>

          {isSynthetic ? (
            <Text style={s.syntheticNote}>
              📍 This is your starting baseline. Log your weight to see real
              progress.
            </Text>
          ) : null}
        </>
      ) : null}

      <View style={s.footer}>
        <View style={s.statItem}>
          <Text style={s.statVal}>
            {pts.length || isSynthetic ? `${start.toFixed(1)} kg` : "—"}
          </Text>
          <Text style={s.statLabel}>START</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statVal}>{(GOAL ?? 0).toFixed(1)} kg</Text>
          <Text style={s.statLabel}>GOAL</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={[s.statVal, { color: COLOR }]}>
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
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    minHeight: 140,
    justifyContent: "center",
  },
  mutedFoot: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.muted,
    paddingVertical: 28,
    textAlign: "center",
  },
  syntheticNote: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.muted,
    textAlign: "center",
    paddingTop: 8,
    marginBottom: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 2,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  value: {
    fontFamily: FONTS.black,
    fontSize: 32,
    color: COLORS.text,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  unit: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.muted,
    marginBottom: 4,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  deltaPill: {
    backgroundColor: `${COLOR}18`,
    borderWidth: 1,
    borderColor: `${COLOR}35`,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  deltaText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLOR,
  },
  goalText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.muted,
  },
  chart: { alignSelf: "center" },
  xAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: PAD_X,
    marginTop: 6,
    marginBottom: 14,
  },
  xLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.muted,
    letterSpacing: 0.3,
    maxWidth: 56,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  statVal: {
    fontFamily: FONTS.black,
    fontSize: 16,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: 9,
    color: COLORS.muted,
    letterSpacing: 1.5,
  },
});
