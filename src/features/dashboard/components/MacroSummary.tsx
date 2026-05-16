import { NUTRITION_GOALS } from "@/src/features/nutrition/services/nutrition.service";
import { StyleSheet, Text, View } from "react-native";
import { MacroBar } from "./DashboardComponents";

const T = {
  bg1: "#111114",
  bg2: "#18181D",
  bg3: "#222228",
  border: "#FFFFFF0F",
  borderMid: "#FFFFFF18",
  lime: "#C8F135",
  blue: "#3D8EFF",
  orange: "#FF8A00",
  red: "#FF3D3D",
  text: "#F2F2F5",
  sub: "#7A7A8C",
  muted: "#4A4A58",
};

type MacroEntry = {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  icon: string;
};

export function MacroSummary() {
  const macros: MacroEntry[] = [
    {
      label: "Protein",
      value: 142,
      max: NUTRITION_GOALS.protein,
      unit: "g",
      color: T.blue,
      icon: "💪",
    },
    {
      label: "Carbs",
      value: 198,
      max: NUTRITION_GOALS.carbs,
      unit: "g",
      color: T.orange,
      icon: "⚡",
    },
    {
      label: "Fat",
      value: 54,
      max: NUTRITION_GOALS.fat,
      unit: "g",
      color: T.red,
      icon: "🔥",
    },
  ];

  const totalCalories = 142 * 4 + 198 * 4 + 54 * 9;
  const totalGoalCal =
    NUTRITION_GOALS.protein * 4 +
    NUTRITION_GOALS.carbs * 4 +
    NUTRITION_GOALS.fat * 9;
  const overallPct = Math.round((totalCalories / totalGoalCal) * 100);

  return (
    <View style={s.card}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.title}>MACROS</Text>
          <Text style={s.subtitle}>Today's breakdown</Text>
        </View>
        <View style={s.kcalBadge}>
          <Text style={s.kcalValue}>{totalCalories.toLocaleString()}</Text>
          <Text style={s.kcalUnit}> kcal</Text>
        </View>
      </View>

      {/* ── Overall progress strip ─────────────────────────────────────────── */}
      <View style={s.overallRow}>
        <Text style={s.overallLabel}>Overall macro progress</Text>
        <Text style={s.overallPct}>{overallPct}%</Text>
      </View>
      <View style={s.overallTrack}>
        {macros.map((m, i) => {
          const segPct =
            ((m.value * (m.label === "Fat" ? 9 : 4)) / totalGoalCal) * 100;
          return (
            <View
              key={m.label}
              style={[
                s.overallSeg,
                {
                  width: `${segPct}%`,
                  backgroundColor: m.color,
                  borderTopLeftRadius: i === 0 ? 3 : 0,
                  borderBottomLeftRadius: i === 0 ? 3 : 0,
                  borderTopRightRadius: i === macros.length - 1 ? 3 : 0,
                  borderBottomRightRadius: i === macros.length - 1 ? 3 : 0,
                },
              ]}
            />
          );
        })}
      </View>

      {/* ── Macro rows ─────────────────────────────────────────────────────── */}
      <View style={s.bars}>
        {macros.map((m) => {
          const pct = Math.round((m.value / m.max) * 100);
          const remaining = m.max - m.value;
          const isOver = m.value > m.max;

          return (
            <View key={m.label} style={s.macroRow}>
              {/* Row header */}
              <View style={s.macroHeader}>
                <View style={s.macroHeaderLeft}>
                  <View
                    style={[s.iconBadge, { backgroundColor: m.color + "18" }]}
                  >
                    <Text style={s.icon}>{m.icon}</Text>
                  </View>
                  <View style={s.macroTitleWrap}>
                    <Text style={s.macroLabel}>{m.label}</Text>
                    <Text style={s.macroRemaining}>
                      {isOver
                        ? `${m.value - m.max}${m.unit} over`
                        : `${remaining}${m.unit} left`}
                    </Text>
                  </View>
                </View>
                <View style={s.macroHeaderRight}>
                  <Text style={[s.macroValue, { color: m.color }]}>
                    {m.value}
                    {m.unit}
                  </Text>
                  <Text style={s.macroGoal}>
                    / {m.max}
                    {m.unit}
                  </Text>
                  <View
                    style={[
                      s.pctBadge,
                      {
                        backgroundColor: m.color + "18",
                        borderColor: m.color + "30",
                      },
                    ]}
                  >
                    <Text style={[s.pctText, { color: m.color }]}>{pct}%</Text>
                  </View>
                </View>
              </View>

              {/* Bar */}
              <MacroBar
                label=""
                value={m.value}
                max={m.max}
                unit={m.unit}
                color={m.color}
              />
            </View>
          );
        })}
      </View>

      {/* ── Footer totals ──────────────────────────────────────────────────── */}
      <View style={s.footer}>
        {macros.map((m) => (
          <View key={m.label} style={s.footerItem}>
            <View style={[s.footerDot, { backgroundColor: m.color }]} />
            <Text style={[s.footerValue, { color: m.color }]}>
              {m.value}
              {m.unit}
            </Text>
            <Text style={s.footerLabel}>{m.label}</Text>
            <Text style={s.footerGoal}>
              of {m.max}
              {m.unit}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: T.bg1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.borderMid,
    marginHorizontal: 16,
    padding: 18,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  headerLeft: {
    gap: 2,
  },
  title: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.text,
    letterSpacing: 1.0,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },
  kcalBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: T.bg3,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: T.border,
  },
  kcalValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 15,
    color: T.text,
  },
  kcalUnit: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: T.sub,
  },

  // ── Overall strip ────────────────────────────────────────────────────────────
  overallRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  overallLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: T.muted,
  },
  overallPct: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    color: T.lime,
  },
  overallTrack: {
    flexDirection: "row",
    height: 6,
    backgroundColor: T.bg3,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 18,
    gap: 1,
  },
  overallSeg: {
    height: "100%",
  },

  // ── Macro rows ───────────────────────────────────────────────────────────────
  bars: {
    gap: 14,
    marginBottom: 16,
  },
  macroRow: {
    gap: 6,
  },
  macroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  macroHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 14,
  },
  macroTitleWrap: {
    gap: 1,
  },
  macroLabel: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
    color: T.text,
  },
  macroRemaining: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },
  macroHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  macroValue: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 14,
    lineHeight: 16,
  },
  macroGoal: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
  },
  pctBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    marginLeft: 2,
  },
  pctText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 10,
  },

  // ── Footer ───────────────────────────────────────────────────────────────────
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
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginBottom: 2,
  },
  footerValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 17,
  },
  footerLabel: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 10,
    color: T.text,
  },
  footerGoal: {
    fontFamily: "DMSans_400Regular",
    fontSize: 9,
    color: T.muted,
  },
});
