import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Flame } from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { topInset } from "@/src/lib/safe-area";
import { getGreeting } from "@/src/lib/greeting";
import { useWorkoutStreak } from "../hooks/useWorkoutStreak";

type Props = {
  name: string;
  /** Short line under the greeting. */
  subtitle?: string;
  avatarUrl: string;
};

export function WorkoutTabHeader({
  name,
  subtitle = "Ready to move today?",
  avatarUrl,
}: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { streakDays } = useWorkoutStreak();
  const greeting = getGreeting();

  return (
    <View style={[s.row, { paddingTop: topInset(insets.top) + 8 }]}>
      <View style={s.left}>
        <View style={s.avatarRing}>
          <Image source={{ uri: avatarUrl }} style={s.avatar} />
        </View>

        <View style={s.copy}>
          <Text style={s.greeting} numberOfLines={1}>
            {greeting}, {name}
          </Text>
          <Text style={s.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>

      <View
        style={s.streakBadge}
        accessibilityRole="text"
        accessibilityLabel={`${streakDays} day streak`}
      >
        <Flame size={13} color={T.onAccent} strokeWidth={2.4} />
        <Text style={s.streakText}>{streakDays}</Text>
      </View>
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

    greeting: {
      fontFamily: T.displayBold,
      fontSize: 17,
      letterSpacing: -0.3,
      color: T.white,
    },
    subtitle: {
      fontFamily: T.bodyMed,
      fontSize: 12,
      color: T.faint,
    },

    streakBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: T.accent,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 11,
      flexShrink: 0,
    },
    streakText: {
      fontFamily: T.bodyBold,
      fontSize: 12,
      color: T.onAccent,
      fontVariant: ["tabular-nums"],
    },
  });
}
