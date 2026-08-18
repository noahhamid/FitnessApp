import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Dumbbell, Flame, Scale } from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import { useTheme } from "@/src/context/ThemeContext";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";
import { STREAK_FLAME_ORANGE } from "@/src/components/StreakPill";

type Props = {
  streakDays: number;
  sessionsThisWeek: number;
  weightDeltaKg: number | null;
};

export function ProgressSnapshotStrip({
  streakDays,
  sessionsThisWeek,
  weightDeltaKg,
}: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const { resolved } = useTheme();
  const flame = STREAK_FLAME_ORANGE[resolved];

  const weightText =
    weightDeltaKg == null
      ? "—"
      : `${weightDeltaKg > 0 ? "+" : ""}${weightDeltaKg.toFixed(1)}`;

  return (
    <View style={s.row}>
      <GlassSurface style={s.tile}>
        <View style={[s.iconWell, { backgroundColor: "rgba(217,107,31,0.12)" }]}>
          <Flame size={16} color={flame} strokeWidth={2.4} fill={flame} />
        </View>
        <Text style={s.value}>{streakDays}</Text>
        <Text style={s.label}>Day streak</Text>
      </GlassSurface>

      <GlassSurface style={s.tile}>
        <View style={s.iconWell}>
          <Dumbbell size={16} color={T.accent} strokeWidth={2.4} />
        </View>
        <Text style={s.value}>{sessionsThisWeek}</Text>
        <Text style={s.label}>Sessions</Text>
      </GlassSurface>

      <GlassSurface style={s.tile}>
        <View style={s.iconWell}>
          <Scale size={16} color={T.accent} strokeWidth={2.4} />
        </View>
        <Text
          style={[
            s.value,
            weightDeltaKg != null && weightDeltaKg !== 0 && s.valueAccent,
          ]}
          numberOfLines={1}
        >
          {weightText}
          {weightDeltaKg != null ? (
            <Text style={s.unit}> kg</Text>
          ) : null}
        </Text>
        <Text style={s.label}>Weight</Text>
      </GlassSurface>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      gap: 10,
      marginBottom: T.space.lg,
    },
    tile: {
      flex: 1,
      borderRadius: T.radius.lg,
      paddingVertical: 14,
      paddingHorizontal: 12,
      gap: 8,
      minHeight: 108,
    },
    iconWell: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: T.accentTint,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    },
    value: {
      fontFamily: T.displayBold,
      fontSize: 24,
      letterSpacing: -0.6,
      color: T.white,
      fontVariant: ["tabular-nums"],
      zIndex: 1,
    },
    valueAccent: {
      color: T.accent,
    },
    unit: {
      fontFamily: T.bodySemi,
      fontSize: 12,
      color: T.muted,
    },
    label: {
      fontFamily: T.bodyMed,
      fontSize: 11,
      color: T.muted,
      zIndex: 1,
    },
  });
}
