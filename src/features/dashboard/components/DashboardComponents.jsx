// src/components/DashboardComponents.jsx — Reusable Dashboard UI Components
// Fitness app · PotentialPeak
// ─────────────────────────────────────────────────────────────────────────────

import { DAYS, WEEKLY_DATA, WEIGHT_DATA } from "@/src/theme";
import {
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

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS  (override / extend whatever COLORS provides)
// ─────────────────────────────────────────────────────────────────────────────

const T = {
  // Backgrounds
  bg0: "#0A0A0C", // deepest surface
  bg1: "#111114", // card base
  bg2: "#18181D", // card elevated
  bg3: "#222228", // input / track fill

  // Brand
  lime: "#C8F135", // electric lime — primary accent
  limeD: "#A3C820", // lime pressed state
  red: "#FF3D3D",
  orange: "#FF8A00",
  blue: "#3D8EFF",
  purple: "#9B6DFF",

  // Text
  text: "#F2F2F5",
  sub: "#7A7A8C",
  muted: "#4A4A58",

  // Borders
  border: "#FFFFFF0F",
  borderMid: "#FFFFFF18",

  // Radius
  r8: 8,
  r12: 12,
  r16: 16,
  r20: 20,
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Thin separator line */
function Divider() {
  return (
    <View
      style={{ height: 1, backgroundColor: T.border, marginVertical: 12 }}
    />
  );
}

/** Small uppercase label chip */
function Chip({ label, color = T.lime }) {
  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: color + "1A", borderColor: color + "33" },
      ]}
    >
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. RING CHART (SVG)
// ─────────────────────────────────────────────────────────────────────────────

export function RingChart({
  pct,
  size = 128,
  stroke = 10,
  color = T.lime,
  bgColor = T.bg3,
  label,
  sublabel,
}) {
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
        {/* Glow effect via larger muted circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={bgColor}
          strokeWidth={stroke}
        />
        {/* Progress arc */}
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
      {/* Center label */}
      <View style={styles.ringLabel}>
        <Text style={styles.ringValue}>{label}</Text>
        {sublabel ? <Text style={styles.ringSubLabel}>{sublabel}</Text> : null}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. MACRO BAR
// ─────────────────────────────────────────────────────────────────────────────

export function MacroBar({ label, value, max, unit, color }) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <View style={styles.macroBarContainer}>
      <View style={styles.macroBarHeader}>
        <Text style={styles.macroBarLabel}>{label}</Text>
        <Text style={styles.macroBarValue}>
          {value}
          <Text style={styles.macroBarUnit}> {unit}</Text>
        </Text>
      </View>
      {/* Track */}
      <View style={styles.macroBarTrack}>
        {/* Subtle shimmer stripe via nested view */}
        <View
          style={[
            styles.macroBarFill,
            { width: `${pct}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SPARKLINE (SVG)
// ─────────────────────────────────────────────────────────────────────────────

export function Sparkline({ data, color = T.lime, height = 36, width = 80 }) {
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
  const polyPts = pts.join(" ");
  const last = pts[pts.length - 1].split(",");

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={polyPts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />
      {/* Endpoint dot */}
      <Circle
        cx={parseFloat(last[0])}
        cy={parseFloat(last[1])}
        r={3}
        fill={color}
      />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. STAT TILE
// ─────────────────────────────────────────────────────────────────────────────

export function StatTile({
  icon,
  label,
  value,
  unit,
  note,
  color = T.lime,
  spark,
}) {
  return (
    <View style={styles.statTile}>
      {/* Top row: icon + sparkline */}
      <View style={styles.statTileTop}>
        <View style={[styles.statIconWrap, { backgroundColor: color + "1A" }]}>
          <Text style={styles.statIcon}>{icon}</Text>
        </View>
        {spark ? <Sparkline data={spark} color={color} /> : null}
      </View>

      {/* Value */}
      <Text style={styles.statValue}>
        {value}
        <Text style={styles.statUnit}> {unit}</Text>
      </Text>
      <Text style={styles.statLabel}>{label}</Text>

      {note ? (
        <View style={styles.statNoteRow}>
          <View style={[styles.statNoteDot, { backgroundColor: color }]} />
          <Text style={[styles.statNote, { color }]}>{note}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SECTION TITLE
// ─────────────────────────────────────────────────────────────────────────────

export function SectionTitle({ title, action, onAction }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. CALORIE HERO CARD
// ─────────────────────────────────────────────────────────────────────────────

export function CalorieCard() {
  return (
    <View style={styles.calorieCard}>
      {/* Header */}
      <View style={styles.calorieCardHeader}>
        <Text style={styles.calorieCardTitle}>TODAY'S NUTRITION</Text>
        <Chip label="ON TRACK" color={T.lime} />
      </View>

      {/* Ring + macros row */}
      <View style={styles.calorieRow}>
        <RingChart
          pct={68}
          size={120}
          stroke={10}
          color={T.lime}
          label="1,632"
          sublabel="KCAL"
        />
        <View style={styles.calorieRight}>
          <Text style={styles.calorieGoal}>GOAL: 2,400 KCAL</Text>
          <MacroBar
            label="Protein"
            value={142}
            max={180}
            unit="g"
            color={T.blue}
          />
          <MacroBar
            label="Carbs"
            value={198}
            max={280}
            unit="g"
            color={T.orange}
          />
          <MacroBar label="Fat" value={54} max={80} unit="g" color={T.red} />
        </View>
      </View>

      <Divider />

      {/* Summary row */}
      <View style={styles.calorieSummary}>
        {[
          { v: "768", l: "Remaining", color: T.lime },
          { v: "512", l: "Burned", color: T.orange },
          { v: "68%", l: "Complete", color: T.sub },
        ].map(({ v, l, color }) => (
          <View key={l} style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color }]}>{v}</Text>
            <Text style={styles.summaryLabel}>{l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. WEEKLY BARS & CARD
// ─────────────────────────────────────────────────────────────────────────────

const BAR_MAX_H = 60;

function WeeklyBars({ data }) {
  const max = Math.max(...data.map((d) => d.cal), 1);
  const day = new Date().getDay();
  const todayIdx = day === 0 ? 6 : day - 1;

  return (
    <View style={styles.weeklyBars}>
      {data.map((d, i) => {
        const hPct = d.cal > 0 ? Math.max((d.cal / max) * BAR_MAX_H, 8) : 8;
        const active = i === todayIdx;
        const hasWorkout = d.workout && !active;

        return (
          <View key={i} style={styles.barColumn}>
            {/* Calorie label above active bar */}
            {active && d.cal > 0 ? (
              <Text style={styles.barCalLabel}>{d.cal}</Text>
            ) : (
              <View style={{ height: 16 }} />
            )}
            <View
              style={[
                styles.bar,
                { height: hPct },
                active
                  ? styles.barActive
                  : hasWorkout
                    ? styles.barWorkout
                    : styles.barEmpty,
              ]}
            />
            <Text style={[styles.barDay, active && styles.barDayActive]}>
              {DAYS[i]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function WeeklyCard() {
  return (
    <View style={styles.card}>
      <SectionTitle title="WEEKLY ACTIVITY" action="Full report →" />
      <WeeklyBars data={WEEKLY_DATA} />
      <Divider />
      <View style={styles.cardSummary}>
        {[
          { v: "4", l: "Workouts", color: T.lime },
          { v: "1,602", l: "Avg kcal", color: T.text },
          { v: "3h 20m", l: "Total", color: T.text },
        ].map(({ v, l, color }) => (
          <View key={l} style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color }]}>{v}</Text>
            <Text style={styles.summaryLabel}>{l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. WEIGHT TREND LINE & CARD
// ─────────────────────────────────────────────────────────────────────────────

function WeightLine({ data }) {
  const W = CONTENT_W - 64;
  const H = 80;
  const vals = data.map((d) => d.w);
  const lo = Math.min(...vals) - 0.5;
  const hi = Math.max(...vals) + 0.5;
  const rng = hi - lo;
  const pad = 14;

  const pts = vals.map((v, i) => ({
    x: pad + (i / (vals.length - 1)) * (W - pad * 2),
    y: 6 + ((hi - v) / rng) * (H - 16),
  }));

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");
  const areaPath = `${linePath} L${pts.at(-1).x},${H} L${pts[0].x},${H} Z`;

  return (
    <Svg width={W} height={H}>
      <Defs>
        <LinearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={T.lime} stopOpacity="0.18" />
          <Stop offset="100%" stopColor={T.lime} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      {/* Area fill */}
      <Path d={areaPath} fill="url(#wg)" />
      {/* Line */}
      <Path
        d={linePath}
        fill="none"
        stroke={T.lime}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dots */}
      {pts.map((p, i) => {
        const isLast = i === pts.length - 1;
        return (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={isLast ? 5 : 2.5}
            fill={isLast ? T.lime : T.bg2}
            stroke={T.lime}
            strokeWidth="1.5"
          />
        );
      })}
    </Svg>
  );
}

export function WeightCard() {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.weightHeader}>
        <View>
          <Text style={styles.sectionTitle}>WEIGHT TREND</Text>
          <Text style={styles.weightSubTitle}>Last 8 days</Text>
        </View>
        <View style={styles.weightRight}>
          <Text style={styles.weightValue}>
            82.1 <Text style={styles.weightUnit}>kg</Text>
          </Text>
          <Text style={styles.weightDelta}>↓ 2.1 kg this month</Text>
        </View>
      </View>

      <WeightLine data={WEIGHT_DATA} />

      <Divider />

      <View style={styles.cardSummary}>
        {[
          { v: "84.2 kg", l: "Start", color: T.sub },
          { v: "79.0 kg", l: "Goal", color: T.lime },
          { v: "87%", l: "Progress", color: T.text },
        ].map(({ v, l, color }) => (
          <View key={l} style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { fontSize: 14, color }]}>
              {v}
            </Text>
            <Text style={styles.summaryLabel}>{l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. WORKOUT ROW
// ─────────────────────────────────────────────────────────────────────────────

export function WorkoutRow({ title, duration, sets, tag, tagColor }) {
  return (
    <View style={styles.workoutRow}>
      <View style={styles.workoutLeft}>
        {/* Colored accent bar */}
        <View style={[styles.workoutAccent, { backgroundColor: tagColor }]} />
        <View>
          <Text style={styles.workoutTitle}>{title}</Text>
          <Text style={styles.workoutMeta}>
            {duration} · {sets}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.workoutTag,
          { backgroundColor: tagColor + "20", borderColor: tagColor + "40" },
        ]}
      >
        <Text style={[styles.workoutTagText, { color: tagColor }]}>{tag}</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. ACTION BUTTON
// ─────────────────────────────────────────────────────────────────────────────

export function ActionBtn({ icon, label, color = T.lime, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionBtn,
        pressed && { opacity: 0.75, transform: [{ scale: 0.95 }] },
      ]}
    >
      <View
        style={[
          styles.actionBtnIcon,
          { backgroundColor: color + "1A", borderColor: color + "30" },
        ]}
      >
        <Text style={styles.actionBtnEmoji}>{icon}</Text>
      </View>
      <Text style={styles.actionBtnLabel}>{label}</Text>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. BOTTOM NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "home", icon: "⊞", label: "Home" },
  { id: "workout", icon: "🏋️", label: "Workout" },
  { id: "nutrition", icon: "🍎", label: "Nutrition" },
  { id: "focus", icon: "⚡", label: "Focus" },
  { id: "profile", icon: "👤", label: "Profile" },
];

export function BottomNav({ active, onChange }) {
  return (
    <View style={styles.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === active;
        const isFocus = item.id === "focus";

        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => onChange(item.id)}
            style={styles.navItem}
            activeOpacity={0.7}
          >
            {isFocus ? (
              <View style={styles.focusBtn}>
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              </View>
            ) : (
              <Text style={[styles.navIcon, { opacity: isActive ? 1 : 0.28 }]}>
                {item.icon}
              </Text>
            )}

            {/* Active dot indicator */}
            {isActive && !isFocus ? <View style={styles.navDot} /> : null}

            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Chip ────────────────────────────────────────────────────────────────────
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

  // ── Ring Chart ──────────────────────────────────────────────────────────────
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

  // ── Macro Bar ───────────────────────────────────────────────────────────────
  macroBarContainer: {
    marginBottom: 9,
  },
  macroBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  macroBarLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: T.sub,
  },
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
  macroBarFill: {
    height: "100%",
    borderRadius: 2,
  },

  // ── Stat Tile ───────────────────────────────────────────────────────────────
  statTile: {
    flex: 1,
    backgroundColor: T.bg1,
    borderRadius: T.r16,
    borderWidth: 1,
    borderColor: T.border,
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
  statIcon: {
    fontSize: 18,
  },
  statValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 26,
    color: T.text,
    lineHeight: 28,
  },
  statUnit: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.sub,
  },
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
  statNoteDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  statNote: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
  },

  // ── Section Title ────────────────────────────────────────────────────────────
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.text,
    letterSpacing: 1.0,
  },
  sectionAction: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
    color: T.lime,
  },

  // ── Calorie Card ─────────────────────────────────────────────────────────────
  calorieCard: {
    backgroundColor: T.bg1,
    borderRadius: T.r20,
    borderWidth: 1,
    borderColor: T.borderMid,
    padding: 18,
  },
  calorieCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  calorieCardTitle: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.text,
    letterSpacing: 1.0,
  },
  calorieRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  calorieRight: {
    flex: 1,
  },
  calorieGoal: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: T.muted,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  calorieSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  // ── Summary Item ─────────────────────────────────────────────────────────────
  summaryItem: {
    alignItems: "center",
  },
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

  // ── Weekly Bars ──────────────────────────────────────────────────────────────
  weeklyBars: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: BAR_MAX_H + 36, // 36 = label above + day label below
    marginBottom: 4,
  },
  barColumn: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barCalLabel: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 9,
    color: T.lime,
    marginBottom: 4,
  },
  bar: {
    width: 22,
    borderRadius: 5,
    marginBottom: 6,
  },
  barActive: {
    backgroundColor: T.lime,
  },
  barWorkout: {
    backgroundColor: T.bg3,
  },
  barEmpty: {
    backgroundColor: T.bg3,
    opacity: 0.4,
  },
  barDay: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 10,
    color: T.muted,
  },
  barDayActive: {
    color: T.lime,
  },

  // ── Card ─────────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: T.bg1,
    borderRadius: T.r20,
    borderWidth: 1,
    borderColor: T.border,
    padding: 18,
  },
  cardSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  // ── Weight Card ──────────────────────────────────────────────────────────────
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
    marginTop: 3,
  },
  weightRight: {
    alignItems: "flex-end",
  },
  weightValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 20,
    color: T.text,
  },
  weightUnit: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.sub,
  },
  weightDelta: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.lime,
    marginTop: 2,
  },

  // ── Workout Row ──────────────────────────────────────────────────────────────
  workoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  workoutLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  workoutAccent: {
    width: 3,
    height: 32,
    borderRadius: 2,
  },
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

  // ── Action Button ─────────────────────────────────────────────────────────────
  actionBtn: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  actionBtnIcon: {
    width: 58,
    height: 58,
    borderRadius: T.r16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionBtnEmoji: {
    fontSize: 24,
  },
  actionBtnLabel: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 10,
    color: T.text,
    textAlign: "center",
    lineHeight: 13,
  },

  // ── Bottom Navigation ────────────────────────────────────────────────────────
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
    borderTopColor: T.border,
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
  navIcon: {
    fontSize: 20,
  },
  navDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.lime,
    marginVertical: 1,
  },
  navLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: T.muted,
  },
  navLabelActive: {
    color: T.lime,
    fontFamily: "DMSans_600SemiBold",
  },
  focusBtn: {
    width: 46,
    height: 46,
    borderRadius: T.r12,
    backgroundColor: T.lime,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
});
