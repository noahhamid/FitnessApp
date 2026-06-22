import { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWeightLog } from "@/src/features/nutrition/hooks/useWeight";
import {
  mapApiSessionToHistoryRow,
  fetchWorkoutSessions,
  type ApiWorkoutSession,
} from "@/src/features/workout/services/workout.service";
import { Ionicons } from "@expo/vector-icons";
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
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import { PhotoComparison } from "../components/PhotoComparison";
import { WeightChart } from "../components/WeightChart";

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
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
};

type Period = "7D" | "1M" | "3M" | "ALL";
const PERIODS: Period[] = ["7D", "1M", "3M", "ALL"];

const SPARK_W = 90;
const SPARK_H = 52;

// ── Helpers ───────────────────────────────────────────────────────────────────
function localYmdFromIso(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function periodCutoffDate(period: Period): Date | null {
  const days =
    period === "7D" ? 7 : period === "1M" ? 30 : period === "3M" ? 90 : undefined;
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
        acc +
        Number((row as { weight?: number }).weight ?? 0) *
          Number((row as { reps?: number }).reps ?? 0)
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

function startOfWeekSunday(d: Date): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() - copy.getDay());
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// ── Bezier path builder (shared by sparkline) ────────────────────────────────
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

// ── Mini sparkline ────────────────────────────────────────────────────────────
function MiniSparkline({ data }: { data: { weight: number }[] }) {
  if (data.length < 2) {
    return <View style={{ width: SPARK_W, height: SPARK_H }} />;
  }
  const values = data.map((d) => d.weight);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const rng = max - min || 1;
  const PAD = 6;
  const toX = (i: number) => PAD + (i / (data.length - 1)) * (SPARK_W - PAD * 2);
  const toY = (v: number) => PAD + ((max - v) / rng) * (SPARK_H - PAD * 2);

  const coordPts = data.map((d, i) => ({ x: toX(i), y: toY(d.weight) }));
  const linePath = bezierLine(coordPts);
  const last = coordPts[coordPts.length - 1];
  const areaPath = `${linePath} L ${last.x.toFixed(1)} ${SPARK_H} L ${coordPts[0].x.toFixed(1)} ${SPARK_H} Z`;

  return (
    <Svg width={SPARK_W} height={SPARK_H}>
      <Defs>
        <LinearGradient id="spkGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={T.lime} stopOpacity="0.28" />
          <Stop offset="100%" stopColor={T.lime} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill="url(#spkGrad)" />
      <Path
        d={linePath}
        fill="none"
        stroke={T.lime}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={last.x} cy={last.y} r={4.5} fill={T.lime} />
    </Svg>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function ProgressScreen() {
  const [period, setPeriod] = useState<Period>("1M");

  const { data: weightLogs = [] } = useWeightLog();
  const { data: completedWorkouts = [], isPending: workoutsLoading } = useQuery(
    {
      queryKey: ["progress", "workouts"] as const,
      queryFn: () => fetchWorkoutSessions("?limit=60&completed=true"),
    },
  );

  const periodCutoff = useMemo(() => periodCutoffDate(period), [period]);
  const periodMonths =
    period === "7D" ? 0.25 : period === "1M" ? 1 : period === "3M" ? 3 : undefined;

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

  const currentWeight =
    periodWeights.length > 0
      ? periodWeights[periodWeights.length - 1].weight
      : null;
  const startWeight =
    periodWeights.length > 1 ? periodWeights[0].weight : null;
  const weightDelta =
    currentWeight !== null && startWeight !== null
      ? currentWeight - startWeight
      : null;

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

  const avgDurationMin = useMemo(() => {
    const sessWithDuration = completedWorkouts.filter(
      (w) => w.completedAt && w.startedAt,
    );
    if (!sessWithDuration.length) return null;
    const totalMin = sessWithDuration.reduce((acc, s) => {
      const start = new Date(s.startedAt).getTime();
      const end = new Date(s.completedAt!).getTime();
      return acc + (end - start) / 60_000;
    }, 0);
    return Math.round(totalMin / sessWithDuration.length);
  }, [completedWorkouts]);

  const recentSessions = useMemo(
    () =>
      completedWorkouts
        .filter((w) => {
          if (!w.completedAt) return false;
          return periodCutoff ? new Date(w.completedAt) >= periodCutoff : true;
        })
        .sort(
          (a, b) =>
            new Date(b.completedAt!).getTime() -
            new Date(a.completedAt!).getTime(),
        )
        .slice(0, 4)
        .map(mapApiSessionToHistoryRow),
    [completedWorkouts, periodCutoff],
  );

  const volumeStats = useMemo(() => {
    const thisWeekStart = startOfWeekSunday(new Date());
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    let thisKg = 0,
      lastKg = 0,
      thisSessions = 0,
      lastSessions = 0;
    for (const session of completedWorkouts) {
      if (!session.completedAt) continue;
      const completed = new Date(session.completedAt);
      const vol = sessionVolumeKg(session);
      if (completed >= thisWeekStart) {
        thisKg += vol;
        thisSessions++;
      } else if (completed >= lastWeekStart) {
        lastKg += vol;
        lastSessions++;
      }
    }
    const pct =
      lastKg > 0
        ? Math.round(((thisKg - lastKg) / lastKg) * 100)
        : thisKg > 0
          ? 100
          : 0;
    const maxVol = Math.max(thisKg, lastKg, 1);
    return {
      thisKg,
      lastKg,
      thisSessions,
      lastSessions,
      pct,
      thisBarPct: Math.round((thisKg / maxVol) * 100),
      lastBarPct: Math.round((lastKg / maxVol) * 100),
      hasData: thisKg > 0 || lastKg > 0,
    };
  }, [completedWorkouts]);

  // Header date string: "TUESDAY • JUN 20"
  const headerDate = (() => {
    const now = new Date();
    const day = now
      .toLocaleDateString("en-US", { weekday: "long" })
      .toUpperCase();
    const mon = now
      .toLocaleDateString("en-US", { month: "short", day: "numeric" })
      .toUpperCase();
    return `${day} • ${mon}`;
  })();

  const deltaDown = weightDelta !== null && weightDelta <= 0;
  const deltaColor = weightDelta === null ? T.muted : deltaDown ? T.lime : T.red;

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg0} />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <View style={s.hdr}>
        <View style={s.hdrLeft}>
          <View style={s.hdrLabelRow}>
            <Ionicons name="trending-up-outline" size={11} color={T.muted} />
            <Text style={s.hdrLabel}>PERFORMANCE</Text>
          </View>
          <Text style={s.hdrGreeting}>Track your progress,</Text>
          <Text style={s.hdrTitle}>PROGRESS.</Text>
        </View>
      </View>

      {/* ── PERIOD TABS ─────────────────────────────────────────────────────── */}
      <View style={s.pillBarWrap}>
        <View style={s.pillTrack}>
          {PERIODS.map((p) => {
            const active = period === p;
            return (
              <TouchableOpacity
                key={p}
                style={[s.pill, active && s.pillActive]}
                onPress={() => setPeriod(p)}
                activeOpacity={0.75}
              >
                <Text style={[s.pillText, active && s.pillTextActive]}>{p}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── WEIGHT HIGHLIGHT CARD ─────────────────────────────────────────── */}
        <View style={s.weightCard}>
          <View style={s.weightLeft}>
            <Text style={s.wLabel}>CURRENT WEIGHT</Text>
            <View style={s.wValueRow}>
              <Text style={s.wValue}>
                {currentWeight !== null ? currentWeight.toFixed(1) : "—"}
              </Text>
              <Text style={s.wUnit}>kg</Text>
            </View>
            {weightDelta !== null && startWeight !== null && (
              <View
                style={[
                  s.deltaBadge,
                  {
                    borderColor: deltaColor + "40",
                    backgroundColor: deltaColor + "14",
                  },
                ]}
              >
                <Ionicons
                  name={deltaDown ? "arrow-down-outline" : "arrow-up-outline"}
                  size={10}
                  color={deltaColor}
                />
                <Text style={[s.deltaText, { color: deltaColor }]}>
                  {deltaDown ? "−" : "+"}
                  {Math.abs(weightDelta).toFixed(1)} kg vs {startWeight.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
          <MiniSparkline data={periodWeights} />
        </View>

        {/* ── QUICK METRICS GRID ───────────────────────────────────────────── */}
        <View style={s.metricsRow}>
          <View style={s.metricCard}>
            <View style={s.metricIconWrap}>
              <Ionicons name="flame-outline" size={16} color={T.lime} />
            </View>
            <Text style={s.metricNum}>{streakDays}</Text>
            <Text style={s.metricLabel}>STREAK</Text>
            <Text style={s.metricSub}>days</Text>
          </View>
          <View style={s.metricCard}>
            <View style={s.metricIconWrap}>
              <Ionicons name="barbell-outline" size={16} color={T.lime} />
            </View>
            <Text style={s.metricNum}>{volumeStats.thisSessions}</Text>
            <Text style={s.metricLabel}>WORKOUTS</Text>
            <Text style={s.metricSub}>this wk</Text>
          </View>
          <View style={s.metricCard}>
            <View style={s.metricIconWrap}>
              <Ionicons name="time-outline" size={16} color={T.lime} />
            </View>
            <Text style={s.metricNum}>{avgDurationMin ?? "—"}</Text>
            <Text style={s.metricLabel}>AVG TIME</Text>
            <Text style={s.metricSub}>min</Text>
          </View>
        </View>

        {/* ── WEIGHT TREND CHART ───────────────────────────────────────────── */}
        <View style={s.sectionHdr}>
          <Text style={s.sectionTitle}>Weight trend</Text>
          <Text style={s.sectionSub}>{period}</Text>
        </View>
        <View style={s.chartCard}>
          <WeightChart periodMonths={periodMonths} />
        </View>

        {/* ── TRAINING VOLUME ──────────────────────────────────────────────── */}
        <View style={s.sectionHdr}>
          <Text style={s.sectionTitle}>Training volume</Text>
          {volumeStats.pct !== 0 && (
            <View
              style={[
                s.pctBadge,
                {
                  backgroundColor:
                    (volumeStats.pct > 0 ? T.lime : T.red) + "20",
                  borderColor: (volumeStats.pct > 0 ? T.lime : T.red) + "40",
                },
              ]}
            >
              <Text
                style={[
                  s.pctText,
                  { color: volumeStats.pct > 0 ? T.lime : T.red },
                ]}
              >
                {volumeStats.pct > 0 ? "+" : ""}
                {volumeStats.pct}%
              </Text>
            </View>
          )}
        </View>
        <View style={s.volCard}>
          {volumeStats.hasData ? (
            <>
              <View style={s.volRow}>
                <Text style={s.volLabel}>This week</Text>
                <Text style={s.volValue}>
                  {Math.round(volumeStats.thisKg).toLocaleString()} kg
                </Text>
              </View>
              <View style={s.barTrack}>
                <View
                  style={[
                    s.barFillLime,
                    { width: `${volumeStats.thisBarPct}%` },
                  ]}
                />
              </View>

              <View style={[s.volRow, { marginTop: 14 }]}>
                <Text style={s.volLabel}>Last week</Text>
                <Text style={s.volValue}>
                  {Math.round(volumeStats.lastKg).toLocaleString()} kg
                </Text>
              </View>
              <View style={s.barTrack}>
                <View
                  style={[
                    s.barFillGray,
                    { width: `${volumeStats.lastBarPct}%` },
                  ]}
                />
              </View>
            </>
          ) : (
            <View style={s.emptyRow}>
              <Ionicons name="barbell-outline" size={15} color={T.muted} />
              <Text style={s.emptyText}>
                Complete a workout to see volume stats
              </Text>
            </View>
          )}
        </View>

        {/* ── PROGRESS PHOTOS ──────────────────────────────────────────────── */}
        <View style={s.sectionHdr}>
          <Text style={s.sectionTitle}>Progress photos</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={s.sectionLink}>Compare {">"}</Text>
          </TouchableOpacity>
        </View>
        <PhotoComparison />

        {/* ── RECENT WORKOUTS ──────────────────────────────────────────────── */}
        <View style={s.sectionHdr}>
          <Text style={s.sectionTitle}>Recent workouts</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={s.sectionLink}>View all {">"}</Text>
          </TouchableOpacity>
        </View>

        {workoutsLoading ? (
          <View style={[s.card, s.emptyRow]}>
            <ActivityIndicator size="small" color={T.lime} />
          </View>
        ) : recentSessions.length === 0 ? (
          <View style={[s.card, s.emptyRow]}>
            <Ionicons name="time-outline" size={15} color={T.muted} />
            <Text style={s.emptyText}>No completed workouts yet</Text>
          </View>
        ) : (
          <View style={s.card}>
            {recentSessions.map((session, i) => (
              <View
                key={session.id}
                style={[
                  s.wkRow,
                  i === recentSessions.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={s.wkIcon}>
                  <Ionicons name="barbell-outline" size={15} color={T.lime} />
                </View>
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
                    <View style={s.wkPill}>
                      <Text style={s.wkPillText}>{session.duration}</Text>
                    </View>
                  ) : null}
                  {session.sets != null ? (
                    <Text style={s.wkSets}>{session.sets} sets</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: T.bg0,
    maxWidth: 430,
    alignSelf: "center",
    width: "100%",
  },

  // ── Fixed header ─────────────────────────────────────────────────────────────
  hdr: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  hdrLeft: { gap: 2 },
  hdrLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  hdrLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    color: T.muted,
    letterSpacing: 1.5,
  },
  hdrGreeting: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: T.sub,
  },
  hdrTitle: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 38,
    color: T.text,
    lineHeight: 40,
    letterSpacing: 0.5,
  },

  // ── Period tabs ───────────────────────────────────────────────────────────────
  pillBarWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pillTrack: {
    flexDirection: "row",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: T.borderMid,
    backgroundColor: "transparent",
    padding: 3,
  },
  pill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 999,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  pillActive: {
    backgroundColor: T.lime,
    shadowColor: T.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  pillText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.sub,
    letterSpacing: 0.5,
  },
  pillTextActive: { color: T.bg0 },

  // ── Scroll content ────────────────────────────────────────────────────────────
  content: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },

  // ── Weight highlight card ─────────────────────────────────────────────────────
  weightCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: T.bg1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  weightLeft: { gap: 6 },
  wLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 10,
    color: T.muted,
    letterSpacing: 1.4,
  },
  wValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },
  wValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 40,
    color: T.text,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  wUnit: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 18,
    color: T.muted,
    marginBottom: 6,
  },
  deltaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  deltaText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    letterSpacing: 0.2,
  },

  // ── Quick metrics grid ────────────────────────────────────────────────────────
  metricsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 4,
    backgroundColor: T.bg1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: T.lime + "14",
    borderWidth: 1,
    borderColor: T.lime + "28",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  metricNum: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 24,
    color: T.text,
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  metricLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 9,
    color: T.lime,
    letterSpacing: 1.3,
  },
  metricSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },

  // ── Section headers ───────────────────────────────────────────────────────────
  sectionHdr: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 20,
  },
  sectionTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: T.text,
    letterSpacing: -0.1,
  },
  sectionSub: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: T.muted,
  },
  sectionLink: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: T.lime,
  },

  // ── Generic card ──────────────────────────────────────────────────────────────
  card: {
    backgroundColor: T.bg1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
    overflow: "hidden",
  },

  // ── Weight trend chart card ───────────────────────────────────────────────────
  chartCard: {
    backgroundColor: T.bg1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
    padding: 16,
  },

  // ── Training volume card ──────────────────────────────────────────────────────
  volCard: {
    backgroundColor: T.bg1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
    padding: 16,
  },
  pctBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pctText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  volRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  volLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: T.sub,
  },
  volValue: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 14,
    color: T.text,
    letterSpacing: -0.1,
  },
  barTrack: {
    height: 8,
    backgroundColor: T.bg3,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFillLime: {
    height: 8,
    backgroundColor: T.lime,
    borderRadius: 4,
  },
  barFillGray: {
    height: 8,
    backgroundColor: T.sub,
    borderRadius: 4,
    opacity: 0.5,
  },

  // ── Empty states ──────────────────────────────────────────────────────────────
  emptyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: T.muted,
    flex: 1,
  },

  // ── Recent workout rows ───────────────────────────────────────────────────────
  wkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  wkIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.lime + "14",
    borderWidth: 1,
    borderColor: T.lime + "28",
    alignItems: "center",
    justifyContent: "center",
  },
  wkMid: { flex: 1, gap: 3 },
  wkName: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: T.text,
  },
  wkDate: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
  },
  wkRight: { alignItems: "flex-end", gap: 4 },
  wkPill: {
    backgroundColor: T.lime + "14",
    borderWidth: 1,
    borderColor: T.lime + "28",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  wkPillText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    color: T.lime,
    letterSpacing: 0.2,
  },
  wkSets: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
  },
});
