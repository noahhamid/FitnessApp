import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { topInset } from "@/src/lib/safe-area";
import { useWorkoutStreak } from "../hooks/useWorkoutStreak";
import { StreakPill } from "@/src/components/StreakPill";

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
        <Text style={s.title} numberOfLines={1}>
          {title}
        </Text>
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
    title: {
      fontFamily: T.displayBold,
      fontSize: 28,
      letterSpacing: -0.5,
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
