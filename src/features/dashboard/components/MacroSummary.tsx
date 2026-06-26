import { NUTRITION_GOALS } from "@/src/features/nutrition/services/nutrition.service";
import {
  useDailyTotals,
  useNutritionGoals,
} from "@/src/features/nutrition/hooks/useNutrition";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { MacroBar } from "./DashboardComponents";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
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
};

type MacroEntry = {
  label: string;
  value: number;
  max: number;
  calPerG: number;
};

export function MacroSummary() {
  const { data: goals } = useNutritionGoals();
  const { data: totals, isPending: totalsPending } = useDailyTotals();

  const gp =
    typeof goals?.protein === "number"
      ? goals.protein
      : NUTRITION_GOALS.protein;
  const gc =
    typeof goals?.carbs === "number" ? goals.carbs : NUTRITION_GOALS.carbs;
  const gf = typeof goals?.fat === "number" ? goals.fat : NUTRITION_GOALS.fat;

  const macros: MacroEntry[] = [
    { label: "Protein", value: totals?.protein ?? 0, max: gp || 1, calPerG: 4 },
    { label: "Carbs", value: totals?.carbs ?? 0, max: gc || 1, calPerG: 4 },
    { label: "Fat", value: totals?.fat ?? 0, max: gf || 1, calPerG: 9 },
  ];

  const totalCalories = macros.reduce((sum, m) => sum + m.value * m.calPerG, 0);
  const totalGoalCal = Math.max(
    macros.reduce((sum, m) => sum + m.max * m.calPerG, 0),
    1,
  );
  const overallPct = Math.min(
    100,
    Math.round((totalCalories / totalGoalCal) * 100),
  );

  return (
    <View style={s.card}>
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.title}>MACROS</Text>
          <Text style={s.subtitle}>Today's breakdown</Text>
        </View>
        <View style={s.headerRight}>
          {totalsPending && <ActivityIndicator size="small" color={T.gold} />}
          <View style={s.kcalBadge}>
            <Text style={s.kcalValue}>{totalCalories.toLocaleString()}</Text>
            <Text style={s.kcalUnit}> kcal</Text>
          </View>
        </View>
      </View>

      {/* ── Overall progress strip ── */}
      <View style={s.overallRow}>
        <Text style={s.overallLabel}>MACRO CALORIES</Text>
        <Text style={s.overallPct}>{overallPct}%</Text>
      </View>
      <View style={s.overallTrack}>
        {macros.map((m, i) => {
          const segPct = ((m.value * m.calPerG) / totalGoalCal) * 100;
          const isLast = i === macros.length - 1;
          return (
            <View
              key={m.label}
              style={[
                s.overallSeg,
                {
                  width: `${segPct}%`,
                  // Vary gold opacity per macro so segments are distinguishable
                  // without introducing new colors: protein full, carbs 65%, fat 35%
                  backgroundColor:
                    i === 0 ? T.gold : i === 1 ? T.gold + "A6" : T.gold + "59",
                  borderTopLeftRadius: i === 0 ? 3 : 0,
                  borderBottomLeftRadius: i === 0 ? 3 : 0,
                  borderTopRightRadius: isLast ? 3 : 0,
                  borderBottomRightRadius: isLast ? 3 : 0,
                },
              ]}
            />
          );
        })}
      </View>

      {/* ── Macro rows ── */}
      <View style={s.bars}>
        {macros.map((m) => {
          const pct = Math.min(Math.round((m.value / m.max) * 100), 100);
          const isOver = m.value > m.max;
          const remaining = m.max - m.value;

          return (
            <View key={m.label} style={s.macroRow}>
              {/* Label + remainder */}
              <View style={s.macroHeader}>
                <View style={s.macroLeft}>
                  <Text style={s.macroLabel}>{m.label}</Text>
                  <Text style={s.macroSub}>
                    {isOver
                      ? `${(m.value - m.max).toFixed(0)}g over`
                      : `${remaining.toFixed(0)}g left`}
                  </Text>
                </View>
                <View style={s.macroRight}>
                  <Text style={[s.macroValue, isOver && { color: T.sub }]}>
                    {m.value}g
                  </Text>
                  <Text style={s.macroGoal}>/ {m.max}g</Text>
                  <View style={s.pctPill}>
                    <Text style={[s.pctText, isOver && { color: T.sub }]}>
                      {pct}%
                    </Text>
                  </View>
                </View>
              </View>

              {/* Progress bar */}
              <MacroBar
                label=""
                value={m.value}
                max={m.max}
                unit="g"
                color={isOver ? T.sub : T.gold}
              />
            </View>
          );
        })}
      </View>

      {/* ── Footer totals ── */}
      <View style={s.footer}>
        {macros.map((m) => (
          <View key={m.label} style={s.footerItem}>
            <Text style={s.footerValue}>{m.value}g</Text>
            <Text style={s.footerLabel}>{m.label}</Text>
            <Text style={s.footerGoal}>of {m.max}g</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  card: {
    backgroundColor: T.bg1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.borderMid,
    marginHorizontal: 16,
    padding: 20,
    gap: 14,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { gap: 2 },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    color: T.sub,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },
  kcalBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: T.bg2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: T.borderMid,
  },
  kcalValue: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: T.gold,
  },
  kcalUnit: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },

  // Overall strip
  overallRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  overallLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 10,
    color: T.muted,
    letterSpacing: 1.2,
  },
  overallPct: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    color: T.gold,
  },
  overallTrack: {
    flexDirection: "row",
    height: 5,
    backgroundColor: T.bg3,
    borderRadius: 3,
    overflow: "hidden",
    gap: 2,
  },
  overallSeg: {
    height: "100%",
  },

  // Macro rows
  bars: {
    gap: 14,
  },
  macroRow: {
    gap: 6,
  },
  macroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  macroLeft: { gap: 1 },
  macroLabel: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 13,
    color: T.text,
  },
  macroSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 9,
    color: T.muted,
  },
  macroRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  macroValue: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 14,
    color: T.gold,
    lineHeight: 16,
  },
  macroGoal: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },
  pctPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: T.goldDim,
    borderWidth: 1,
    borderColor: T.goldBorder,
    marginLeft: 2,
  },
  pctText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 10,
    color: T.gold,
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: T.border,
  },
  footerItem: {
    alignItems: "center",
    gap: 2,
  },
  footerValue: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 20,
    color: T.text,
  },
  footerLabel: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 10,
    color: T.sub,
  },
  footerGoal: {
    fontFamily: "DMSans_400Regular",
    fontSize: 9,
    color: T.muted,
  },
});
