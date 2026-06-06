import { COLORS } from "@/src/ui/tokens/colors";
import { spacing } from "@/src/ui/tokens/spacing";
import { FONTS } from "@/src/ui/tokens/typography";
import { StyleSheet, Text, View } from "react-native";
import type { MealLogEntry } from "../types/nutrition.types";

// ─── Meal accent colors ───────────────────────────────────────────────────────
const MEAL_COLORS: Record<string, string> = {
  Breakfast: COLORS.orange,
  Lunch: COLORS.blue,
  Dinner: "#9B6DFF",
  Snack: COLORS.accent,
};

const MEAL_ICONS: Record<string, string> = {
  Breakfast: "🌅",
  Lunch: "☀️",
  Dinner: "🌙",
  Snack: "🍎",
};

type Props = { item: MealLogEntry };

/** Formats a UTC ISO timestamp to a local HH:MM string. */
function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FoodLogItem({ item }: Props) {
  const mealColor = MEAL_COLORS[item.meal] ?? COLORS.muted;
  const mealIcon = MEAL_ICONS[item.meal] ?? "🍽️";
  const time = formatTime(item.logged_at);

  return (
    <View style={s.row}>
      {/* Left accent bar */}
      <View style={[s.accentBar, { backgroundColor: mealColor }]} />

      {/* Icon badge */}
      <View style={[s.iconBadge, { backgroundColor: mealColor + "18" }]}>
        <Text style={s.icon}>{mealIcon}</Text>
      </View>

      {/* Main content */}
      <View style={s.content}>
        <Text style={s.name} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={s.metaRow}>
          <View
            style={[
              s.mealTag,
              {
                backgroundColor: mealColor + "18",
                borderColor: mealColor + "35",
              },
            ]}
          >
            <Text style={[s.mealTagText, { color: mealColor }]}>
              {item.meal}
            </Text>
          </View>
          <Text style={s.time}>{time}</Text>
        </View>
      </View>

      {/* Macros + cal */}
      <View style={s.right}>
        <Text style={s.cal}>{item.cal}</Text>
        <Text style={s.calUnit}>kcal</Text>
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
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: spacing.sm,
    overflow: "hidden",
    gap: spacing.sm,
    paddingRight: spacing.md,
    paddingVertical: spacing.md,
  },

  // Left accent bar
  accentBar: {
    width: 3,
    alignSelf: "stretch",
    borderRadius: 2,
  },

  // Icon badge
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 16,
  },

  // Content
  content: {
    flex: 1,
    gap: 5,
  },
  name: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.text,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  mealTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  mealTagText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  time: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.muted,
  },

  // Right side
  right: {
    alignItems: "flex-end",
    gap: 2,
  },
  cal: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.accent,
    lineHeight: 20,
  },
  calUnit: {
    fontFamily: FONTS.regular,
    fontSize: 9,
    color: COLORS.muted,
  },
  macroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
  macro: {
    fontFamily: FONTS.regular,
    fontSize: 9,
    color: COLORS.muted,
  },
  macroDot: {
    fontSize: 9,
    color: COLORS.muted2,
  },
});
