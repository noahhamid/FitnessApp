import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Flame } from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";
import type { WorkoutSessionSummary } from "../hooks/useProgress";
import { completedDayKeys, contributionGrid } from "../lib/analytics";
import { localDateOnly } from "../lib/localDate";

type Props = {
  streakDays: number;
  sessions: WorkoutSessionSummary[];
};

export function StreakHeroCard({ streakDays, sessions }: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const todayKey = localDateOnly();

  const weeks = useMemo(() => {
    const days = completedDayKeys(sessions);
    return contributionGrid(days, 6);
  }, [sessions]);

  return (
    <GlassSurface style={s.card}>
      <Text style={s.eyebrow}>STREAK</Text>
      <View style={s.heroRow}>
        <View style={s.iconWrap}>
          <Flame size={22} color={T.accent} strokeWidth={2.2} />
        </View>
        <View style={s.heroText}>
          <Text style={s.heroNumber}>{streakDays}</Text>
          <Text style={s.heroUnit}>
            {streakDays === 1 ? "day" : "days"} in a row
          </Text>
        </View>
      </View>
      <Text style={s.sub}>
        {streakDays === 0
          ? "Train today to start a streak — consecutive calendar days with a completed session."
          : "Last six weeks of training days — filled cells are days you logged a session."}
      </Text>

      <View style={s.grid}>
        {weeks.map((row, wi) => (
          <View key={wi} style={s.gridRow}>
            {row.map((cell) => {
              const isToday = cell.date === todayKey;
              return (
                <View
                  key={cell.date}
                  style={[
                    s.cell,
                    cell.filled && s.cellFilled,
                    isToday && s.cellToday,
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
      <View style={s.legend}>
        <Text style={s.legendText}>Mon → Sun · oldest week on top</Text>
      </View>
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
      marginBottom: 12,
      zIndex: 1,
    },
    heroRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      zIndex: 1,
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: T.ringGlass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.ringBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    heroText: { flex: 1 },
    heroNumber: {
      fontFamily: T.displayBold,
      fontSize: 40,
      lineHeight: 42,
      color: T.white,
      letterSpacing: -1,
    },
    heroUnit: {
      fontFamily: T.bodySemi,
      fontSize: 14,
      color: T.muted,
      marginTop: 2,
    },
    sub: {
      fontFamily: T.bodyMed,
      fontSize: 12,
      color: T.muted,
      lineHeight: 17,
      marginTop: 12,
      marginBottom: 16,
      zIndex: 1,
    },
    grid: { gap: 4, zIndex: 1 },
    gridRow: { flexDirection: "row", gap: 4 },
    cell: {
      flex: 1,
      aspectRatio: 1,
      maxHeight: 18,
      borderRadius: 3,
      backgroundColor: T.accentTint,
    },
    cellFilled: {
      backgroundColor: T.accent,
    },
    cellToday: {
      borderWidth: 1,
      borderColor: T.white,
    },
    legend: { marginTop: 10, zIndex: 1 },
    legendText: { fontFamily: T.bodyMed, fontSize: 10, color: T.faint },
  });
}
