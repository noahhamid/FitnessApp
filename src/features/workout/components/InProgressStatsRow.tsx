import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

type Props = {
  /** Only render when ≥ 2 — callers should pass null otherwise. */
  streakDays: number | null;
};

/**
 * Quiet streak companion under ContinueWorkoutCard.
 * PR highlight lives inside ContinueWorkoutCard now.
 */
export function InProgressStatsRow({ streakDays }: Props) {
  const { styles: s } = useThemedStyles(makeStyles);

  if (streakDays == null) return null;

  return (
    <View style={s.card}>
      <Text style={s.eyebrow}>Streak</Text>
      <Text style={s.value}>{streakDays} days</Text>
      <Text style={s.detail}>Completed workouts in a row</Text>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: T.bgElevated,
      borderWidth: 0.5,
      borderColor: T.glassBorder,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 14,
      gap: 4,
      ...T.shadow.card,
    },
    eyebrow: {
      fontFamily: T.bodyBold,
      fontSize: 9.5,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: T.muted,
    },
    value: {
      fontFamily: T.displaySemi,
      fontSize: 18,
      letterSpacing: -0.3,
      color: T.white,
      fontVariant: ["tabular-nums"],
    },
    detail: {
      fontFamily: T.bodyMed,
      fontSize: 11.5,
      color: T.faint,
      lineHeight: 15,
    },
  });
}
