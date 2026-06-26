import {
  ActivityIndicator,
  Dimensions,
  Pressable,
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
  Polyline,
  Stop,
} from "react-native-svg";

const { width: SCREEN_W } = Dimensions.get("window");
const CONTENT_W = Math.min(SCREEN_W, 430);
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg0: "#121212",
  bg1: "#1E1E1E",
  bg2: "#282828",
  bg3: "#303030",
  border: "#FFFFFF0A",
  borderMid: "#FFFFFF14",
  gold: "#FFC700",
  goldDim: "#FFC70020",
  goldBorder: "#FFC70030",
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#555555",
  r8: 8,
  r12: 12,
  r16: 16,
  r20: 20,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <View
      style={{ height: 1, backgroundColor: T.border, marginVertical: 12 }}
    />
  );
}

type ChipProps = { label: string; color?: string };
function Chip({ label, color = T.gold }: ChipProps) {
  return (
    <View
      style={[
        s.chip,
        { backgroundColor: color + "1A", borderColor: color + "33" },
      ]}
    >
      <Text style={[s.chipText, { color }]}>{label}</Text>
    </View>
  );
}

// ─── 1. RingChart ─────────────────────────────────────────────────────────────

type RingChartProps = {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  bgColor?: string;
  label: string;
  sublabel?: string;
};

export function RingChart({
  pct,
  size = 128,
  stroke = 10,
  color = T.gold,
  bgColor = T.bg3,
  label,
  sublabel,
}: RingChartProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - pct / 100);

  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={bgColor}
          strokeWidth={stroke}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          strokeDashoffset={`${dash}`}
        />
      </Svg>
      <View style={s.ringLabel}>
        <Text style={s.ringValue}>{label}</Text>
        {sublabel ? <Text style={s.ringSubLabel}>{sublabel}</Text> : null}
      </View>
    </View>
  );
}

// ─── 2. MacroBar ─────────────────────────────────────────────────────────────

type MacroBarProps = {
  label: string;
  value: number;
  max: number;
  unit: string;
  color?: string;
};

export function MacroBar({
  label,
  value,
  max,
  unit,
  color = T.gold,
}: MacroBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <View style={s.macroBarContainer}>
      {label ? (
        <View style={s.macroBarHeader}>
          <Text style={s.macroBarLabel}>{label}</Text>
          <Text style={s.macroBarValue}>
            {value}
            <Text style={s.macroBarUnit}> {unit}</Text>
          </Text>
        </View>
      ) : null}
      <View style={s.macroBarTrack}>
        <View
          style={[s.macroBarFill, { width: `${pct}%`, backgroundColor: color }]}
        />
      </View>
    </View>
  );
}

// ─── 3. Sparkline ────────────────────────────────────────────────────────────

type SparklineProps = {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
};

export function Sparkline({
  data,
  color = T.gold,
  height = 36,
  width = 80,
}: SparklineProps) {
  if (!data?.length || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = max - min || 1;
  const pad = 4;
  const pts = data.map(
    (v, i) =>
      `${(i / (data.length - 1)) * (width - pad * 2) + pad},${
        height - pad - ((v - min) / rng) * (height - pad * 2)
      }`,
  );
  const last = pts[pts.length - 1].split(",");
  return (
    <Svg width={width} height={height}>
      <Polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />
      <Circle
        cx={parseFloat(last[0])}
        cy={parseFloat(last[1])}
        r={3}
        fill={color}
      />
    </Svg>
  );
}

// ─── 4. StatTile ─────────────────────────────────────────────────────────────

type StatTileProps = {
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
  note?: string;
  color?: string;
  spark?: number[];
};

export function StatTile({
  icon,
  label,
  value,
  unit,
  note,
  color = T.gold,
  spark,
}: StatTileProps) {
  return (
    <View style={s.statTile}>
      <View style={s.statTileTop}>
        <View style={[s.statIconWrap, { backgroundColor: color + "1A" }]}>
          <Text style={s.statIcon}>{icon}</Text>
        </View>
        {spark ? <Sparkline data={spark} color={color} /> : null}
      </View>
      <Text style={s.statValue}>
        {value}
        <Text style={s.statUnit}> {unit}</Text>
      </Text>
      <Text style={s.statLabel}>{label}</Text>
      {note ? (
        <View style={s.statNoteRow}>
          <View style={[s.statNoteDot, { backgroundColor: color }]} />
          <Text style={[s.statNote, { color }]}>{note}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ─── 5. SectionTitle ─────────────────────────────────────────────────────────

type SectionTitleProps = {
  title: string;
  action?: string;
  onAction?: () => void;
};

export function SectionTitle({ title, action, onAction }: SectionTitleProps) {
  return (
    <View style={s.sectionTitleRow}>
      <Text style={s.sectionTitle}>{title}</Text>
      {action ? (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={s.sectionAction}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ─── 6. WeeklyCard ───────────────────────────────────────────────────────────

type WeeklyBarItem = { cal: number; workout: boolean };
type WeeklyBarsProps = { data: WeeklyBarItem[] };

const BAR_MAX_H = 64;
const BAR_W = 26;

function WeeklyBars({ data }: WeeklyBarsProps) {
  const cals = data.map((d) => d.cal);
  const max = Math.max(...cals, 1);
  const nonzero = cals.filter(Boolean);
  const avg = nonzero.length
    ? Math.round(nonzero.reduce((a, b) => a + b, 0) / nonzero.length)
    : 0;
  const avgH = Math.max((avg / max) * BAR_MAX_H, 4);
  const day = new Date().getDay();
  const todayIdx = day === 0 ? 6 : day - 1;

  return (
    <View>
      <View style={s.weeklyChartArea}>
        <View style={[s.weeklyAvgLine, { bottom: 24 + avgH }]}>
          <View style={s.weeklyAvgDash} />
          <Text style={s.weeklyAvgLabel}>avg {avg}</Text>
        </View>
        <View style={s.weeklyBars}>
          {data.map((d, i) => {
            const h = d.cal > 0 ? Math.max((d.cal / max) * BAR_MAX_H, 6) : 6;
            const active = i === todayIdx;
            const done = d.workout && i < todayIdx;
            const future = !d.cal && i > todayIdx;

            return (
              <View key={i} style={s.barColumn}>
                {(active || done) && d.cal > 0 ? (
                  <Text style={[s.barCalLabel, active && { color: T.gold }]}>
                    {d.cal}
                  </Text>
                ) : (
                  <View style={{ height: 14 }} />
                )}
                <View
                  style={[
                    s.bar,
                    { height: h },
                    active
                      ? s.barActive
                      : done
                        ? s.barDone
                        : future
                          ? s.barFuture
                          : s.barEmpty,
                  ]}
                />
                {d.workout ? (
                  <View style={[s.workoutDot, active && s.workoutDotActive]} />
                ) : (
                  <View style={{ height: 6 }} />
                )}
                <Text style={[s.barDay, active && s.barDayActive]}>
                  {DAYS[i]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

type WeeklyCardProps = { onReport?: () => void; weeklyBars?: WeeklyBarItem[] };

export function WeeklyCard({ onReport, weeklyBars }: WeeklyCardProps) {
  const bars: WeeklyBarItem[] =
    weeklyBars && weeklyBars.length === 7
      ? weeklyBars
      : ([0, 1, 2, 3, 4, 5, 6].map(() => ({
          cal: 0,
          workout: false,
        })) satisfies WeeklyBarItem[]);

  const totalWorkouts = bars.filter((d) => d.workout).length;
  const calsLogged = bars.filter((d) => d.cal > 0);
  const totalCal = bars.reduce((a, d) => a + d.cal, 0);
  const avgCal =
    calsLogged.length > 0 ? Math.round(totalCal / calsLogged.length) : 0;
  const totalMins = Math.max(totalWorkouts * 40, calsLogged.length * 45, 0);
  const totalTimeLabel =
    totalMins >= 60
      ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`
      : `${totalMins}m`;

  return (
    <View style={s.card}>
      <View style={s.weeklyHeader}>
        <View>
          <Text style={s.sectionTitle}>WEEKLY ACTIVITY</Text>
          <Text style={s.weeklySubtitle}>
            {totalWorkouts} workouts this week
          </Text>
        </View>
        <TouchableOpacity
          onPress={onReport}
          style={s.reportBtn}
          activeOpacity={0.75}
        >
          <Text style={s.reportBtnText}>Full report →</Text>
        </TouchableOpacity>
      </View>
      <WeeklyBars data={bars} />
      <Divider />
      <View style={s.cardSummary}>
        {[
          { v: `${totalWorkouts}`, l: "Workouts", highlight: true },
          { v: `${avgCal}`, l: "Avg kcal", highlight: false },
          {
            v: totalMins > 0 ? totalTimeLabel : "0m",
            l: "Total",
            highlight: false,
          },
        ].map(({ v, l, highlight }) => (
          <View key={l} style={s.summaryItem}>
            <Text style={[s.summaryValue, highlight && { color: T.gold }]}>
              {v}
            </Text>
            <Text style={s.summaryLabel}>{l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── 7. WeightCard ───────────────────────────────────────────────────────────

type WeightPoint = { w: number; date: string };
type Point = { x: number; y: number };

function smoothPath(pts: Point[]): string {
  if (pts.length < 2) return "";
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
  }
  return d;
}

function WeightLine({ data }: { data: WeightPoint[] }) {
  const YAXIS_W = 36;
  const W = CONTENT_W - 64 - YAXIS_W - 6;
  const H = 96;
  const vals = data.map((d) => d.w);
  const lo = Math.min(...vals) - 0.8;
  const hi = Math.max(...vals) + 0.8;
  const rng = hi - lo;
  const padX = 8;
  const padY = 10;
  const divisor = vals.length <= 1 ? 1 : vals.length - 1;

  const pts: Point[] = vals.map((v, i) => ({
    x: padX + (i / divisor) * (W - padX * 2),
    y: padY + ((hi - v) / rng) * (H - padY * 2),
  }));

  const linePath = smoothPath(pts);
  const lastPt = pts[pts.length - 1];
  const areaPath = `${linePath} L${lastPt.x},${H} L${pts[0].x},${H} Z`;

  const refYs = [0.25, 0.5, 0.75].map((frac) => ({
    y: padY + (1 - frac) * (H - padY * 2),
    label: (lo + rng * frac).toFixed(1),
  }));

  return (
    <View style={s.weightChartWrap}>
      <View style={s.weightYAxis}>
        {[...refYs].reverse().map((r) => (
          <Text key={r.label} style={s.weightAxisLabel}>
            {r.label}
          </Text>
        ))}
      </View>
      <Svg width={W} height={H}>
        <Defs>
          <LinearGradient id="wg2" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={T.gold} stopOpacity="0.18" />
            <Stop offset="100%" stopColor={T.gold} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {refYs.map((r) => (
          <Path
            key={r.label}
            d={`M${padX},${r.y} L${W - padX},${r.y}`}
            stroke={T.border}
            strokeWidth="1"
            strokeDasharray="3,4"
          />
        ))}
        <Path d={areaPath} fill="url(#wg2)" />
        <Path
          d={linePath}
          fill="none"
          stroke={T.gold}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={2.5}
            fill={T.bg2}
            stroke={T.gold}
            strokeWidth="1.5"
          />
        ))}
        <Circle
          cx={lastPt.x}
          cy={lastPt.y}
          r={9}
          fill={T.gold}
          opacity={0.12}
        />
        <Circle cx={lastPt.x} cy={lastPt.y} r={5} fill={T.gold} />
        <Circle cx={lastPt.x} cy={lastPt.y} r={2} fill={T.bg0} />
      </Svg>
    </View>
  );
}

type WeightCardProps = {
  chartData?: WeightPoint[];
  currentW?: number;
  startW?: number;
  goalW?: number;
  subtitle?: string;
  isLoading?: boolean;
};

export function WeightCard({
  chartData,
  currentW: currentWProp,
  startW: startWProp,
  goalW: goalWProp,
  subtitle = "Last entries",
  isLoading,
}: WeightCardProps) {
  const seriesRaw =
    chartData && chartData.length > 0
      ? [...chartData].sort((a, b) => `${a.date}`.localeCompare(`${b.date}`))
      : [];

  const startW =
    typeof startWProp === "number" && isFinite(startWProp)
      ? startWProp
      : (seriesRaw[0]?.w ?? 0);
  const currentW =
    typeof currentWProp === "number" && isFinite(currentWProp)
      ? currentWProp
      : (seriesRaw[seriesRaw.length - 1]?.w ?? startW);
  const goalW =
    typeof goalWProp === "number" && isFinite(goalWProp) ? goalWProp : currentW;

  const journey = Math.abs(startW - goalW);
  const progressed = Math.abs(startW - currentW);
  const progressPct =
    journey < 1e-6
      ? 0
      : Math.min(100, Math.round((progressed / journey) * 100));
  const deltaNum = +(startW - currentW).toFixed(1);
  const lossLabel =
    seriesRaw.length < 2
      ? "Log twice to trend"
      : `${deltaNum >= 0 ? "↓" : "↑"} ${Math.abs(deltaNum).toFixed(1)} kg`;
  const toGoMag = +Math.abs(currentW - goalW).toFixed(1);

  return (
    <View style={s.card}>
      <View style={s.weightHeader}>
        <View style={{ gap: 3 }}>
          <Text style={s.sectionTitle}>WEIGHT TREND</Text>
          <Text style={s.weightSubTitle}>{subtitle}</Text>
        </View>
        <View style={s.weightRight}>
          <View style={s.weightValueRow}>
            <Text style={s.weightValue}>
              {isLoading ? "—" : currentW.toFixed(1)}
            </Text>
            <Text style={s.weightUnit}> kg</Text>
          </View>
          <Text style={s.weightDelta}>{lossLabel}</Text>
        </View>
      </View>

      {isLoading ? (
        <View
          style={[s.weightChartWrap, { height: 96, justifyContent: "center" }]}
        >
          <ActivityIndicator color={T.gold} />
        </View>
      ) : seriesRaw.length < 2 ? (
        <Text style={s.weightEmptyText}>
          Add weight logs to see your trend chart.
        </Text>
      ) : (
        <WeightLine data={seriesRaw} />
      )}

      <View style={s.weightGoalRow}>
        <Text style={s.weightGoalLabel}>{toGoMag.toFixed(1)} kg to goal</Text>
        <Text style={s.weightGoalPct}>{progressPct}%</Text>
      </View>
      <View style={s.weightProgressTrack}>
        <View style={[s.weightProgressFill, { width: `${progressPct}%` }]} />
      </View>
      <Divider />
      <View style={s.cardSummary}>
        {[
          { v: `${startW.toFixed(1)} kg`, l: "Start", highlight: false },
          { v: `${goalW.toFixed(1)} kg`, l: "Goal", highlight: true },
          { v: `${progressPct}%`, l: "Progress", highlight: false },
        ].map(({ v, l, highlight }) => (
          <View key={l} style={s.summaryItem}>
            <Text
              style={[
                s.summaryValue,
                { fontSize: 15 },
                highlight && { color: T.gold },
              ]}
            >
              {seriesRaw.length ? v : "--"}
            </Text>
            <Text style={s.summaryLabel}>{l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── 8. WorkoutRow ───────────────────────────────────────────────────────────

type WorkoutRowProps = {
  title: string;
  duration: string;
  sets: string;
  tag: string;
  tagColor: string;
};

export function WorkoutRow({
  title,
  duration,
  sets,
  tag,
  tagColor,
}: WorkoutRowProps) {
  // Remap any legacy colors to gold system
  const resolvedColor = T.gold;

  return (
    <View style={s.workoutRow}>
      <View style={s.workoutLeft}>
        <View style={[s.workoutAccent, { backgroundColor: resolvedColor }]} />
        <View>
          <Text style={s.workoutTitle}>{title}</Text>
          <Text style={s.workoutMeta}>
            {duration} · {sets}
          </Text>
        </View>
      </View>
      <View
        style={[
          s.workoutTag,
          {
            backgroundColor: resolvedColor + "20",
            borderColor: resolvedColor + "40",
          },
        ]}
      >
        <Text style={[s.workoutTagText, { color: resolvedColor }]}>{tag}</Text>
      </View>
    </View>
  );
}

// ─── 9. ActionBtn ────────────────────────────────────────────────────────────

type ActionBtnProps = {
  icon: string;
  label: string;
  color?: string;
  onPress?: () => void;
};

export function ActionBtn({
  icon,
  label,
  color = T.gold,
  onPress,
}: ActionBtnProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.actionBtn,
        pressed && { opacity: 0.75, transform: [{ scale: 0.95 }] },
      ]}
    >
      <View
        style={[
          s.actionBtnIcon,
          { backgroundColor: color + "1A", borderColor: color + "30" },
        ]}
      >
        <Text style={s.actionBtnEmoji}>{icon}</Text>
      </View>
      <Text style={s.actionBtnLabel}>{label}</Text>
    </Pressable>
  );
}

// ─── 10. BottomNav ───────────────────────────────────────────────────────────

type NavItem = { id: string; icon: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { id: "home", icon: "⊞", label: "Home" },
  { id: "workout", icon: "🏋️", label: "Workout" },
  { id: "nutrition", icon: "🍎", label: "Nutrition" },
  { id: "focus", icon: "⚡", label: "Focus" },
  { id: "profile", icon: "👤", label: "Profile" },
];

type BottomNavProps = { active: string; onChange: (id: string) => void };

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <View style={s.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === active;
        const isFocus = item.id === "focus";
        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => onChange(item.id)}
            style={s.navItem}
            activeOpacity={0.7}
          >
            {isFocus ? (
              <View style={s.focusBtn}>
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              </View>
            ) : (
              <Text style={[s.navIcon, { opacity: isActive ? 1 : 0.28 }]}>
                {item.icon}
              </Text>
            )}
            {isActive && !isFocus ? <View style={s.navDot} /> : null}
            <Text style={[s.navLabel, isActive && s.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Chip
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.8,
  },

  // Ring
  ringLabel: {
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  ringValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 24,
    color: T.text,
    lineHeight: 24,
  },
  ringSubLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    color: T.sub,
    letterSpacing: 1.2,
    marginTop: 3,
  },

  // MacroBar
  macroBarContainer: { marginBottom: 4 },
  macroBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  macroBarLabel: { fontFamily: "DMSans_500Medium", fontSize: 11, color: T.sub },
  macroBarValue: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 11,
    color: T.text,
  },
  macroBarUnit: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },
  macroBarTrack: {
    height: 4,
    backgroundColor: T.bg3,
    borderRadius: 2,
    overflow: "hidden",
  },
  macroBarFill: { height: "100%", borderRadius: 2 },

  // StatTile
  statTile: {
    flex: 1,
    backgroundColor: T.bg1,
    borderRadius: T.r16,
    borderWidth: 1,
    borderColor: T.borderMid,
    padding: 14,
  },
  statTileTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statIcon: { fontSize: 18 },
  statValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 26,
    color: T.text,
    lineHeight: 28,
  },
  statUnit: { fontFamily: "DMSans_400Regular", fontSize: 12, color: T.sub },
  statLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: T.sub,
    marginTop: 3,
  },
  statNoteRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  statNoteDot: { width: 4, height: 4, borderRadius: 2 },
  statNote: { fontFamily: "DMSans_400Regular", fontSize: 10 },

  // SectionTitle
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    color: T.sub,
    letterSpacing: 1.5,
  },
  sectionAction: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
    color: T.gold,
  },

  // Card shell
  card: {
    backgroundColor: T.bg1,
    borderRadius: T.r20,
    borderWidth: 1,
    borderColor: T.borderMid,
    padding: 18,
  },
  cardSummary: { flexDirection: "row", justifyContent: "space-around" },
  summaryItem: { alignItems: "center" },
  summaryValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 18,
    color: T.text,
  },
  summaryLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: T.muted,
    marginTop: 3,
  },

  // Weekly
  weeklyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  weeklySubtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
    marginTop: 3,
  },
  reportBtn: {
    backgroundColor: T.goldDim,
    borderWidth: 1,
    borderColor: T.goldBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9,
  },
  reportBtnText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 11,
    color: T.gold,
  },
  weeklyChartArea: { position: "relative", marginBottom: 4 },
  weeklyAvgLine: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 1,
  },
  weeklyAvgDash: {
    flex: 1,
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: T.muted,
    opacity: 0.4,
  },
  weeklyAvgLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    color: T.muted,
  },
  weeklyBars: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: BAR_MAX_H + 50,
    paddingTop: 14,
  },
  barColumn: { alignItems: "center", justifyContent: "flex-end" },
  barCalLabel: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 9,
    color: T.sub,
    marginBottom: 3,
    height: 14,
  },
  bar: { width: BAR_W, borderRadius: 7 },
  barActive: { backgroundColor: T.gold },
  barDone: { backgroundColor: T.bg3 },
  barFuture: { backgroundColor: T.bg3, opacity: 0.25 },
  barEmpty: { backgroundColor: T.bg3, opacity: 0.35 },
  workoutDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: T.muted,
    marginTop: 5,
    marginBottom: 4,
  },
  workoutDotActive: { backgroundColor: T.gold },
  barDay: { fontFamily: "DMSans_600SemiBold", fontSize: 10, color: T.muted },
  barDayActive: { color: T.gold },

  // Weight
  weightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  weightSubTitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
  },
  weightRight: { alignItems: "flex-end" },
  weightValueRow: { flexDirection: "row", alignItems: "baseline" },
  weightValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 28,
    color: T.text,
    lineHeight: 30,
  },
  weightUnit: { fontFamily: "DMSans_400Regular", fontSize: 13, color: T.sub },
  weightDelta: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: T.gold,
    marginTop: 2,
  },
  weightChartWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  weightYAxis: {
    justifyContent: "space-between",
    height: 96,
    paddingVertical: 10,
  },
  weightAxisLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 9,
    color: T.muted,
    textAlign: "right",
  },
  weightGoalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  weightGoalLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: T.sub,
  },
  weightGoalPct: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.gold,
  },
  weightProgressTrack: {
    height: 4,
    backgroundColor: T.bg3,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 14,
  },
  weightProgressFill: {
    height: "100%",
    backgroundColor: T.gold,
    borderRadius: 2,
  },
  weightEmptyText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
    marginVertical: 20,
  },

  // WorkoutRow
  workoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  workoutLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  workoutAccent: { width: 3, height: 32, borderRadius: 2 },
  workoutTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 13,
    color: T.text,
  },
  workoutMeta: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
    marginTop: 2,
  },
  workoutTag: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
    borderWidth: 1,
  },
  workoutTagText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.4,
  },

  // ActionBtn
  actionBtn: { flex: 1, alignItems: "center", marginHorizontal: 5 },
  actionBtnIcon: {
    width: 58,
    height: 58,
    borderRadius: T.r16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionBtnEmoji: { fontSize: 24 },
  actionBtnLabel: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 10,
    color: T.text,
    textAlign: "center",
    lineHeight: 13,
  },

  // BottomNav
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    backgroundColor: T.bg0,
    borderTopWidth: 1,
    borderTopColor: T.borderMid,
    paddingVertical: 8,
    height: 78,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
    gap: 2,
  },
  navIcon: { fontSize: 20 },
  navDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.gold,
    marginVertical: 1,
  },
  navLabel: { fontFamily: "DMSans_500Medium", fontSize: 10, color: T.muted },
  navLabelActive: { color: T.gold, fontFamily: "DMSans_600SemiBold" },
  focusBtn: {
    width: 46,
    height: 46,
    borderRadius: T.r12,
    backgroundColor: T.gold,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
});
