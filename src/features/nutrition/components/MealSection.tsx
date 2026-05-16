import { COLORS, FONTS, spacing } from "@/src/theme";
import { StyleSheet, Text, View } from "react-native";
import type { MealEntry } from "../types";
import { FoodLogItem } from "./FoodLogItem";

// ─── Meal metadata ────────────────────────────────────────────────────────────
const MEAL_META: Record<string, { icon: string; color: string }> = {
  Breakfast: { icon: "🌅", color: COLORS.orange },
  Lunch: { icon: "☀️", color: COLORS.blue },
  Dinner: { icon: "🌙", color: "#9B6DFF" },
  Snack: { icon: "🍎", color: COLORS.accent },
};

type Props = { title: string; items: MealEntry[] };

export function MealSection({ title, items }: Props) {
  if (items.length === 0) return null;

  const meta = MEAL_META[title] ?? { icon: "🍽️", color: COLORS.muted };

  // Aggregate totals
  const totalCal = items.reduce((a, i) => a + i.cal, 0);
  const totalP = items.reduce((a, i) => a + i.protein, 0);
  const totalC = items.reduce((a, i) => a + i.carbs, 0);
  const totalF = items.reduce((a, i) => a + i.fat, 0);

  return (
    <View style={s.wrap}>
      {/* ── Section header ─────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          {/* Icon badge */}
          <View style={[s.iconBadge, { backgroundColor: meta.color + "18" }]}>
            <Text style={s.icon}>{meta.icon}</Text>
          </View>

          {/* Title + item count */}
          <View style={s.titleWrap}>
            <Text style={s.title}>{title}</Text>
            <Text style={s.count}>
              {items.length} item{items.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* Right — calorie badge + macro summary */}
        <View style={s.headerRight}>
          <View
            style={[
              s.calBadge,
              {
                backgroundColor: meta.color + "15",
                borderColor: meta.color + "30",
              },
            ]}
          >
            <Text style={[s.calBadgeText, { color: meta.color }]}>
              {totalCal} kcal
            </Text>
          </View>
          <Text style={s.macroSummary}>
            P{totalP}g · C{totalC}g · F{totalF}g
          </Text>
        </View>
      </View>

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      <View style={[s.divider, { backgroundColor: meta.color + "30" }]} />

      {/* ── Food items ──────────────────────────────────────────────────────── */}
      {items.map((item) => (
        <FoodLogItem key={item.id} item={item} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    marginBottom: spacing.xl,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 16,
  },
  titleWrap: {
    gap: 1,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  count: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.muted,
  },

  // ── Right side ───────────────────────────────────────────────────────────────
  headerRight: {
    alignItems: "flex-end",
    gap: 3,
  },
  calBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 7,
    borderWidth: 1,
  },
  calBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  macroSummary: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.muted,
  },

  // ── Divider ──────────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    borderRadius: 1,
    marginBottom: spacing.sm,
  },
});
