// src/components/DashboardComponents.jsx — Reusable Dashboard UI Components
// Fitness app · PotentialPeak
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import Svg, {
  Circle,
  Polyline,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { COLORS, DAYS, WEEKLY_DATA, WEIGHT_DATA } from "@/src/theme";

const { width: SCREEN_W } = Dimensions.get("window");
const CONTENT_W = Math.min(SCREEN_W, 430);

// ─────────────────────────────────────────────────────────────────────────────
// 1. RING CHART (SVG)
// ─────────────────────────────────────────────────────────────────────────────

export function RingChart({ pct, size = 120, stroke = 11, color = COLORS.accent, label, sublabel }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - pct / 100);

  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={COLORS.border} strokeWidth={stroke}
        />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          strokeDashoffset={`${dash}`}
        />
      </Svg>
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
          {value}<Text style={styles.macroBarUnit}> {unit}</Text>
        </Text>
      </View>
      <View style={styles.macroBarTrack}>
        <View style={[styles.macroBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SPARKLINE (SVG)
// ─────────────────────────────────────────────────────────────────────────────

export function Sparkline({ data, color, height = 38 }) {
  if (!data?.length) return null;
  const W   = 80;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = max - min || 1;

  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${height - ((v - min) / rng) * (height - 6) - 3}`)
    .join(" ");

  const lastPt = pts.split(" ").pop().split(",");
  const lastX  = parseFloat(lastPt[0]);
  const lastY  = parseFloat(lastPt[1]);

  return (
    <Svg width={W} height={height}>
      <Polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={lastX} cy={lastY} r="3" fill={color} />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. STAT TILE
// ─────────────────────────────────────────────────────────────────────────────

export function StatTile({ icon, label, value, unit, note, color, spark }) {
  return (
    <View style={styles.statTile}>
      <View style={styles.statTileTop}>
        <Text style={styles.statIcon}>{icon}</Text>
        {spark ? <Sparkline data={spark} color={color} /> : null}
      </View>
      <Text style={styles.statValue}>
        {value}<Text style={styles.statUnit}> {unit}</Text>
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
      {note ? <Text style={[styles.statNote, { color }]}>{note}</Text> : null}
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
        <TouchableOpacity onPress={onAction}>
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
      <View style={styles.calorieRow}>
        <RingChart pct={68} label="1,632" sublabel="KCAL" />
        <View style={styles.calorieRight}>
          <Text style={styles.calorieGoal}>GOAL: 2,400 KCAL</Text>
          <MacroBar label="Protein" value={142} max={180} unit="g" color={COLORS.blue}   />
          <MacroBar label="Carbs"   value={198} max={280} unit="g" color={COLORS.orange} />
          <MacroBar label="Fat"     value={54}  max={80}  unit="g" color={COLORS.red}    />
        </View>
      </View>
      <View style={styles.calorieSummary}>
        {[["768", "Remaining"], ["512", "Burned"], ["68%", "Done"]].map(([v, l]) => (
          <View key={l} style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{v}</Text>
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

function WeeklyBars({ data }) {
  const max      = Math.max(...data.map(d => d.cal), 1);
  const day      = new Date().getDay();
  const todayIdx = day === 0 ? 6 : day - 1;

  return (
    <View style={styles.weeklyBars}>
      {data.map((d, i) => {
        const hPct   = d.cal > 0 ? Math.max((d.cal / max) * 62, 6) : 6;
        const active = i === todayIdx;
        return (
          <View key={i} style={styles.barColumn}>
            <View style={[
              styles.bar,
              { height: hPct },
              active
                ? { backgroundColor: COLORS.accent }
                : d.workout
                  ? { backgroundColor: COLORS.bg3 }
                  : { backgroundColor: COLORS.muted2 },
            ]} />
            <Text style={[styles.barDay, active && { color: COLORS.accent, fontWeight: "700" }]}>
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
      <View style={styles.cardSummary}>
        {[["4", "Workouts"], ["1,602", "Avg kcal"], ["3h 20m", "Total"]].map(([v, l]) => (
          <View key={l} style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{v}</Text>
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
  const W    = CONTENT_W - 88;
  const H    = 76;
  const vals = data.map(d => d.w);
  const lo   = Math.min(...vals) - 0.5;
  const hi   = Math.max(...vals) + 0.5;
  const rng  = hi - lo;

  const pts = vals.map((v, i) => ({
    x: 14 + (i / (vals.length - 1)) * (W - 28),
    y: 6  + ((hi - v) / rng)        * (H - 12),
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${pts.at(-1).x},${H} L${pts[0].x},${H} Z`;

  return (
    <Svg width={W} height={H}>
      <Defs>
        <LinearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor={COLORS.accent} stopOpacity="0.16" />
          <Stop offset="100%" stopColor={COLORS.accent} stopOpacity="0"    />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill="url(#wg)" />
      <Path d={linePath} fill="none" stroke={COLORS.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <Circle
          key={i}
          cx={p.x} cy={p.y}
          r={i === pts.length - 1 ? 4 : 2.5}
          fill={i === pts.length - 1 ? COLORS.accent : COLORS.bg3}
          stroke={COLORS.accent}
          strokeWidth="1.5"
        />
      ))}
    </Svg>
  );
}

export function WeightCard() {
  return (
    <View style={styles.card}>
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
      <View style={styles.cardSummary}>
        {[["84.2 kg", "Start"], ["79.0 kg", "Goal"], ["87%", "Progress"]].map(([v, l]) => (
          <View key={l} style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { fontSize: 14 }]}>{v}</Text>
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
      <View>
        <Text style={styles.workoutTitle}>{title}</Text>
        <Text style={styles.workoutMeta}>{duration} · {sets}</Text>
      </View>
      <View style={[styles.workoutTag, { backgroundColor: `${tagColor}20` }]}>
        <Text style={[styles.workoutTagText, { color: tagColor }]}>{tag}</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. ACTION BUTTON
// ─────────────────────────────────────────────────────────────────────────────

export function ActionBtn({ icon, label, color, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionBtn, pressed && { transform: [{ scale: 0.93 }] }]}
    >
      <View style={[styles.actionBtnIcon, { backgroundColor: `${color}1e` }]}>
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
  { id: "home",      icon: "⊞",  label: "Home"      },
  { id: "workout",   icon: "🏋️", label: "Workout"   },
  { id: "nutrition", icon: "🍎", label: "Nutrition" },
  { id: "focus",     icon: "⚡",  label: "Focus"     },
  { id: "profile",   icon: "👤", label: "Profile"   },
];

export function BottomNav({ active, onChange }) {
  return (
    <View style={styles.bottomNav}>
      {NAV_ITEMS.map(item => {
        const isActive = active === item.id;
        const isFocus  = item.id === "focus";
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
              <Text style={[styles.navIcon, { opacity: isActive ? 1 : 0.3 }]}>{item.icon}</Text>
            )}
            <Text style={[styles.navLabel, isActive && { color: COLORS.accent, fontWeight: "700" }]}>
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
  // Ring Chart
  ringLabel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  ringValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 22,
    color: COLORS.text,
    lineHeight: 22,
  },
  ringSubLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: COLORS.muted,
    letterSpacing: 0.8,
    marginTop: 2,
  },

  // Macro Bar
  macroBarContainer: {
    marginBottom: 8,
  },
  macroBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  macroBarLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: COLORS.muted,
  },
  macroBarValue: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 11,
    color: COLORS.text,
  },
  macroBarUnit: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: COLORS.muted,
  },
  macroBarTrack: {
    height: 5,
    backgroundColor: COLORS.bg3,
    borderRadius: 2.5,
    overflow: "hidden",
  },
  macroBarFill: {
    height: "100%",
    borderRadius: 2.5,
  },

  // Stat Tile
  statTile: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    justifyContent: "space-between",
  },
  statTileTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 24,
    color: COLORS.text,
    lineHeight: 26,
  },
  statUnit: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: COLORS.muted,
  },
  statLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 4,
  },
  statNote: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    marginTop: 4,
  },

  // Section Title
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 14,
    color: COLORS.text,
    letterSpacing: 0.6,
  },
  sectionAction: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
    color: COLORS.accent,
  },

  // Calorie Card
  calorieCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  calorieRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  calorieRight: {
    flex: 1,
    marginLeft: 16,
  },
  calorieGoal: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  calorieSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  // Summary Item
  summaryItem: {
    alignItems: "center",
  },
  summaryValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 18,
    color: COLORS.text,
  },
  summaryLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 4,
  },

  // Weekly Bars
  weeklyBars: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 72,
    marginBottom: 12,
  },
  barColumn: {
    alignItems: "center",
  },
  bar: {
    width: 24,
    backgroundColor: COLORS.bg3,
    borderRadius: 4,
    marginBottom: 8,
  },
  barDay: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 11,
    color: COLORS.muted,
  },

  // Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  cardSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  // Weight Card
  weightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  weightSubTitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  weightRight: {
    alignItems: "flex-end",
  },
  weightValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 18,
    color: COLORS.text,
  },
  weightUnit: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: COLORS.muted,
  },
  weightDelta: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: COLORS.accent,
    marginTop: 2,
  },

  // Workout Row
  workoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  workoutTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 13,
    color: COLORS.text,
  },
  workoutMeta: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  workoutTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  workoutTagText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.5,
  },

  // Action Button
  actionBtn: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 6,
  },
  actionBtnIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
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
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 12,
  },

  // Bottom Navigation
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    height: 76,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: COLORS.muted,
  },
  focusBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
});