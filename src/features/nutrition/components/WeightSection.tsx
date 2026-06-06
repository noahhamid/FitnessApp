import { todayLocalYmd } from "@/src/features/workout/services/workout.service";
import type { WeightChartPoint } from "../types/weight.types";
import {
  useLogWeight,
  useWeightGoal,
  useWeightLog,
} from "../hooks/useWeight";
import { toWeightChartPoints } from "../services/weight.service";
import { FONTS } from "@/src/ui/tokens/typography";
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
  Polygon,
  Stop,
} from "react-native-svg";
import { PrimaryButton, SectionHeader, StatsCard } from "./StatsCard";

const { width: SW } = Dimensions.get("window");
const T = {
  bg: "#0A0A0C",
  bg0: "#0A0A0C",
  bg1: "#111114",
  bg2: "#18181D",
  bg3: "#222228",
  lime: "#C8F135",
  red: "#FF3D3D",
  orange: "#FF8A00",
  blue: "#3D8EFF",
  text: "#F2F2F5",
  sub: "#7A7A8C",
  muted: "#4A4A58",
  border: "#FFFFFF0F",
  borderMid: "#FFFFFF18",
  card: "#141414",
  accent: "#C8F135",
};
const COLORS = T;

// ─── Animated progress bar ───────────────────────────────────────────────────
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
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, { width }]} />
      {/* Shine overlay */}
      <Animated.View style={[styles.progressShine, { width }]} />
    </View>
  );
}

// ─── SVG Line chart ───────────────────────────────────────────────────────────
function WeightChart({ series }: { series: WeightChartPoint[] }) {
  const chartW = SW - 48;
  const chartH = 130;
  const padX = 16;
  const padY = 20;

  if (series.length < 2) {
    return (
      <View style={{ paddingVertical: 20 }}>
        <Text style={styles.chartLabel}>
          Log at least two weights to unlock this chart.
        </Text>
      </View>
    );
  }

  const weights = series.map((d) => d.w);
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;
  const div = Math.max(series.length - 1, 1);

  const toX = (i: number) =>
    padX + (i / div) * (chartW - padX * 2);
  const toY = (w: number) =>
    padY + (1 - (w - minW) / (maxW - minW)) * (chartH - padY * 2);

  const pts = series.map((d, i) => ({ x: toX(i), y: toY(d.w), ...d }));

  // Build filled area polygon points string
  const areaPoints = [
    `${pts[0].x},${chartH}`,
    ...pts.map((p) => `${p.x},${p.y}`),
    `${pts[pts.length - 1].x},${chartH}`,
  ].join(" ");

  return (
    <View>
      <Svg width={chartW} height={chartH}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={COLORS.accent} stopOpacity="0.35" />
            <Stop offset="100%" stopColor={COLORS.accent} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Filled area */}
        <Polygon points={areaPoints} fill="url(#areaGrad)" />

        {/* Grid lines */}
        {[0, 0.33, 0.66, 1].map((f, i) => (
          <Line
            key={i}
            x1={0}
            y1={padY + f * (chartH - padY * 2)}
            x2={chartW}
            y2={padY + f * (chartH - padY * 2)}
            stroke={COLORS.border}
            strokeWidth={1}
          />
        ))}

        {/* Connecting lines */}
        {pts.slice(0, -1).map((pt, i) => (
          <Line
            key={`line-${i}`}
            x1={pt.x}
            y1={pt.y}
            x2={pts[i + 1].x}
            y2={pts[i + 1].y}
            stroke={COLORS.accent}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        ))}

        {/* Data dots */}
        {pts.map((pt, i) => {
          const isLast = i === pts.length - 1;
          return (
            <Circle
              key={`dot-${i}-${pt.date}`}
              cx={pt.x}
              cy={pt.y}
              r={isLast ? 6 : 4}
              fill={isLast ? COLORS.accent : COLORS.card}
              stroke={COLORS.accent}
              strokeWidth={isLast ? 0 : 2}
            />
          );
        })}
      </Svg>

      {/* X-axis date labels */}
      <View style={styles.chartXAxis}>
        {series
          .filter((_, i) => i % 2 === 0)
          .map((d, i) => (
            <Text key={`lbl-${i}-${d.date}`} style={styles.chartLabel}>
              {String(d.date).split(/[\s,]+/).filter(Boolean).slice(-2)[0]}
            </Text>
          ))}
      </View>

      {/* Latest weight label positioned above last dot */}
      {(() => {
        const last = pts[pts.length - 1];
        return (
          <View
            style={[
              styles.latestBadge,
              { left: last.x - 32, top: last.y - 34 },
            ]}
          >
            <Text style={styles.latestBadgeText}>{last.w} kg</Text>
          </View>
        );
      })()}
    </View>
  );
}

function displayLogDate(logDate: string): string {
  try {
    return new Date(`${logDate}T00:00:00.000Z`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return logDate;
  }
}

// ─── History row ──────────────────────────────────────────────────────────────
function HistoryRow({
  entry,
  prev,
  isFirst,
}: {
  entry: { date: string; w: number };
  prev: { date: string; w: number } | null;
  isFirst: boolean;
}) {
  // FIX: diff = current entry vs previous chronological entry
  const diff = prev !== null ? +(entry.w - prev.w).toFixed(1) : null;
  const isDown = diff !== null && diff < 0;
  const isUp = diff !== null && diff > 0;

  return (
    <View
      style={[
        styles.historyRow,
        isFirst && { borderTopWidth: 1, borderTopColor: COLORS.border },
      ]}
    >
      <View style={[styles.historyDot, isFirst && styles.historyDotActive]} />
      <View style={styles.historyInfo}>
        <Text style={[styles.historyDate, isFirst && { color: COLORS.accent }]}>
          {entry.date}
        </Text>
        {isFirst && <Text style={styles.historyBadge}>latest</Text>}
      </View>
      <Text style={[styles.historyWeight, isFirst && { color: COLORS.accent }]}>
        {entry.w} kg
      </Text>
      {diff !== null && (
        <View
          style={[
            styles.diffBadge,
            isDown
              ? styles.diffDown
              : isUp
                ? styles.diffUp
                : styles.diffNeutral,
          ]}
        >
          <Text
            style={[
              styles.diffText,
              {
                color: isDown
                  ? COLORS.accent
                  : isUp
                    ? COLORS.red
                    : COLORS.muted,
              },
            ]}
          >
            {isDown ? "↓" : isUp ? "↑" : "–"} {Math.abs(diff)}
          </Text>
        </View>
      )}
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

  const chartPoints = useMemo(
    () => toWeightChartPoints(sorted),
    [sorted],
  );

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
  const lostTile = `${lostDelta >= 0 ? "-" : "+"}${Math.abs(lostDelta).toFixed(
    1,
  )}`;

  const journey = Math.abs(startW - goalW) || 1;
  const progressed = Math.abs(startW - current);
  const progress = Math.min(
    100,
    Number.isFinite(journey) ? Math.round((progressed / journey) * 100) : 0,
  );

  const toGoMag = +(Math.abs(current - goalW)).toFixed(1);

  const reversedHist = useMemo(
    () =>
      [...sorted].reverse().map((e) => ({
        date: displayLogDate(e.log_date),
        w: e.weight,
        id: e.id,
      })),
    [sorted],
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {logsPending ? (
        <View style={{ paddingVertical: 16, alignItems: "flex-start" }}>
          <ActivityIndicator color={COLORS.accent} />
        </View>
      ) : null}
      {/* ── Summary cards ── */}
      <View style={styles.cardGrid}>
        {[
          {
            label: "Current",
            value: `${(current ?? 0).toFixed(1)}`,
            unit: "kg",
            color: COLORS.text,
          },
          {
            label: "Lost",
            value: `${lostTile}`,
            unit: "kg",
            color: COLORS.accent,
          },
          {
            label: "To Goal",
            value:
              sorted.length === 0 ? `—` : `${toGoMag.toFixed(1)}`,
            unit: "kg",
            color: COLORS.orange,
          },
          {
            label: "Progress",
            value: `${sorted.length < 2 ? 0 : progress}`,
            unit: "%",
            color: COLORS.blue,
          },
        ].map((card) => (
          <View key={card.label} style={styles.cardCell}>
            <StatsCard {...card} />
          </View>
        ))}
      </View>

      {/* ── Goal progress ── */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>GOAL PROGRESS</Text>
          <Text style={[styles.sectionValue, { color: COLORS.accent }]}>
            {sorted.length < 2 ? 0 : progress}%
          </Text>
        </View>
        <AnimatedProgressBar progress={sorted.length < 2 ? 0 : progress} />
        <View style={styles.sectionRow}>
          <Text style={styles.mutedLabel}>Start: {startW.toFixed(1)} kg</Text>
          <Text style={styles.mutedLabel}>Goal: {goalW.toFixed(1)} kg</Text>
        </View>
      </View>

      {/* ── Weight trend ── */}
      <View style={[styles.section, { overflow: "visible" }]}>
        <SectionHeader title="Weight Trend" />
        <View style={{ marginTop: 8 }}>
          <WeightChart series={chartPoints} />
        </View>
      </View>

      {/* ── Log button ── */}
      <View style={{ marginBottom: 28 }}>
        <PrimaryButton
          label="⚖️  LOG TODAY'S WEIGHT"
          onPress={() => setShowLogModal(true)}
        />
      </View>

      {/* ── History ── */}
      <SectionHeader title="History" />
      <View style={styles.section}>
        {reversedHist.length === 0 ? (
          <Text style={styles.chartLabel}>No weight entries yet.</Text>
        ) : (
          reversedHist.map((entry, i) => (
            <HistoryRow
              key={entry.id}
              entry={{ date: entry.date, w: entry.w }}
              prev={
                reversedHist[i + 1]
                  ? { date: reversedHist[i + 1].date, w: reversedHist[i + 1].w }
                  : null
              }
              isFirst={i === 0}
            />
          ))
        )}
      </View>

      {/* ── Log modal ── */}
      <Modal visible={showLogModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowLogModal(false)}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalSheet}>
                {/* Handle */}
                <View style={styles.modalHandle} />

                <Text style={styles.modalTitle}>LOG WEIGHT</Text>

                {/* Unit toggle */}
                <View style={styles.unitToggle}>
                  {(["kg", "lbs"] as const).map((u) => (
                    <TouchableOpacity
                      key={u}
                      onPress={() => setUnit(u)}
                      style={[
                        styles.unitBtn,
                        unit === u && styles.unitBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.unitBtnText,
                          unit === u && styles.unitBtnTextActive,
                        ]}
                      >
                        {u.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Input */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    value={newWeight}
                    onChangeText={setNewWeight}
                    placeholder={unit === "kg" ? "82.0" : "180.0"}
                    placeholderTextColor={COLORS.muted}
                    keyboardType="decimal-pad"
                    style={styles.weightInput}
                    autoFocus
                  />
                  <Text style={styles.inputUnit}>{unit}</Text>
                </View>

                {/* Buttons */}
                <View style={styles.modalButtons}>
                  <View style={{ flex: 1 }}>
                    <PrimaryButton
                      label="CANCEL"
                      onPress={() => {
                        setShowLogModal(false);
                        setNewWeight("");
                      }}
                      outline
                    />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <PrimaryButton
                      label={logMut.isPending ? "..." : "SAVE"}
                      onPress={() => {
                        const parsed = Number.parseFloat(
                          newWeight.replace(",", "."),
                        );
                        if (!Number.isFinite(parsed) || parsed <= 0) {
                          Alert.alert("Invalid weight", "Enter a positive number.");
                          return;
                        }
                        const kg = unit === "lbs" ? parsed * 0.45359237 : parsed;
                        logMut.mutate(
                          { weight: +kg.toFixed(2), log_date: todayLocalYmd() },
                          {
                            onSuccess: () => {
                              setShowLogModal(false);
                              setNewWeight("");
                            },
                            onError: () =>
                              Alert.alert(
                                "Could not save",
                                "Try again when you are online.",
                              ),
                          },
                        );
                      }}
                    />
                  </View>
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
const styles = StyleSheet.create({
  // Grid
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
    marginBottom: 20,
  },
  cardCell: {
    width: "50%",
    paddingHorizontal: 8,
    marginBottom: 12,
  },

  // Section card
  section: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.muted,
    letterSpacing: 1,
  },
  sectionValue: {
    fontSize: 18,
    fontFamily: FONTS.extraBold,
  },
  mutedLabel: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 8,
  },

  // Progress bar
  progressTrack: {
    height: 10,
    backgroundColor: COLORS.bg2,
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.accent,
    borderRadius: 5,
  },
  progressShine: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 5,
  },

  // Chart
  chartXAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingHorizontal: 8,
  },
  chartLabel: {
    fontSize: 10,
    color: COLORS.muted,
  },
  latestBadge: {
    position: "absolute",
    backgroundColor: COLORS.accent + "22",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.accent + "55",
  },
  latestBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: COLORS.accent,
  },

  // History
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.bg3,
    borderWidth: 2,
    borderColor: COLORS.muted,
    marginRight: 12,
  },
  historyDotActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  historyInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  historyDate: {
    fontSize: 13,
    color: COLORS.text,
  },
  historyBadge: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.accent,
    backgroundColor: COLORS.accent + "22",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  historyWeight: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginRight: 8,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    minWidth: 52,
    alignItems: "center",
  },
  diffDown: { backgroundColor: COLORS.accent + "18" },
  diffUp: { backgroundColor: COLORS.red + "18" },
  diffNeutral: { backgroundColor: COLORS.bg2 },
  diffText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 44 : 32,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.extraBold,
    color: COLORS.text,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  unitToggle: {
    flexDirection: "row",
    backgroundColor: COLORS.bg2,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  unitBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: "center",
  },
  unitBtnActive: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  unitBtnText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: COLORS.muted,
  },
  unitBtnTextActive: {
    color: COLORS.bg,
  },
  inputWrapper: {
    position: "relative",
    marginBottom: 24,
  },
  weightInput: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    backgroundColor: COLORS.bg2,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingRight: 56,
    textAlign: "center",
  },
  inputUnit: {
    position: "absolute",
    right: 16,
    top: 18,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.muted,
  },
  modalButtons: {
    flexDirection: "row",
  },
});
