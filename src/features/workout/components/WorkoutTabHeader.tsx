import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { topInset } from "@/src/lib/safe-area";
import { useWorkoutStreak } from "../hooks/useWorkoutStreak";
import { StreakPill } from "@/src/components/StreakPill";
import { BrandWordmark } from "@/src/components/BrandWordmark";

type Props = {
  title?: string;
  /** Short line under the page title. */
  subtitle?: string;
};

export function WorkoutTabHeader({
  title = "Train",
  subtitle = "Ready to move today?",
}: Props) {
  const { styles: s } = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { streakDays } = useWorkoutStreak();

  return (
    <View style={[s.row, { paddingTop: topInset(insets.top) + 8 }]}>
      <View style={s.copy}>
        <View style={s.heading}>
          <BrandWordmark size={22} />
          <Text style={s.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <Text style={s.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <StreakPill days={streakDays} />
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
      gap: 10,
    },
    copy: { flex: 1, minWidth: 0, gap: 4 },
    heading: {
      flexDirection: "row",
      alignItems: "baseline",
      flexWrap: "wrap",
      gap: 8,
      minWidth: 0,
    },
    title: {
      fontFamily: T.displayBold,
      fontSize: 22,
      letterSpacing: -0.3,
      color: T.white,
      flexShrink: 1,
    },
    subtitle: {
      fontFamily: T.bodyMed,
      fontSize: 12,
      color: T.faint,
    },
  });
}
