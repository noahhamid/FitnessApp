import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Utensils, ChevronDown } from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";
import type { MealLogEntry } from "@/src/features/nutrition/types/nutrition.types";
import { parseLocalDateKey } from "../lib/localDate";

type DayGroup = {
  date: string;
  meals: MealLogEntry[];
  totalCal: number;
};

type Props = {
  meals: MealLogEntry[];
  isLoading?: boolean;
};

/** Same reveal cadence as ExerciseLibrarySection. */
const PAGE_SIZE = 5;

function formatDayHeader(dateKey: string): string {
  const d = parseLocalDateKey(dateKey);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === yesterday.getTime()) return "Yesterday";

  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function groupByDay(meals: MealLogEntry[]): DayGroup[] {
  const map = new Map<string, MealLogEntry[]>();
  for (const m of meals) {
    const list = map.get(m.log_date) ?? [];
    list.push(m);
    map.set(m.log_date, list);
  }

  // Newest day first for a history feed.
  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([date, dayMeals]) => ({
      date,
      meals: dayMeals,
      totalCal: dayMeals.reduce((sum, m) => sum + m.cal, 0),
    }));
}

export function MealHistoryCard({ meals, isLoading }: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const groups = useMemo(() => groupByDay(meals), [meals]);
  const visibleGroups = groups.slice(0, visibleCount);
  const hasMore = groups.length > visibleCount;
  const remaining = groups.length - visibleCount;

  if (isLoading) {
    return (
      <GlassSurface style={s.card}>
        <Text style={s.eyebrow}>MEAL HISTORY · 30 DAYS</Text>
        <View style={s.centerState}>
          <ActivityIndicator color={T.accent} />
        </View>
      </GlassSurface>
    );
  }

  if (groups.length === 0) {
    return (
      <GlassSurface style={s.card}>
        <Text style={s.eyebrow}>MEAL HISTORY · 30 DAYS</Text>
        <View style={s.emptyRow}>
          <View style={s.iconWrap}>
            <Utensils size={18} color={T.accent} strokeWidth={2.2} />
          </View>
          <Text style={s.emptyText}>
            Logged meals from the last 30 days will show up here.
          </Text>
        </View>
      </GlassSurface>
    );
  }

  return (
    <GlassSurface style={s.card}>
      <Text style={s.eyebrow}>MEAL HISTORY · 30 DAYS</Text>

      <View style={s.list}>
        {visibleGroups.map((group) => (
          <View key={group.date} style={s.dayBlock}>
            <View style={s.dayHeader}>
              <Text style={s.dayLabel}>{formatDayHeader(group.date)}</Text>
              <Text style={s.dayTotal}>{group.totalCal} kcal</Text>
            </View>

            {group.meals.map((meal) => (
              <View key={meal.id} style={s.mealRow}>
                <View style={s.mealText}>
                  <Text style={s.mealName} numberOfLines={1}>
                    {meal.name}
                  </Text>
                  <Text style={s.mealMeta}>{meal.meal}</Text>
                </View>
                <Text style={s.mealCal}>{meal.cal}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {hasMore && (
        <Pressable
          style={s.seeMoreBtn}
          onPress={() => setVisibleCount((c) => c + PAGE_SIZE)}
          hitSlop={8}
        >
          <Text style={s.seeMoreText}>
            See {Math.min(remaining, PAGE_SIZE)} more
          </Text>
          <ChevronDown size={14} color={T.accent} strokeWidth={2.4} />
        </Pressable>
      )}
    </GlassSurface>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      borderRadius: T.radius.lg,
      padding: T.space.lg,
    },
    eyebrow: {
      fontFamily: T.bodyBold,
      fontSize: 10,
      letterSpacing: 0.8,
      color: T.muted,
      marginBottom: 14,
      zIndex: 1,
    },
    centerState: {
      alignItems: "center",
      paddingVertical: T.space.xl,
      zIndex: 1,
    },
    emptyRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: T.space.md,
      zIndex: 1,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: T.accentTint,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      flex: 1,
      fontFamily: T.bodyMed,
      fontSize: 12.5,
      color: T.muted,
      lineHeight: 18,
    },
    list: { gap: 16, zIndex: 1 },
    dayBlock: { gap: 8 },
    dayHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    dayLabel: {
      fontFamily: T.bodySemi,
      fontSize: 13,
      color: T.white,
    },
    dayTotal: {
      fontFamily: T.bodyMed,
      fontSize: 12,
      color: T.muted,
      fontVariant: ["tabular-nums"],
    },
    mealRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: T.space.md,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: T.bgElevated,
      borderRadius: T.radius.sm,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.glassBorder,
    },
    mealText: { flex: 1, minWidth: 0 },
    mealName: {
      fontFamily: T.bodySemi,
      fontSize: 13,
      color: T.white,
    },
    mealMeta: {
      fontFamily: T.bodyMed,
      fontSize: 11,
      color: T.muted,
      marginTop: 1,
    },
    mealCal: {
      fontFamily: T.bodySemi,
      fontSize: 13,
      color: T.accent,
      fontVariant: ["tabular-nums"],
    },
    seeMoreBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingVertical: 14,
      marginTop: 4,
      zIndex: 1,
    },
    seeMoreText: {
      fontFamily: T.display,
      color: T.accent,
      fontSize: 13,
      letterSpacing: -0.1,
    },
  });
}
