import { Flame } from "lucide-react-native";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import { useTheme } from "@/src/context/ThemeContext";
import type { AppTheme } from "@/src/theme";

/**
 * Warm orange for streak Flame — same values as TodaySnapshotRow calorie icon
 * (SEMANTIC.calories.icon). Do not invent a third orange.
 */
export const STREAK_FLAME_ORANGE = {
  light: "#D96B1F",
  dark: "#FF9B4A",
} as const;

type Props = {
  days: number;
  /**
   * `count` — just the number (headers / Progress tile).
   * `day-streak` — "N-day streak" (Nutrition eyebrow row).
   */
  label?: "count" | "day-streak";
  style?: StyleProp<ViewStyle>;
};

/**
 * Canonical streak chip — glass tint (`T.accentTint`), warm-orange Flame.
 * Use everywhere instead of per-screen solid-accent / ad-hoc glass pills.
 */
export function StreakPill({
  days,
  label = "count",
  style,
}: Props) {
  const { styles: s } = useThemedStyles(makeStyles);
  const { resolved } = useTheme();
  const flameColor = STREAK_FLAME_ORANGE[resolved];
  const text =
    label === "day-streak" ? `${days}-day streak` : String(days);

  return (
    <View
      style={[s.pill, style]}
      accessibilityRole="text"
      accessibilityLabel={`${days} day streak`}
    >
      <Flame size={13} color={flameColor} strokeWidth={2.4} />
      <Text style={s.text}>{text}</Text>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: T.accentTint,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.accentLine,
      borderRadius: 999,
      paddingVertical: 7,
      paddingHorizontal: 11,
      flexShrink: 0,
    },
    text: {
      fontFamily: T.bodyBold,
      fontSize: 11,
      color: T.accent,
      fontVariant: ["tabular-nums"],
    },
  });
}
