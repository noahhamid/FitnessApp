import { todayLocalYmd } from "@/src/features/workout/services/workout.service";
import type { WeightChartPoint } from "../types/weight.types";
import {
  useLogWeight,
  useWeightGoal,
  useWeightLog,
} from "../hooks/useWeight";
import { toWeightChartPoints } from "../services/weight.service";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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

const { width: SW } = Dimensions.get("window");

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg0: "#0A0A0C",
  bg1: "#111114",
  bg2: "#18181D",
  bg3: "#222228",
  lime: "#C8F135",
  red: "#FF3D3D",
  orange: "#F97316",
  blue: "#3B82F6",
  text: "#F2F2F5",
  sub: "#7A7A8C",
  muted: "#4A4A58",
  border: "#FFFFFF0F",
  borderMid: "#FFFFFF18",
};

// ─── Animated goal progress bar ──────────────────────────────────────────────
function AnimatedProgressBar({ progress }: { progress: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: progress,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  return (
    <View style={s.progressTrack}>
      <Animated.View style={[s.progressFill, { width }]} />
    </View>
  );
}

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

// Sub-sample to at most maxCount items, always keeping first & last
function subSample<T>(arr: T[], maxCount: number): T[] {
  if (arr.length <= maxCount) return arr;
  const result: T[] = [];
  const step = (arr.length - 1) / (maxCount - 1);
  for (let i = 0; i < maxCount; i++) {
    result.push(arr[Math.round(i * step)]);
  }
  return result;
}

// ─── SVG Line chart ───────────────────────────────────────────────────────────
function WeightChart({ series }: { series: WeightChartPoint[] }) {
  const chartW = SW - 64;
  const chartH = 120;
  const padX = 10;
  const padY = 18;   // extra top padding for the floating badge

  if (series.length < 2) {
    return (
      <View style={{ paddingVertical: 24, alignItems: "center" }}>
        <Text style={s.emptyChart}>
          Log at least two weights to see your trend.
        </Text>
      </View>
    );
  }

  const weights = series.map((d) => d.w);
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;
  const div = Math.max(series.length - 1, 1);

  const toX = (i: number) => padX + (i / div) * (chartW - padX * 2);
  const toY = (w: number) =>
    padY + (1 - (w - minW) / (maxW - minW)) * (chartH - padY * 2);

  const coordPts = series.map((d, i) => ({ x: toX(i), y: toY(d.w) }));

  // Bezier paths
  const linePath = bezierLine(coordPts);
  const areaPath =
    coordPts.length >= 2
      ? `${linePath} L ${toX(div)} ${chartH} L ${toX(0)} ${chartH} Z`
      : "";

  // Floating badge for last point
  const lastPt = coordPts[coordPts.length - 1];
  const lastW = series[series.length - 1].w;
  const badgeLabel = `${lastW.toFixed(1)} kg`;
  const badgeW = badgeLabel.length * 6.5 + 14;
  const badgeH = 17;
  const badgeX = Math.min(
    Math.max(lastPt.x - badgeW / 2, padX),
    chartW - badgeW - padX,
  );
  const badgeY = Math.max(lastPt.y - badgeH - 7, 2);

  // X-axis labels — at most 4, clean format "Jun 22"
  const allLabels = series.map((d) => d.date.replace(/,.*$/, ""));
  const xLabels = subSample(allLabels, 4);

  return (
    <View>
      <Svg width={chartW} height={chartH}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={T.lime} stopOpacity="0.26" />
            <Stop offset="80%" stopColor={T.lime} stopOpacity="0.04" />
            <Stop offset="100%" stopColor={T.lime} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((f, i) => (
          <Line
            key={i}
            x1={0}
            y1={padY + f * (chartH - padY * 2)}
            x2={chartW}
            y2={padY + f * (chartH - padY * 2)}
            stroke={T.border}
            strokeWidth={1}
          />
        ))}

        {/* Gradient area fill */}
        <Path d={areaPath} fill="url(#areaGrad)" />

        {/* Smooth bezier line */}
        <Path
          d={linePath}
          fill="none"
          stroke={T.lime}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Intermediate dots */}
        {coordPts.slice(0, -1).map((pt, i) => (
          <Circle
            key={`dot-${i}`}
            cx={pt.x}
            cy={pt.y}
            r={2.5}
            fill={T.bg2}
            stroke={T.lime}
            strokeWidth="1.5"
          />
        ))}

        {/* Last dot — larger filled */}
        <Circle
          cx={lastPt.x}
          cy={lastPt.y}
          r={5.5}
          fill={T.lime}
          stroke={T.bg0}
          strokeWidth="1.5"
        />

        {/* Floating current-weight badge */}
        <Rect
          x={badgeX}
          y={badgeY}
          width={badgeW}
          height={badgeH}
          rx={8.5}
          fill={T.lime + "22"}
          stroke={T.lime + "77"}
          strokeWidth="1"
        />
        <SvgText
          x={badgeX + badgeW / 2}
          y={badgeY + 11.5}
          textAnchor="middle"
          fontSize="9.5"
          fill={T.lime}
          fontFamily="DMSans_500Medium"
        >
          {badgeLabel}
        </SvgText>
      </Svg>

      {/* X-axis — subsampled, no duplicates */}
      <View style={s.chartXAxis}>
        {xLabels.map((lbl, i) => (
          <Text
            key={`xl-${i}`}
            style={[s.chartLabel, i === xLabels.length - 1 && { color: T.lime }]}
          >
            {lbl}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ─── History row ──────────────────────────────────────────────────────────────
function HistoryRow({
  entry,
  prev,
  isFirst,
  isLast,
}: {
  entry: { date: string; w: number };
  prev: { date: string; w: number } | null;
  isFirst: boolean;
  isLast: boolean;
}) {
  const diff = prev !== null ? +(entry.w - prev.w).toFixed(1) : null;
  const isDown = diff !== null && diff < 0;
  const isUp = diff !== null && diff > 0;

  return (
    <View style={[s.historyRow, isLast && { borderBottomWidth: 0 }]}>
      {/* Left: dot timeline marker */}
      <View style={s.historyTimeline}>
        <View style={[s.historyDot, isFirst && s.historyDotActive]} />
        {!isLast && <View style={s.historyLine} />}
      </View>

      {/* Center: date */}
      <View style={s.historyInfo}>
        <Text style={[s.historyDate, isFirst && { color: T.lime }]}>
          {entry.date}
        </Text>
        {isFirst && (
          <View style={s.latestPill}>
            <Text style={s.latestPillText}>LATEST</Text>
          </View>
        )}
      </View>

      {/* Right: weight + diff badge */}
      <View style={s.historyRight}>
        <Text style={[s.historyWeight, isFirst && { color: T.lime }]}>
          {entry.w} kg
        </Text>
        {diff !== null && (
          <View
            style={[
              s.diffBadge,
              isDown ? s.diffDown : isUp ? s.diffUp : s.diffNeutral,
            ]}
          >
            <Text
              style={[
                s.diffText,
                { color: isDown ? T.lime : isUp ? T.red : T.muted },
              ]}
            >
              {isDown ? "↓" : isUp ? "↑" : "—"} {Math.abs(diff)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function WeightSection() {
  const [showLogModal, setShowLogModal] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");

  const logMut = useLogWeight();

  const { data: rows = [], isPending: logsPending } = useWeightLog();
  const { data: goalRecord } = useWeightGoal();

  const sorted = useMemo(
    () => [...rows].sort((a, b) => a.log_date.localeCompare(b.log_date)),
    [rows],
  );

  const chartPoints = useMemo(() => toWeightChartPoints(sorted), [sorted]);

  const goalW =
    typeof goalRecord?.goal_weight === "number"
      ? goalRecord.goal_weight
      : sorted.at(-1)?.weight ?? 0;
  const startW =
    typeof goalRecord?.start_weight === "number"
      ? goalRecord.start_weight
      : sorted[0]?.weight ?? sorted.at(-1)?.weight ?? 0;

  const current = sorted.at(-1)?.weight ?? 0;

  const lostDelta = startW - current;
  const lostTile = `${lostDelta >= 0 ? "−" : "+"}${Math.abs(lostDelta).toFixed(1)}`;

  const journey = Math.abs(startW - goalW) || 1;
  const progressed = Math.abs(startW - current);
  const progress = Math.min(
    100,
    Number.isFinite(journey) ? Math.round((progressed / journey) * 100) : 0,
  );

  const toGoMag = +(Math.abs(current - goalW)).toFixed(1);

  const reversedHist = useMemo(
    () =>
      [...sorted].reverse().map((e) => {
        const d = new Date(`${e.log_date}T00:00:00.000Z`);
        const label = d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        return { date: label, w: e.weight, id: e.id };
      }),
    [sorted],
  );

  // 4 independent stat cards
  const statCards = [
    { label: "Current", value: current > 0 ? current.toFixed(1) : "—", unit: "kg", color: T.text },
    { label: "Lost", value: lostTile, unit: "kg", color: T.lime },
    { label: "To Goal", value: sorted.length === 0 ? "—" : `${toGoMag.toFixed(1)}`, unit: "kg", color: T.orange },
    { label: "Progress", value: `${sorted.length < 2 ? 0 : progress}`, unit: "%", color: T.blue },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.scroll}
    >
      {logsPending && (
        <View style={s.loadingRow}>
          <ActivityIndicator size="small" color={T.lime} />
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          4 INDEPENDENT FLOATING STAT CARDS
      ══════════════════════════════════════════════════════════════════ */}
      <View style={s.statsRow}>
        {statCards.map((stat) => (
          <View key={stat.label} style={s.statCard}>
            <Text style={[s.statValue, { color: stat.color }]}>
              {stat.value}
            </Text>
            <Text style={s.statUnit}>{stat.unit}</Text>
            <Text style={s.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* ══════════════════════════════════════════════════════════════════
          GOAL PROGRESS CARD
      ══════════════════════════════════════════════════════════════════ */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardTitle}>Goal Progress</Text>
          <Text style={[s.cardBadge, { color: T.lime }]}>
            {sorted.length < 2 ? 0 : progress}%
          </Text>
        </View>
        <AnimatedProgressBar progress={sorted.length < 2 ? 0 : progress} />
        <View style={s.progressLabels}>
          <Text style={s.progressLabel}>Start · {startW.toFixed(1)} kg</Text>
          <Text style={s.progressLabel}>Goal · {goalW.toFixed(1)} kg</Text>
        </View>
      </View>

      {/* ══════════════════════════════════════════════════════════════════
          WEIGHT TREND CHART
      ══════════════════════════════════════════════════════════════════ */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardTitle}>Weight Trend</Text>
        </View>
        <WeightChart series={chartPoints} />
      </View>

      {/* ══════════════════════════════════════════════════════════════════
          LOG WEIGHT — full-width solid lime pill button
      ══════════════════════════════════════════════════════════════════ */}
      <TouchableOpacity
        style={s.logBtn}
        activeOpacity={0.82}
        onPress={() => setShowLogModal(true)}
      >
        <Ionicons name="barbell-outline" size={16} color={T.bg0} />
        <Text style={s.logBtnText}>Log Weight</Text>
      </TouchableOpacity>

      {/* ══════════════════════════════════════════════════════════════════
          HISTORY — single unified dark surface card
      ══════════════════════════════════════════════════════════════════ */}
      {reversedHist.length > 0 && (
        <View style={s.historyCard}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>History</Text>
          </View>
          {reversedHist.map((entry, i) => (
            <HistoryRow
              key={entry.id}
              entry={{ date: entry.date, w: entry.w }}
              prev={
                reversedHist[i + 1]
                  ? { date: reversedHist[i + 1].date, w: reversedHist[i + 1].w }
                  : null
              }
              isFirst={i === 0}
              isLast={i === reversedHist.length - 1}
            />
          ))}
        </View>
      )}

      {reversedHist.length === 0 && !logsPending && (
        <View style={s.emptyState}>
          <Ionicons name="scale-outline" size={30} color={T.muted} />
          <Text style={s.emptyStateText}>No weight entries yet</Text>
          <Text style={s.emptyStateSub}>Tap Log Weight to get started</Text>
        </View>
      )}

      {/* ── Log modal ── */}
      <Modal visible={showLogModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            style={s.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowLogModal(false)}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={s.modalSheet}>
                <View style={s.modalHandle} />

                <View style={s.modalHeader}>
                  <Text style={s.modalTitle}>Log Weight</Text>
                  <TouchableOpacity
                    onPress={() => setShowLogModal(false)}
                    style={s.modalCloseBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={14} color={T.sub} />
                  </TouchableOpacity>
                </View>

                {/* Unit toggle */}
                <View style={s.unitToggle}>
                  {(["kg", "lbs"] as const).map((u) => (
                    <TouchableOpacity
                      key={u}
                      onPress={() => setUnit(u)}
                      style={[s.unitBtn, unit === u && s.unitBtnActive]}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.unitBtnText, unit === u && s.unitBtnTextActive]}>
                        {u.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Input */}
                <View style={s.inputWrapper}>
                  <TextInput
                    value={newWeight}
                    onChangeText={setNewWeight}
                    placeholder={unit === "kg" ? "82.0" : "180.0"}
                    placeholderTextColor={T.muted}
                    keyboardType="decimal-pad"
                    style={s.weightInput}
                    autoFocus
                  />
                  <Text style={s.inputUnit}>{unit}</Text>
                </View>

                {/* Buttons */}
                <View style={s.modalButtons}>
                  <TouchableOpacity
                    style={s.cancelBtn}
                    activeOpacity={0.8}
                    onPress={() => { setShowLogModal(false); setNewWeight(""); }}
                  >
                    <Text style={s.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <View style={{ width: 10 }} />
                  <TouchableOpacity
                    style={[s.saveBtn, logMut.isPending && { opacity: 0.6 }]}
                    activeOpacity={0.85}
                    disabled={logMut.isPending}
                    onPress={() => {
                      const parsed = Number.parseFloat(newWeight.replace(",", "."));
                      if (!Number.isFinite(parsed) || parsed <= 0) {
                        Alert.alert("Invalid weight", "Enter a positive number.");
                        return;
                      }
                      const kg = unit === "lbs" ? parsed * 0.45359237 : parsed;
                      logMut.mutate(
                        { weight: +kg.toFixed(2), log_date: todayLocalYmd() },
                        {
                          onSuccess: () => { setShowLogModal(false); setNewWeight(""); },
                          onError: () =>
                            Alert.alert("Could not save", "Try again when online."),
                        },
                      );
                    }}
                  >
                    <Text style={s.saveBtnText}>
                      {logMut.isPending ? "Saving…" : "Save"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  loadingRow: {
    paddingVertical: 12,
    alignItems: "flex-start",
  },

  // ══ 4 independent floating stat cards ════════════════════════════════════════
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: T.bg1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 22,
    lineHeight: 24,
    letterSpacing: -0.5,
  },
  statUnit: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.sub,
    lineHeight: 12,
  },
  statLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    color: T.muted,
    letterSpacing: 0.6,
    marginTop: 2,
  },

  // ══ Shared card ═══════════════════════════════════════════════════════════════
  card: {
    backgroundColor: T.bg1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: T.text,
  },
  cardBadge: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 20,
    lineHeight: 22,
  },

  // ══ Goal progress bar ═════════════════════════════════════════════════════════
  progressTrack: {
    height: 5,
    backgroundColor: T.bg3,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: T.lime,
    borderRadius: 3,
    shadowColor: T.lime,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },

  // ══ Chart ════════════════════════════════════════════════════════════════════
  emptyChart: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.muted,
    textAlign: "center",
  },
  chartXAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingHorizontal: 4,
  },
  chartLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },

  // ══ Log Weight button (full-width solid lime) ══════════════════════════════════
  logBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: T.lime,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 12,
    shadowColor: T.lime,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  logBtnText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 16,
    color: T.bg0,
    letterSpacing: 0.3,
  },

  // ══ History card (single unified dark surface) ════════════════════════════════
  historyCard: {
    backgroundColor: T.bg1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    gap: 10,
  },
  // Timeline node (dot + vertical line)
  historyTimeline: {
    alignItems: "center",
    width: 16,
    paddingTop: 3,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.bg3,
    borderWidth: 1.5,
    borderColor: T.muted,
  },
  historyDotActive: {
    backgroundColor: T.lime,
    borderColor: T.lime,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  historyLine: {
    width: 1,
    flex: 1,
    backgroundColor: T.border,
    marginTop: 3,
  },
  historyInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 1,
  },
  historyDate: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: T.text,
  },
  latestPill: {
    backgroundColor: T.lime + "1A",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  latestPillText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 8,
    color: T.lime,
    letterSpacing: 0.6,
  },
  historyRight: {
    alignItems: "flex-end",
    gap: 4,
    paddingTop: 1,
  },
  historyWeight: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: T.text,
  },
  diffBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 50,
    alignItems: "center",
  },
  diffDown: { backgroundColor: T.lime + "18" },
  diffUp: { backgroundColor: T.red + "18" },
  diffNeutral: { backgroundColor: T.bg3 },
  diffText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 6,
  },
  emptyStateText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: T.sub,
  },
  emptyStateSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.muted,
  },

  // ── Log Weight Modal ──────────────────────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: T.bg1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: T.borderMid,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: T.bg3,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 18,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 20,
    color: T.text,
    letterSpacing: -0.2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: T.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  unitToggle: {
    flexDirection: "row",
    backgroundColor: T.bg2,
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  unitBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  unitBtnActive: { backgroundColor: T.lime },
  unitBtnText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
    color: T.muted,
    letterSpacing: 0.4,
  },
  unitBtnTextActive: { color: T.bg0 },
  inputWrapper: {
    position: "relative",
    marginBottom: 20,
  },
  weightInput: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 32,
    color: T.text,
    backgroundColor: T.bg2,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingRight: 52,
    textAlign: "center",
  },
  inputUnit: {
    position: "absolute",
    right: 14,
    top: 17,
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: T.muted,
  },
  modalButtons: {
    flexDirection: "row",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.borderMid,
    backgroundColor: T.bg3,
    alignItems: "center",
  },
  cancelBtnText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: T.sub,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: T.lime,
    alignItems: "center",
  },
  saveBtnText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 14,
    color: T.bg0,
    letterSpacing: 0.5,
  },
});
