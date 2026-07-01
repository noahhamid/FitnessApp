import { StyleSheet, Text, View } from "react-native";
import type { MealLogEntry } from "../types/nutrition.types";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg0: "#121212",
  bg2: "#1E1E1E",
  bg3: "#252525",
  gold: "#FFC700",
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#5A5A5A",
};

/** Formats a UTC ISO timestamp to a local HH:MM string. */
function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = { item: MealLogEntry };

export function FoodLogItem({ item }: Props) {
  const time = formatTime(item.logged_at);

  return (
    <View style={s.row}>
      {/* Gold accent bar — single color, no per-meal variation */}
      <View style={s.accentBar} />

      {/* Main content */}
      <View style={s.content}>
        <Text style={s.name} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={s.metaRow}>
          <Text style={s.mealLabel}>{item.meal}</Text>
          <Text style={s.dot}>·</Text>
          <Text style={s.time}>{time}</Text>
        </View>
      </View>

      {/* Calories + macros */}
      <View style={s.right}>
        <View style={s.calRow}>
          <Text style={s.cal}>{item.cal}</Text>
          <Text style={s.calUnit}>kcal</Text>
        </View>
        <View style={s.macroRow}>
          <Text style={s.macro}>P{Math.round(item.protein)}g</Text>
          <Text style={s.macroDot}>·</Text>
          <Text style={s.macro}>C{Math.round(item.carbs)}g</Text>
          <Text style={s.macroDot}>·</Text>
          <Text style={s.macro}>F{Math.round(item.fat)}g</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg2,
    borderRadius: 14,
    marginBottom: 8,
    overflow: "hidden",
    gap: 12,
    paddingRight: 14,
    paddingVertical: 12,
    // No border — bg2 on bg0 is sufficient
  },

  // Gold accent bar — unified, no per-meal color
  accentBar: {
    width: 3,
    alignSelf: "stretch",
    borderRadius: 2,
    backgroundColor: T.gold,
  },

  // Content
  content: { flex: 1, gap: 4 },
  name: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: T.text,
    letterSpacing: 0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  mealLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
  },
  dot: {
    fontSize: 10,
    color: T.muted,
    opacity: 0.5,
  },
  time: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
  },

  // Right — calories + macros
  right: { alignItems: "flex-end", gap: 3 },
  calRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  cal: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 20,
    color: T.gold, // Gold calorie count
    lineHeight: 22,
  },
  calUnit: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
  },
  macroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  macro: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.sub,
  },
  macroDot: {
    fontSize: 10,
    color: T.muted,
    opacity: 0.5,
  },
});
