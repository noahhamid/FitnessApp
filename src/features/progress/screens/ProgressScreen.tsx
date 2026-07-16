import { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWeightLog } from "@/src/features/nutrition/hooks/useWeight";
import {
  mapApiSessionToHistoryRow,
  fetchWorkoutSessions,
  type ApiWorkoutSession,
} from "@/src/features/workout/services/workout.service";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Stop,
  Circle,
  Rect,
  Polyline,
} from "react-native-svg";
import { WeightChart } from "../components/WeightChart";

// ─── Token system ─────────────────────────────────────────────────────────────
const T = {
  canvas: "#121212",
  card: "#1E1E1E",
  cardBorder: "rgba(255,255,255,0.06)",
  white: "#FFFFFF",
  dim: "#A0A0A0",
  dim2: "#6E6E6E",
  ghost: "#2A2A2A",
  gold: "#FFC700",
  goldDim: "rgba(255,199,0,0.12)",
};

type Period = "7D" | "1M" | "3M" | "ALL";
const PERIODS: Period[] = ["7D", "1M", "3M", "ALL"];

const SPARK_W = 100;
const SPARK_H = 52;
const STRENGTH_CHART_W = 300;
const STRENGTH_CHART_H = 90;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function localYmdFromIso(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function periodCutoffDate(period: Period): Date | null {
  const days =
    period === "7D"
      ? 7
      : period === "1M"
        ? 30
        : period === "3M"
          ? 90
          : undefined;
  if (!days) return null;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return cutoff;
}

function streakFromDays(days: Set<string>): number {
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (let i = 0; i < 400; i++) {
    const ymd = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (days.has(ymd)) streak += 1;
    else break;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function volumeFromSets(raw: unknown): number {
  if (!Array.isArray(raw)) return 0;
  return raw.reduce((acc, row) => {
    if (row && typeof row === "object" && "weight" in row && "reps" in row) {
      return (
        acc + Number((row as any).weight ?? 0) * Number((row as any).reps ?? 0)
      );
    }
    return acc;
  }, 0);
}

function sessionVolumeKg(session: ApiWorkoutSession): number {
  return (session.exercises ?? []).reduce(
    (acc, e) => acc + volumeFromSets(e.sets),
    0,
  );
}

function fmtKg(n: number): string {
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

// ─── Bezier path ──────────────────────────────────────────────────────────────
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

// ─── Weight sparkline — small, sits in the body-weight card ───────────────────
function MiniSparkline({ data }: { data: { weight: number }[] }) {
  if (data.length < 2)
    return <View style={{ width: SPARK_W, height: SPARK_H }} />;

  const values = data.map((d) => d.weight);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const rng = max - min || 1;
  const PAD = 4;
  const toX = (i: number) =>
    PAD + (i / (data.length - 1)) * (SPARK_W - PAD * 2);
  const toY = (v: number) => PAD + ((max - v) / rng) * (SPARK_H - PAD * 2);
  const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.weight) }));
  const linePath = bezierLine(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${SPARK_H} L ${pts[0].x.toFixed(1)} ${SPARK_H} Z`;
  const last = pts[pts.length - 1];

  return (
    <Svg width={SPARK_W} height={SPARK_H}>
      <Defs>
        <LinearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={T.gold} stopOpacity="0.25" />
          <Stop offset="1" stopColor={T.gold} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill="url(#sparkFill)" stroke="none" />
      <Path
        d={linePath}
        fill="none"
        stroke={T.gold}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx={last.x}
        cy={last.y}
        r={3}
        fill={T.canvas}
        stroke={T.gold}
        strokeWidth="2.5"
      />
    </Svg>
  );
}

// ─── Strength chart — bigger version, drives the new hero section ─────────────
type ExerciseHistoryPoint = {
  date: Date;
  topWeight: number;
  topReps: number;
  sessionId: string;
};

function StrengthChart({ data }: { data: ExerciseHistoryPoint[] }) {
  if (data.length < 2) return null;
  const values = data.map((d) => d.topWeight);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const rng = max - min || 1;
  const PAD = 8;
  const toX = (i: number) =>
    PAD + (i / (data.length - 1)) * (STRENGTH_CHART_W - PAD * 2);
  const toY = (v: number) =>
    PAD + ((max - v) / rng) * (STRENGTH_CHART_H - PAD * 2);
  const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.topWeight) }));
  const linePath = bezierLine(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${STRENGTH_CHART_H} L ${pts[0].x.toFixed(1)} ${STRENGTH_CHART_H} Z`;
  const last = pts[pts.length - 1];

  return (
    <Svg width={STRENGTH_CHART_W} height={STRENGTH_CHART_H}>
      <Defs>
        <LinearGradient id="strengthFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={T.gold} stopOpacity="0.28" />
          <Stop offset="1" stopColor={T.gold} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill="url(#strengthFill)" stroke="none" />
      <Path
        d={linePath}
        fill="none"
        stroke={T.gold}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx={last.x}
        cy={last.y}
        r={4}
        fill={T.canvas}
        stroke={T.gold}
        strokeWidth="3"
      />
    </Svg>
  );
}

// ─── Volume bars — period-aware weekly trend ───────────────────────────────────
function VolumeBarsChart({
  buckets,
}: {
  buckets: { label: string; kg: number }[];
}) {
  const max = Math.max(...buckets.map((b) => b.kg), 1);
  return (
    <View style={s.volBarsRow}>
      {buckets.map((b, i) => (
        <View key={i} style={s.volBarCol}>
          <View style={s.volBarTrack}>
            <View
              style={[
                s.volBarFill,
                { height: `${Math.max(4, (b.kg / max) * 100)}%` },
              ]}
            />
          </View>
          <Text style={s.volBarLabel}>{b.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Tiny icon set ──────────────────────────────────────────────────────────────
function FlameIcon({
  size = 18,
  color = T.gold,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2c1 3-2 4-2 7a3 3 0 006 0c1.5 1.5 2 3.5 2 5a6 6 0 11-12 0c0-3 1.5-5 3-7 1-1.3 1.5-2.7 1-5z"
        fill={color}
      />
    </Svg>
  );
}
function DumbbellIcon({
  size = 18,
  color = T.gold,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="9" width="3" height="6" rx="1" fill={color} />
      <Rect x="19" y="9" width="3" height="6" rx="1" fill={color} />
      <Rect x="6" y="7" width="2.5" height="10" rx="1" fill={color} />
      <Rect x="15.5" y="7" width="2.5" height="10" rx="1" fill={color} />
      <Rect x="8.5" y="11" width="7" height="2" rx="1" fill={color} />
    </Svg>
  );
}
function ClockIcon({
  size = 18,
  color = T.gold,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <Path
        d="M12 7v5l3.5 2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}
function ArrowIcon({
  up,
  size = 12,
  color,
}: {
  up: boolean;
  size?: number;
  color: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline
        points={up ? "5,15 12,8 19,15" : "5,9 12,16 19,9"}
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

// ─── Section header with gold accent bar ──────────────────────────────────────
function SectionHeader({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={s.sectionHdr}>
      <View style={s.sectionTitleRow}>
        <View style={s.sectionAccent} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: T.ghost }} />;
}

// ─── Exercise picker chips ──────────────────────────────────────────────────────
function ExercisePickerRow({
  names,
  active,
  onSelect,
}: {
  names: string[];
  active: string | null;
  onSelect: (n: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.exercisePickerRow}
    >
      {names.map((name) => {
        const isActive = name === active;
        return (
          <TouchableOpacity
            key={name}
            onPress={() => onSelect(name)}
            style={[s.exerciseChip, isActive && s.exerciseChipActive]}
            activeOpacity={0.8}
          >
            <Text
              style={[s.exerciseChipText, isActive && s.exerciseChipTextActive]}
              numberOfLines={1}
            >
              {name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ProgressScreen() {
  const [period, setPeriod] = useState<Period>("1M");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [showAllRecent, setShowAllRecent] = useState(false);

  const { data: weightLogs = [] } = useWeightLog();
  const { data: completedWorkouts = [], isPending: workoutsLoading } = useQuery(
    {
      queryKey: ["progress", "workouts"] as const,
      queryFn: () => fetchWorkoutSessions("?limit=60&completed=true"),
    },
  );

  const periodCutoff = useMemo(() => periodCutoffDate(period), [period]);
  const periodMonths =
    period === "7D"
      ? 0.25
      : period === "1M"
        ? 1
        : period === "3M"
          ? 3
          : undefined;

  // ── Strength progress: derive per-exercise top-set history from sessions ──
  const exerciseHistoryByName = useMemo(() => {
    const map: Record<string, ExerciseHistoryPoint[]> = {};
    for (const session of completedWorkouts) {
      if (!session.completedAt) continue;
      const date = new Date(session.completedAt);
      for (const ex of session.exercises ?? []) {
        const sets = Array.isArray(ex.sets) ? ex.sets : [];
        let topWeight = 0;
        let topReps = 0;
        for (const row of sets) {
          if (
            row &&
            typeof row === "object" &&
            "weight" in row &&
            "reps" in row
          ) {
            const w = Number((row as any).weight ?? 0);
            const r = Number((row as any).reps ?? 0);
            if (w > topWeight) {
              topWeight = w;
              topReps = r;
            }
          }
        }
        if (topWeight <= 0) continue;
        if (!map[ex.exerciseName]) map[ex.exerciseName] = [];
        map[ex.exerciseName].push({
          date,
          topWeight,
          topReps,
          sessionId: session.id,
        });
      }
    }
    for (const name in map) {
      map[name].sort((a, b) => a.date.getTime() - b.date.getTime());
    }
    return map;
  }, [completedWorkouts]);

  const exerciseNames = useMemo(
    () =>
      Object.entries(exerciseHistoryByName)
        .sort((a, b) => {
          const aLast = a[1][a[1].length - 1]?.date.getTime() ?? 0;
          const bLast = b[1][b[1].length - 1]?.date.getTime() ?? 0;
          return bLast - aLast;
        })
        .map(([name]) => name),
    [exerciseHistoryByName],
  );

  const activeExercise =
    selectedExercise && exerciseHistoryByName[selectedExercise]
      ? selectedExercise
      : (exerciseNames[0] ?? null);

  const exercisePeriodHistory = useMemo(() => {
    if (!activeExercise) return [];
    const full = exerciseHistoryByName[activeExercise] ?? [];
    if (!periodCutoff) return full;
    return full.filter((p) => p.date >= periodCutoff);
  }, [activeExercise, exerciseHistoryByName, periodCutoff]);

  const strengthCurrent =
    exercisePeriodHistory.length > 0
      ? exercisePeriodHistory[exercisePeriodHistory.length - 1].topWeight
      : null;
  const strengthFirst =
    exercisePeriodHistory.length > 1
      ? exercisePeriodHistory[0].topWeight
      : null;
  const strengthDelta =
    strengthCurrent !== null && strengthFirst !== null
      ? strengthCurrent - strengthFirst
      : null;
  const strengthDeltaSign =
    strengthDelta !== null ? (strengthDelta <= 0 ? "−" : "+") : null;
  const strengthDeltaUp = strengthDelta !== null && strengthDelta > 0;

  const isPR = useMemo(() => {
    if (!activeExercise || exercisePeriodHistory.length === 0) return false;
    const allTime = exerciseHistoryByName[activeExercise] ?? [];
    const allTimeBest = Math.max(0, ...allTime.map((p) => p.topWeight));
    return (
      allTimeBest > 0 &&
      exercisePeriodHistory[exercisePeriodHistory.length - 1].topWeight >=
        allTimeBest
    );
  }, [activeExercise, exercisePeriodHistory, exerciseHistoryByName]);

  // ── Weight ──
  const sortedWeights = useMemo(
    () => [...weightLogs].sort((a, b) => a.log_date.localeCompare(b.log_date)),
    [weightLogs],
  );
  const periodWeights = useMemo(() => {
    if (!periodCutoff) return sortedWeights;
    return sortedWeights.filter(
      (w) => new Date(`${w.log_date}T00:00:00`) >= periodCutoff,
    );
  }, [sortedWeights, periodCutoff]);
  const currentWeight = periodWeights.at(-1)?.weight ?? null;
  const startWeight = periodWeights.length > 1 ? periodWeights[0].weight : null;
  const weightDelta =
    currentWeight !== null && startWeight !== null
      ? currentWeight - startWeight
      : null;
  const deltaSign =
    weightDelta !== null ? (weightDelta <= 0 ? "−" : "+") : null;
  const deltaAbs =
    weightDelta !== null ? Math.abs(weightDelta).toFixed(1) : null;
  const deltaUp = weightDelta !== null && weightDelta > 0;

  // ── Streak (global — a streak is inherently "current", not date-range scoped) ──
  const completedDaySet = useMemo(() => {
    const set = new Set<string>();
    for (const sess of completedWorkouts) {
      if (sess.completedAt) set.add(localYmdFromIso(sess.completedAt));
    }
    return set;
  }, [completedWorkouts]);
  const streakDays = useMemo(
    () => streakFromDays(completedDaySet),
    [completedDaySet],
  );

  // ── Sessions + avg duration — now genuinely period-scoped ──
  const periodSessions = useMemo(
    () =>
      completedWorkouts.filter((w) => {
        if (!w.completedAt) return false;
        return periodCutoff ? new Date(w.completedAt) >= periodCutoff : true;
      }),
    [completedWorkouts, periodCutoff],
  );
  const periodAvgDurationMin = useMemo(() => {
    const withDuration = periodSessions.filter(
      (w) => w.completedAt && w.startedAt,
    );
    if (!withDuration.length) return null;
    const totalMin = withDuration.reduce(
      (acc, sess) =>
        acc +
        (new Date(sess.completedAt!).getTime() -
          new Date(sess.startedAt).getTime()) /
          60_000,
      0,
    );
    return Math.round(totalMin / withDuration.length);
  }, [periodSessions]);

  // ── Recent workouts (period-scoped, expandable) ──
  const filteredCompletedSessions = useMemo(
    () =>
      [...periodSessions].sort(
        (a, b) =>
          new Date(b.completedAt!).getTime() -
          new Date(a.completedAt!).getTime(),
      ),
    [periodSessions],
  );
  const recentSessions = useMemo(
    () =>
      filteredCompletedSessions
        .slice(0, showAllRecent ? undefined : 4)
        .map(mapApiSessionToHistoryRow),
    [filteredCompletedSessions, showAllRecent],
  );

  // ── Training volume — period-aware weekly bars + trend badge ──
  const volumeBuckets = useMemo(() => {
    const bucketCount = period === "7D" ? 1 : period === "1M" ? 4 : 8;
    const now = new Date();
    const buckets: { label: string; kg: number }[] = [];
    const ranges: { start: Date; end: Date }[] = [];
    for (let i = bucketCount - 1; i >= 0; i--) {
      const end = new Date(now);
      end.setDate(end.getDate() - i * 7);
      end.setHours(23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      ranges.push({ start, end });
      buckets.push({ label: i === 0 ? "Now" : `-${i}w`, kg: 0 });
    }
    for (const session of completedWorkouts) {
      if (!session.completedAt) continue;
      const d = new Date(session.completedAt);
      const vol = sessionVolumeKg(session);
      for (let idx = 0; idx < ranges.length; idx++) {
        if (d >= ranges[idx].start && d <= ranges[idx].end) {
          buckets[idx].kg += vol;
          break;
        }
      }
    }
    return buckets;
  }, [completedWorkouts, period]);

  const volumeTrend = useMemo(() => {
    const cutoff = periodCutoff ?? new Date(0);
    const spanMs = periodCutoff ? Date.now() - periodCutoff.getTime() : null;
    let currentKg = 0;
    for (const session of completedWorkouts) {
      if (!session.completedAt) continue;
      if (new Date(session.completedAt) >= cutoff)
        currentKg += sessionVolumeKg(session);
    }
    let prevKg = 0;
    if (spanMs) {
      const prevStart = new Date(cutoff.getTime() - spanMs);
      for (const session of completedWorkouts) {
        if (!session.completedAt) continue;
        const d = new Date(session.completedAt);
        if (d >= prevStart && d < cutoff) prevKg += sessionVolumeKg(session);
      }
    }
    const pct =
      prevKg > 0
        ? Math.round(((currentKg - prevKg) / prevKg) * 100)
        : currentKg > 0
          ? 100
          : 0;
    return { currentKg, pct };
  }, [completedWorkouts, periodCutoff]);

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={T.canvas} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={s.hdr}>
        <Text style={s.hdrEyebrow}>PERFORMANCE</Text>
        <Text style={s.hdrTitle}>Progress</Text>
      </View>

      {/* ── Period tabs — now genuinely governs every section below ─────────── */}
      <View style={s.tabBarOuter}>
        <View style={s.tabBar}>
          {PERIODS.map((p) => {
            const active = period === p;
            return (
              <TouchableOpacity
                key={p}
                style={[s.tab, active && s.tabActive]}
                onPress={() => setPeriod(p)}
                activeOpacity={0.8}
              >
                <Text style={[s.tabText, active && s.tabTextActive]}>{p}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Strength progress — the new lead section ─────────────────────── */}
        <View style={s.section}>
          <SectionHeader
            title="Strength progress"
            right={<Text style={s.sectionSub}>{period}</Text>}
          />

          {exerciseNames.length === 0 ? (
            <View style={s.emptyState}>
              <DumbbellIcon size={22} color={T.dim} />
              <Text style={[s.emptyText, { marginTop: 8 }]}>
                Log a workout to start tracking strength progress
              </Text>
            </View>
          ) : (
            <View style={s.strengthCard}>
              <ExercisePickerRow
                names={exerciseNames}
                active={activeExercise}
                onSelect={setSelectedExercise}
              />

              {exercisePeriodHistory.length === 0 ? (
                <Text
                  style={[
                    s.emptyText,
                    { textAlign: "center", paddingVertical: 20 },
                  ]}
                >
                  No {activeExercise} logged in this period
                </Text>
              ) : (
                <>
                  <View style={s.strengthTopRow}>
                    <View style={s.wNumberRow}>
                      <Text style={s.wNumber}>
                        {fmtKg(strengthCurrent ?? 0)}
                      </Text>
                      <Text style={s.wUnit}>kg</Text>
                      {isPR && (
                        <View style={s.prBadge}>
                          <Text style={s.prBadgeText}>PR</Text>
                        </View>
                      )}
                    </View>
                    {strengthDelta !== null && (
                      <View style={s.wDeltaRow}>
                        <ArrowIcon up={strengthDeltaUp} color={T.dim} />
                        <Text style={s.wDelta}>
                          {strengthDeltaSign}
                          {fmtKg(Math.abs(strengthDelta))} kg ·{" "}
                          {period.toLowerCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  {exercisePeriodHistory.length >= 2 ? (
                    <StrengthChart data={exercisePeriodHistory} />
                  ) : (
                    <Text style={[s.emptyText, { marginTop: 10 }]}>
                      Log {activeExercise} again to see a trend
                    </Text>
                  )}
                </>
              )}
            </View>
          )}
        </View>

        {/* ── Stat tiles — streak global, sessions + avg min now period-scoped ── */}
        <View style={s.statsGrid}>
          <View style={s.statTile}>
            <View style={s.statIconWrap}>
              <FlameIcon />
            </View>
            <Text style={s.statNum}>{streakDays}</Text>
            <Text style={s.statLabel}>DAY STREAK</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statTile}>
            <View style={s.statIconWrap}>
              <DumbbellIcon />
            </View>
            <Text style={s.statNum}>{periodSessions.length}</Text>
            <Text style={s.statLabel}>SESSIONS</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statTile}>
            <View style={s.statIconWrap}>
              <ClockIcon />
            </View>
            <Text style={s.statNum}>{periodAvgDurationMin ?? "—"}</Text>
            <Text style={s.statLabel}>AVG MIN</Text>
          </View>
        </View>

        {/* ── Body weight — demoted from hero, still fully functional ────────── */}
        {/* ── Body weight — compact teaser, full detail lives in the Weight tab ── */}
        <View style={s.section}>
          <SectionHeader
            title="Body weight"
            right={<Text style={s.sectionSub}>{period}</Text>}
          />
          <TouchableOpacity
            style={s.weightHero}
            activeOpacity={0.85}
            onPress={() => router.push("/(tabs)/weight")}
          >
            <View style={s.weightLeft}>
              <Text style={s.wEyebrow}>CURRENT WEIGHT</Text>
              <View style={s.wNumberRow}>
                <Text style={s.wNumber}>
                  {currentWeight !== null ? currentWeight.toFixed(1) : "—"}
                </Text>
                <Text style={s.wUnit}>kg</Text>
              </View>
              {weightDelta !== null && deltaSign !== null && (
                <View style={s.wDeltaRow}>
                  <ArrowIcon up={deltaUp} color={T.dim} />
                  <Text style={s.wDelta}>
                    {deltaSign}
                    {deltaAbs} kg · {period.toLowerCase()}
                  </Text>
                </View>
              )}
            </View>
            <View style={{ alignItems: "center", gap: 6 }}>
              <MiniSparkline data={periodWeights} />
              <Text style={s.sectionLink}>Full detail ›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Training volume — real period-aware trend, not a fixed compare ── */}
        <View style={s.section}>
          <SectionHeader
            title="Training volume"
            right={
              period !== "ALL" && volumeTrend.pct !== 0 ? (
                <View style={s.volBadge}>
                  <ArrowIcon
                    up={volumeTrend.pct > 0}
                    size={10}
                    color={T.gold}
                  />
                  <Text style={s.volPct}>{Math.abs(volumeTrend.pct)}%</Text>
                </View>
              ) : undefined
            }
          />
          <View style={s.card}>
            {volumeBuckets.every((b) => b.kg === 0) ? (
              <View style={s.emptyState}>
                <Text style={s.emptyText}>
                  Complete a workout to see volume
                </Text>
              </View>
            ) : volumeBuckets.length === 1 ? (
              <View style={s.cardPad}>
                <Text style={s.volRowLabel}>Total this period</Text>
                <View style={s.wNumberRow}>
                  <Text style={[s.wNumber, { fontSize: 40, lineHeight: 42 }]}>
                    {Math.round(volumeBuckets[0].kg).toLocaleString()}
                  </Text>
                  <Text style={s.wUnit}>kg</Text>
                </View>
              </View>
            ) : (
              <View style={s.cardPad}>
                <VolumeBarsChart buckets={volumeBuckets} />
              </View>
            )}
          </View>
        </View>

        {/* ── Recent workouts ──────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionHeader
            title="Recent workouts"
            right={
              filteredCompletedSessions.length > 4 ? (
                <TouchableOpacity
                  onPress={() => setShowAllRecent((v) => !v)}
                  activeOpacity={0.7}
                >
                  <Text style={s.sectionLink}>
                    {showAllRecent ? "Show less" : "View all"}
                  </Text>
                </TouchableOpacity>
              ) : undefined
            }
          />

          {workoutsLoading ? (
            <View style={s.emptyState}>
              <ActivityIndicator size="small" color={T.gold} />
            </View>
          ) : recentSessions.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyText}>No completed workouts yet</Text>
            </View>
          ) : (
            <View style={s.card}>
              {recentSessions.map((session, i) => (
                <View key={session.id}>
                  {i !== 0 && <Divider />}
                  <View style={s.wkRow}>
                    <View style={s.wkDot} />
                    <View style={s.wkMid}>
                      <Text style={s.wkName} numberOfLines={1}>
                        {session.name}
                      </Text>
                      {session.date ? (
                        <Text style={s.wkDate}>{session.date}</Text>
                      ) : null}
                    </View>
                    <View style={s.wkRight}>
                      {session.duration ? (
                        <Text style={s.wkDuration}>{session.duration}</Text>
                      ) : null}
                      {session.sets != null ? (
                        <Text style={s.wkSets}>{session.sets} sets</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: T.canvas,
    maxWidth: 430,
    alignSelf: "center",
    width: "100%",
  },

  hdr: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },
  hdrEyebrow: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    color: T.gold,
    letterSpacing: 2.5,
    marginBottom: 4,
  },
  hdrTitle: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 42,
    color: T.white,
    letterSpacing: -0.5,
    lineHeight: 44,
  },

  tabBarOuter: { paddingHorizontal: 20, paddingBottom: 18 },
  tabBar: {
    flexDirection: "row",
    backgroundColor: T.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.cardBorder,
    padding: 4,
    gap: 4,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  tabActive: {
    backgroundColor: T.gold,
    shadowColor: T.gold,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  tabText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.dim,
    letterSpacing: 1,
  },
  tabTextActive: { color: T.canvas },

  scroll: { paddingHorizontal: 20, paddingBottom: 110 },

  // ── Strength progress (new hero) ────────────────────────────────────────────
  strengthCard: {
    backgroundColor: T.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: T.cardBorder,
    padding: 18,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  exercisePickerRow: { gap: 8, paddingRight: 4 },
  exerciseChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: T.ghost,
  },
  exerciseChipActive: { backgroundColor: T.gold },
  exerciseChipText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.dim,
    letterSpacing: 0.4,
  },
  exerciseChipTextActive: { color: T.canvas },
  strengthTopRow: { gap: 4 },
  prBadge: {
    backgroundColor: T.gold,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginLeft: 8,
    marginBottom: 10,
  },
  prBadgeText: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 11,
    color: T.canvas,
    letterSpacing: 1,
  },

  // ── Weight hero (now used for the demoted body-weight section) ─────────────
  weightHero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: T.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: T.cardBorder,
    paddingHorizontal: 20,
    paddingVertical: 22,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  weightLeft: { gap: 5 },
  wEyebrow: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 10,
    color: T.dim,
    letterSpacing: 1.8,
  },
  wNumberRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  wNumber: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 56,
    color: T.white,
    lineHeight: 58,
    letterSpacing: -1,
  },
  wUnit: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 20,
    color: T.dim,
    marginBottom: 8,
  },
  wDeltaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  wDelta: { fontFamily: "DMSans_400Regular", fontSize: 12, color: T.dim },

  // ── Stat tiles ────────────────────────────────────────────────────────────
  statsGrid: {
    flexDirection: "row",
    backgroundColor: T.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: T.cardBorder,
    marginTop: 24,
    marginBottom: 12,
    paddingVertical: 20,
  },
  statTile: { flex: 1, alignItems: "center", gap: 6 },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: T.goldDim,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  statDivider: { width: 1, backgroundColor: T.ghost, marginVertical: 4 },
  statNum: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 30,
    color: T.white,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  statLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 9,
    color: T.dim2,
    letterSpacing: 1.4,
  },

  // ── Sections ──────────────────────────────────────────────────────────────
  section: { marginTop: 24 },
  sectionHdr: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionAccent: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: T.gold,
  },
  sectionTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 15,
    color: T.white,
  },
  sectionSub: { fontFamily: "DMSans_400Regular", fontSize: 12, color: T.dim },
  sectionLink: { fontFamily: "DMSans_500Medium", fontSize: 12, color: T.gold },

  // ── Generic card ──────────────────────────────────────────────────────────
  card: {
    backgroundColor: T.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.cardBorder,
    overflow: "hidden",
  },
  cardPad: { padding: 18 },

  // ── Volume ────────────────────────────────────────────────────────────────
  volBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: T.goldDim,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  volPct: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    color: T.gold,
    letterSpacing: 0.3,
  },
  volRowLabel: { fontFamily: "DMSans_400Regular", fontSize: 13, color: T.dim },
  volBarsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 90,
    gap: 6,
  },
  volBarCol: { flex: 1, alignItems: "center", gap: 6, height: "100%" },
  volBarTrack: {
    flex: 1,
    width: "100%",
    backgroundColor: T.ghost,
    borderRadius: 5,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  volBarFill: { width: "100%", backgroundColor: T.gold, borderRadius: 5 },
  volBarLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 9,
    color: T.dim2,
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyState: {
    backgroundColor: T.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.cardBorder,
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  emptyText: { fontFamily: "DMSans_400Regular", fontSize: 13, color: T.dim },

  // ── Recent workout rows ───────────────────────────────────────────────────
  wkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 12,
  },
  wkDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.gold },
  wkMid: { flex: 1, gap: 3 },
  wkName: { fontFamily: "DMSans_600SemiBold", fontSize: 14, color: T.white },
  wkDate: { fontFamily: "DMSans_400Regular", fontSize: 11, color: T.dim },
  wkRight: { alignItems: "flex-end", gap: 3 },
  wkDuration: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.white,
    letterSpacing: 0.2,
  },
  wkSets: { fontFamily: "DMSans_400Regular", fontSize: 11, color: T.dim },
});
