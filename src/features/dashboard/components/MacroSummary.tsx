import { NUTRITION_GOALS } from "@/src/theme";
import { StyleSheet, Text, View } from "react-native";
import { MacroBar } from "./DashboardComponents";

// ─── Design tokens (mirror DashboardComponents) ───────────────────────────────
const T = {
  bg1: "#111114",
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

// ─── Types ────────────────────────────────────────────────────────────────────
type MacroEntry = {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
};

// ─── Component ────────────────────────────────────────────────────────────────
export function MacroSummary() {
  const macros: MacroEntry[] = [
    {
      label: "Protein",
      value: 142,
      max: NUTRITION_GOALS.protein,
      unit: "g",
      color: T.blue,
    },
    {
      label: "Carbs",
      value: 198,
      max: NUTRITION_GOALS.carbs,
      unit: "g",
      color: T.orange,
    },
    {
      label: "Fat",
      value: 54,
      max: NUTRITION_GOALS.fat,
      unit: "g",
      color: T.red,
    },
  ];

  const totalCalories = 142 * 4 + 198 * 4 + 54 * 9; // protein*4 + carbs*4 + fat*9

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>MACROS</Text>
        <View style={s.kcalBadge}>
          <Text style={s.kcalValue}>{totalCalories.toLocaleString()}</Text>
          <Text style={s.kcalUnit}> kcal</Text>
        </View>
      </View>

      {/* Macro rows */}
      <View style={s.bars}>
        {macros.map((m) => {
          const pct = Math.round((m.value / m.max) * 100);
          return (
            <View key={m.label} style={s.macroRow}>
              {/* Left: label + percent */}
              <View style={s.macroMeta}>
                <View style={[s.dot, { backgroundColor: m.color }]} />
                <Text style={s.macroLabel}>{m.label}</Text>
                <Text style={[s.macroPct, { color: m.color }]}>{pct}%</Text>
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

      {/* Footer totals */}
      <View style={s.footer}>
        {macros.map((m) => (
          <View key={m.label} style={s.footerItem}>
            <Text style={[s.footerValue, { color: m.color }]}>
              {m.value}
              {m.unit}
            </Text>
            <Text style={s.footerLabel}>{m.label}</Text>
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
    padding: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.text,
    letterSpacing: 1.0,
  },
  kcalBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: T.bg3,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
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
  bars: {
    gap: 6,
    marginBottom: 16,
  },
  macroRow: {
    gap: 4,
  },
  macroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  macroLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: T.sub,
    flex: 1,
  },
  macroPct: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 11,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: T.border,
  },
  footerItem: {
    alignItems: "center",
  },
  footerValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 17,
  },
  footerLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: T.muted,
    marginTop: 2,
  },
});
