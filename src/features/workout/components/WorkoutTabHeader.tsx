import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { topInset } from "@/src/lib/safe-area";
import { useWorkoutStreak } from "../hooks/useWorkoutStreak";
import { StreakPill } from "@/src/components/StreakPill";

type Props = {
  name: string;
  /** Short line under the coach headline. */
  subtitle?: string;
  avatarUrl: string;
};

export function WorkoutTabHeader({
  name,
  subtitle = "Ready to move today?",
  avatarUrl,
}: Props) {
  const { styles: s } = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { streakDays } = useWorkoutStreak();

  return (
    <View style={[s.row, { paddingTop: topInset(insets.top) + 8 }]}>
      <View style={s.left}>
        <View style={s.avatarRing}>
          <Image source={{ uri: avatarUrl }} style={s.avatar} />
        </View>

        <View style={s.copy}>
          <Text style={s.greeting} numberOfLines={1}>
            {name}, let's get to work
          </Text>
          <Text style={s.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
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
    left: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minWidth: 0,
    },
    copy: { flex: 1, minWidth: 0, gap: 3 },

    avatarRing: {
      width: 54,
      height: 54,
      borderRadius: 27,
      borderWidth: 1.5,
      borderColor: T.accent,
      padding: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    avatar: { width: "100%", height: "100%", borderRadius: 23 },

    // Was displayBold 22 — reduced to sit with 54px avatar + streak pill.
    greeting: {
      fontFamily: T.displaySemi,
      fontSize: 15,
      letterSpacing: -0.2,
      color: T.white,
    },
    subtitle: {
      fontFamily: T.bodyMed,
      fontSize: 12,
      color: T.faint,
    },
  });
}
