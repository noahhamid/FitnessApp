import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";

// Fixed: import directly from tokens, NOT from @/src/theme
import { COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_W = Math.min(SCREEN_W, 430) - 48; // 24px padding each side
const CHART_H = 100;
const PAD_X = 8;
const PAD_Y = 10;

// Mock data — replace with real store/hook data
const DATA = [
  { label: "Jan", value: 22.4 },
  { label: "Feb", value: 21.8 },
  { label: "Mar", value: 21.2 },
  { label: "Apr", value: 20.5 },
  { label: "May", value: 19.9 },
  { label: "Jun", value: 19.2 },
  { label: "Jul", value: 18.6 },
];

const GOAL = 15.0;
const COLOR = COLORS.blue;

export function BodyFatChart() {
  const values = DATA.map((d) => d.value);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const rng = max - min;

  const toX = (i: number) =>
    PAD_X + (i / (DATA.length - 1)) * (CHART_W - PAD_X * 2);
  const toY = (v: number) => PAD_Y + ((max - v) / rng) * (CHART_H - PAD_Y * 2);

  const linePath = DATA.map(
    (d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d.value)}`,
  ).join(" ");

  const areaPath = `${linePath} L${toX(DATA.length - 1)},${CHART_H} L${toX(0)},${CHART_H} Z`;

  const current = DATA[DATA.length - 1].value;
  const start = DATA[0].value;
  const dropped = +(start - current).toFixed(1);
  const progress = Math.min(
    Math.round(((start - current) / (start - GOAL)) * 100),
    100,
  );

  const lastX = toX(DATA.length - 1);
  const lastY = toY(current);

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.label}>BODY FAT</Text>
          <View style={s.valueRow}>
            <Text style={s.value}>{current}</Text>
            <Text style={s.unit}>%</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <View style={s.deltaPill}>
            <Text style={s.deltaText}>↓ {dropped}%</Text>
          </View>
          <Text style={s.goalText}>Goal: {GOAL}%</Text>
        </View>
      </View>

      {/* Chart */}
      <Svg width={CHART_W} height={CHART_H} style={s.chart}>
        <Defs>
          <LinearGradient id="bfGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={COLOR} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={COLOR} stopOpacity="0" />
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
            stroke={COLORS.border}
            strokeWidth="1"
            opacity="0.5"
          />
        ))}

        {/* Area fill */}
        <Path d={areaPath} fill="url(#bfGrad)" />

        {/* Line */}
        <Path
          d={linePath}
          fill="none"
          stroke={COLOR}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data dots */}
        {DATA.map((d, i) => (
          <Circle
            key={i}
            cx={toX(i)}
            cy={toY(d.value)}
            r={i === DATA.length - 1 ? 5 : 3}
            fill={i === DATA.length - 1 ? COLOR : COLORS.bg3}
            stroke={COLOR}
            strokeWidth="1.5"
          />
        ))}
      </Svg>

      {/* X-axis labels */}
      <View style={s.xAxis}>
        {DATA.map((d, i) => (
          <Text
            key={i}
            style={[s.xLabel, i === DATA.length - 1 && { color: COLOR }]}
          >
            {d.label}
          </Text>
        ))}
      </View>

      {/* Footer stats */}
      <View style={s.footer}>
        <View style={s.statItem}>
          <Text style={s.statVal}>{start}%</Text>
          <Text style={s.statLabel}>START</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statVal}>{GOAL}%</Text>
          <Text style={s.statLabel}>GOAL</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={[s.statVal, { color: COLOR }]}>{progress}%</Text>
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
    backgroundColor: `${COLORS.blue}18`,
    borderWidth: 1,
    borderColor: `${COLORS.blue}35`,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  deltaText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.blue,
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
