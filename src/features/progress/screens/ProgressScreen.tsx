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
import { PhotoComparison } from "../components/PhotoComparison";
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
  danger: "#FF6B5E", // used sparingly, only for negative volume badge text if ever needed — kept monochrome by default
};

type Period = "7D" | "1M" | "3M" | "ALL";
const PERIODS: Period[] = ["7D", "1M", "3M", "ALL"];

const SPARK_W = 100;
const SPARK_H = 52;

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

function startOfWeekSunday(d: Date): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() - copy.getDay());
  copy.setHours(0, 0, 0, 0);
  return copy;
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

// ─── Sparkline — gold line with soft fill under the curve ─────────────────────
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

// ─── Tiny icon set (kept as SVG so no new deps) ───────────────────────────────
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

// ─── Screen ───────────────────────────────────────────────────────────────────
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
    period === "7D"
      ? 0.25
      : period === "1M"
        ? 1
        : period === "3M"
          ? 3
          : undefined;

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
    const totalMin = sessWithDuration.reduce(
      (acc, s) =>
        acc +
        (new Date(s.completedAt!).getTime() - new Date(s.startedAt).getTime()) /
          60_000,
      0,
    );
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
      thisSessions = 0;
    for (const session of completedWorkouts) {
      if (!session.completedAt) continue;
      const completed = new Date(session.completedAt);
      const vol = sessionVolumeKg(session);
      if (completed >= thisWeekStart) {
        thisKg += vol;
        thisSessions++;
      } else if (completed >= lastWeekStart) {
        lastKg += vol;
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
      pct,
      thisBarPct: Math.round((thisKg / maxVol) * 100),
      lastBarPct: Math.round((lastKg / maxVol) * 100),
      hasData: thisKg > 0 || lastKg > 0,
    };
  }, [completedWorkouts]);

  const deltaSign =
    weightDelta !== null ? (weightDelta <= 0 ? "−" : "+") : null;
  const deltaAbs =
    weightDelta !== null ? Math.abs(weightDelta).toFixed(1) : null;
  const deltaUp = weightDelta !== null && weightDelta > 0;

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={T.canvas} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={s.hdr}>
        <Text style={s.hdrEyebrow}>PERFORMANCE</Text>
        <Text style={s.hdrTitle}>Progress</Text>
      </View>

      {/* ── Period tabs — segmented control on a track ──────────────────────── */}
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
        {/* ── Weight hero ──────────────────────────────────────────────────── */}
        <View style={s.weightHero}>
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
          <MiniSparkline data={periodWeights} />
        </View>

        {/* ── Stat tiles — icon + number, real card ───────────────────────── */}
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
            <Text style={s.statNum}>{volumeStats.thisSessions}</Text>
            <Text style={s.statLabel}>THIS WEEK</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statTile}>
            <View style={s.statIconWrap}>
              <ClockIcon />
            </View>
            <Text style={s.statNum}>{avgDurationMin ?? "—"}</Text>
            <Text style={s.statLabel}>AVG MIN</Text>
          </View>
        </View>

        {/* ── Weight trend ─────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionHeader
            title="Weight trend"
            right={<Text style={s.sectionSub}>{period}</Text>}
          />
          <View style={s.card}>
            <WeightChart periodMonths={periodMonths} />
          </View>
        </View>

        {/* ── Training volume ──────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionHeader
            title="Training volume"
            right={
              volumeStats.pct !== 0 ? (
                <View style={s.volBadge}>
                  <ArrowIcon
                    up={volumeStats.pct > 0}
                    size={10}
                    color={T.gold}
                  />
                  <Text style={s.volPct}>{Math.abs(volumeStats.pct)}%</Text>
                </View>
              ) : undefined
            }
          />
          <View style={s.card}>
            {volumeStats.hasData ? (
              <View style={s.cardPad}>
                <View style={s.volBlock}>
                  <View style={s.volRowHdr}>
                    <Text style={s.volRowLabel}>This week</Text>
                    <Text style={s.volRowNum}>
                      {Math.round(volumeStats.thisKg).toLocaleString()} kg
                    </Text>
                  </View>
                  <View style={s.barTrack}>
                    <View
                      style={[
                        s.barFill,
                        { width: `${volumeStats.thisBarPct}%` },
                      ]}
                    />
                  </View>
                </View>
                <View style={[s.volBlock, { marginTop: 20 }]}>
                  <View style={s.volRowHdr}>
                    <Text style={s.volRowLabel}>Last week</Text>
                    <Text style={s.volRowNum}>
                      {Math.round(volumeStats.lastKg).toLocaleString()} kg
                    </Text>
                  </View>
                  <View style={s.barTrack}>
                    <View
                      style={[
                        s.barFillDim,
                        { width: `${volumeStats.lastBarPct}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View style={s.emptyState}>
                <Text style={s.emptyText}>
                  Complete a workout to see volume
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Progress photos ──────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionHeader
            title="Progress photos"
            right={
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={s.sectionLink}>Compare</Text>
              </TouchableOpacity>
            }
          />
          <PhotoComparison />
        </View>

        {/* ── Recent workouts ──────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionHeader
            title="Recent workouts"
            right={
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={s.sectionLink}>View all</Text>
              </TouchableOpacity>
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

  // ── Segmented tab control ──────────────────────────────────────────────────
  tabBarOuter: {
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: T.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.cardBorder,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
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
  tabTextActive: {
    color: T.canvas,
  },

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },

  // ── Weight hero ───────────────────────────────────────────────────────────
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
    marginBottom: 12,
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
  wNumberRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
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
  wDelta: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.dim,
  },

  // ── Stat tiles ────────────────────────────────────────────────────────────
  statsGrid: {
    flexDirection: "row",
    backgroundColor: T.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: T.cardBorder,
    marginBottom: 12,
    paddingVertical: 20,
  },
  statTile: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: T.goldDim,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: T.ghost,
    marginVertical: 4,
  },
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
  section: {
    marginTop: 24,
  },
  sectionHdr: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
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
  sectionSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.dim,
  },
  sectionLink: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: T.gold,
  },

  // ── Generic card ──────────────────────────────────────────────────────────
  card: {
    backgroundColor: T.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.cardBorder,
    overflow: "hidden",
  },
  cardPad: {
    padding: 18,
  },

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
  volBlock: {},
  volRowHdr: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  volRowLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: T.dim,
  },
  volRowNum: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 14,
    color: T.white,
    letterSpacing: -0.1,
  },
  barTrack: {
    height: 6,
    backgroundColor: T.ghost,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: 6,
    backgroundColor: T.gold,
    borderRadius: 3,
  },
  barFillDim: {
    height: 6,
    backgroundColor: T.dim,
    borderRadius: 3,
    opacity: 0.35,
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
  emptyText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: T.dim,
  },

  // ── Recent workout rows ───────────────────────────────────────────────────
  wkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 12,
  },
  wkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: T.gold,
  },
  wkMid: {
    flex: 1,
    gap: 3,
  },
  wkName: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: T.white,
  },
  wkDate: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.dim,
  },
  wkRight: {
    alignItems: "flex-end",
    gap: 3,
  },
  wkDuration: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.white,
    letterSpacing: 0.2,
  },
  wkSets: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.dim,
  },
});
