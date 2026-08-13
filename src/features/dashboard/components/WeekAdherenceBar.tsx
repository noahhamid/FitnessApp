import { Pressable, StyleSheet, Text, View } from "react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "./GlassSurface";

type Props = {
  completed: number;
  target: number;
  onPressOverview?: () => void;
};

export function WeekAdherenceBar({
  completed,
  target,
  onPressOverview,
}: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const safeTarget = Math.max(1, target);
  const ratio = Math.min(1, Math.max(0, completed / safeTarget));
  const label =
    target > 0
      ? `${completed} of ${target} sessions`
      : `${completed} sessions`;

  return (
    <GlassSurface style={s.card}>
      <View style={s.topRow}>
        <View style={s.copy}>
          <Text style={s.title}>This week</Text>
          <Text style={s.meta}>{label}</Text>
        </View>
        {onPressOverview ? (
          <Pressable
            onPress={onPressOverview}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Open progress overview"
          >
            <Text style={s.link}>Overview →</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={s.track} accessibilityRole="progressbar">
        <View style={[s.fill, { width: `${Math.round(ratio * 100)}%` }]} />
      </View>
    </GlassSurface>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      borderRadius: T.radius.lg,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 10,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    copy: { flex: 1, gap: 2 },
    title: {
      fontFamily: T.bodySemi,
      fontSize: 13.5,
      color: T.white,
    },
    meta: {
      fontFamily: T.bodyMed,
      fontSize: 11.5,
      color: T.faint,
      fontVariant: ["tabular-nums"],
    },
    link: {
      fontFamily: T.bodySemi,
      fontSize: 11,
      color: T.accent,
    },
    track: {
      height: 6,
      borderRadius: 3,
      backgroundColor: T.border,
      overflow: "hidden",
    },
    fill: {
      height: "100%",
      borderRadius: 3,
      backgroundColor: T.accent,
    },
  });
}
