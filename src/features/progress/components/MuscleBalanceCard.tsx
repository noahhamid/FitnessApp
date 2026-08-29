import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";
import type { WorkoutSessionSummary } from "../hooks/useProgress";
import { muscleGroupBalance } from "../lib/analytics";

type Props = {
  sessions: WorkoutSessionSummary[];
  /** exerciseName → muscleGroup from GET /api/workouts/exercises */
  nameToGroup: Map<string, string>;
};

export function MuscleBalanceCard({ sessions, nameToGroup }: Props) {
  const { styles: s } = useThemedStyles(makeStyles);

  const rows = useMemo(() => {
    const from = new Date();
    from.setDate(from.getDate() - 28);
    from.setHours(0, 0, 0, 0);
    return muscleGroupBalance(sessions, nameToGroup, from).slice(0, 8);
  }, [sessions, nameToGroup]);

  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <GlassSurface style={s.card}>
      <Text style={s.eyebrow}>MUSCLE BALANCE · 4 WEEKS</Text>
      <Text style={s.title}>Where the work went</Text>
      <Text style={s.sub}>
        Exercise appearances by muscle group — gaps show up as short bars.
      </Text>

      {rows.length === 0 ? (
        <Text style={s.empty}>No matched exercises yet</Text>
      ) : (
        <View style={s.list}>
          {rows.map((row) => (
            <View key={row.muscleGroup} style={s.row}>
              <Text style={s.label} numberOfLines={1}>
                {row.label}
              </Text>
              <View style={s.track}>
                <View
                  style={[
                    s.fill,
                    { width: `${Math.max(8, (row.count / max) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={s.count}>{row.count}</Text>
            </View>
          ))}
        </View>
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
      marginBottom: 8,
      zIndex: 1,
    },
    title: {
      fontFamily: T.displaySemi,
      fontSize: 17,
      color: T.white,
      letterSpacing: -0.3,
      zIndex: 1,
    },
    sub: {
      fontFamily: T.bodyMed,
      fontSize: 12,
      color: T.muted,
      marginTop: 4,
      marginBottom: 16,
      lineHeight: 17,
      zIndex: 1,
    },
    empty: {
      fontFamily: T.bodyMed,
      fontSize: 12,
      color: T.faint,
      zIndex: 1,
    },
    list: { gap: 10, zIndex: 1 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    label: {
      width: 78,
      fontFamily: T.bodySemi,
      fontSize: 12,
      color: T.white,
    },
    track: {
      flex: 1,
      height: 8,
      borderRadius: 4,
      backgroundColor: T.accentTint,
      overflow: "hidden",
    },
    fill: {
      height: "100%",
      borderRadius: 4,
      backgroundColor: T.accent,
    },
    count: {
      width: 28,
      textAlign: "right",
      fontFamily: T.bodyBold,
      fontSize: 12,
      color: T.muted,
      fontVariant: ["tabular-nums"],
    },
  });
}
