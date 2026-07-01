import { COLORS } from "@/src/ui/tokens/colors";
import { spacing } from "@/src/ui/tokens/spacing";
import { FONTS } from "@/src/ui/tokens/typography";
import { StyleSheet, Text, View } from "react-native";
import type { MealLogEntry } from "../types/nutrition.types";
import { FoodLogItem } from "./FoodLogItem";

// ─── Theme constants ──────────────────────────────────────────────────────────
const GOLD = "#FFC700";
const SURFACE = "#1E1E1E";
const SURFACE_RAISED = "#2A2A2A";
const DIVIDER = "#2C2C2C";

// ─── Meal metadata (icons only — color is unified to gold theme) ──────────────
const MEAL_META: Record<string, { icon: string }> = {
  Breakfast: { icon: "🌅" },
  Lunch: { icon: "☀️" },
  Dinner: { icon: "🌙" },
  Snack: { icon: "🍎" },
};

type Props = { title: string; items: MealLogEntry[] };

export function MealSection({ title, items }: Props) {
  if (items.length === 0) return null;

  const meta = MEAL_META[title] ?? { icon: "🍽️" };

  const totalCal = items.reduce((a, i) => a + i.cal, 0);
  const totalP = Math.round(items.reduce((a, i) => a + Number(i.protein), 0));
  const totalC = Math.round(items.reduce((a, i) => a + Number(i.carbs), 0));
  const totalF = Math.round(items.reduce((a, i) => a + Number(i.fat), 0));

  return (
    <View style={s.wrap}>
      {/* ── Section header ──────────────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.iconBadge}>
            <Text style={s.icon}>{meta.icon}</Text>
          </View>
          <View style={s.titleWrap}>
            <Text style={s.title}>{title}</Text>
            <Text style={s.count}>
              {items.length} item{items.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        <View style={s.headerRight}>
          <View style={s.calBadge}>
            <Text style={s.calBadgeText}>{totalCal} kcal</Text>
          </View>
          <Text style={s.macroSummary}>
            P{totalP}g · C{totalC}g · F{totalF}g
          </Text>
        </View>
      </View>

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      <View style={s.divider} />

      {/* ── Food items ──────────────────────────────────────────────────────── */}
      {items.map((item) => (
        <FoodLogItem key={item.id} item={item} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: SURFACE,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
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
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: SURFACE_RAISED,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 17,
  },
  titleWrap: {
    gap: 2,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.text, // #FFFFFF
    letterSpacing: 0.4,
  },
  count: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.muted, // #A0A0A0
  },

  // ── Right side ───────────────────────────────────────────────────────────────
  headerRight: {
    alignItems: "flex-end",
    gap: 3,
  },
  calBadge: {
    backgroundColor: "rgba(255,199,0,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,199,0,0.22)",
    borderRadius: 7,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  calBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: GOLD,
    letterSpacing: 0.3,
  },
  macroSummary: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.muted, // #A0A0A0
  },

  // ── Divider ──────────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: DIVIDER,
    marginBottom: spacing.sm,
  },
});
