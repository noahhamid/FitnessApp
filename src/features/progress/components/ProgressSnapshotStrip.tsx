import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";
import { StreakPill } from "@/src/components/StreakPill";

type Props = {
  streakDays: number;
  sessionsThisWeek: number;
  /**
   * Same first→last delta as WeightTrendChart when ≥2 logs exist.
   * Null when there isn't enough weight history.
   */
  weightDeltaKg: number | null;
};

function SnapshotTile({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const { styles: s } = useThemedStyles(makeStyles);
  return (
    <GlassSurface style={s.tile}>
      <Text style={s.tileLabel}>{label}</Text>
      <View style={s.tileValueRow}>{children}</View>
    </GlassSurface>
  );
}

export function ProgressSnapshotStrip({
  streakDays,
  sessionsThisWeek,
  weightDeltaKg,
}: Props) {
  const { styles: s } = useThemedStyles(makeStyles);

  const weightText =
    weightDeltaKg == null
      ? "—"
      : `${weightDeltaKg > 0 ? "+" : ""}${weightDeltaKg.toFixed(1)}`;

  return (
    <View style={s.wrap}>
      <Text style={s.eyebrow}>This week</Text>
      <View style={s.row}>
        {/* Streak tile keeps the 3-col strip; shared StreakPill is the value. */}
        <SnapshotTile label="Streak">
          <StreakPill days={streakDays} style={s.streakInTile} />
        </SnapshotTile>

        <SnapshotTile label="Sessions">
          <Text style={s.tileValue}>{sessionsThisWeek}</Text>
        </SnapshotTile>

        <SnapshotTile label="Weight">
          <Text
            style={[
              s.tileValue,
              weightDeltaKg != null && weightDeltaKg !== 0 && s.tileValueAccent,
            ]}
          >
            {weightText}
          </Text>
          {weightDeltaKg != null && (
            <Text style={s.tileUnit}>kg</Text>
          )}
        </SnapshotTile>
      </View>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    wrap: { marginBottom: T.space.lg },
    eyebrow: {
      fontFamily: T.bodyBold,
      fontSize: 10,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: T.muted,
      marginBottom: 10,
    },
    row: {
      flexDirection: "row",
      gap: 8,
    },
    tile: {
      flex: 1,
      borderRadius: T.radius.md,
      paddingVertical: 12,
      paddingHorizontal: 10,
      minHeight: 72,
      justifyContent: "space-between",
      gap: 8,
    },
    tileLabel: {
      fontFamily: T.bodySemi,
      fontSize: 10,
      letterSpacing: 0.4,
      color: T.muted,
      zIndex: 1,
    },
    tileValueRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      zIndex: 1,
    },
    /** Pill sits inside the glass tile — slightly tighter so 3 cols stay even. */
    streakInTile: {
      paddingVertical: 5,
      paddingHorizontal: 8,
      alignSelf: "flex-start",
    },
    tileValue: {
      fontFamily: T.displayBold,
      fontSize: 22,
      letterSpacing: -0.4,
      color: T.white,
      fontVariant: ["tabular-nums"],
    },
    tileValueAccent: {
      color: T.accent,
    },
    tileUnit: {
      fontFamily: T.bodyMed,
      fontSize: 11,
      color: T.muted,
    },
  });
}
