import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";
import { localDateOnly } from "../lib/localDate";

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

type WeekDay = {
  date: string;
  filled: boolean;
  /** Planned training day (Tue/Thu/Sat), not just "any weekday". */
  scheduled?: boolean;
};

type Props = {
  /** Scheduled training days hit this calendar week. */
  completedThisWeek: number;
  targetPerWeek: number;
  /** Mon→Sun cells for the current week (from contributionGrid). */
  weekDays: WeekDay[];
};

export function ConsistencyCard({
  completedThisWeek,
  targetPerWeek,
  weekDays,
}: Props) {
  const { styles: s } = useThemedStyles(makeStyles);
  const todayKey = localDateOnly();

  return (
    <GlassSurface style={s.card}>
      <View style={s.headerRow}>
        <Text style={s.label}>THIS WEEK</Text>
        <Text style={s.count}>
          {completedThisWeek}
          <Text style={s.countDim}> / {targetPerWeek} scheduled</Text>
        </Text>
      </View>

      <View style={s.dotsRow}>
        {WEEKDAY_LABELS.map((label, i) => {
          const day = weekDays[i];
          const filled = day?.filled ?? false;
          const scheduled = day?.scheduled ?? true;
          const isToday = day?.date === todayKey;
          return (
            <View key={`${label}-${i}`} style={s.dotCol}>
              <View
                style={[
                  s.dot,
                  !scheduled && s.dotRest,
                  filled && scheduled && s.dotFilled,
                  filled && !scheduled && s.dotBonus,
                  isToday && s.dotToday,
                ]}
              />
              <Text style={[s.dayLabel, isToday && s.dayLabelToday]}>
                {label}
              </Text>
            </View>
          );
        })}
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
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
      zIndex: 1,
    },
    label: {
      fontFamily: T.bodyBold,
      fontSize: 10,
      letterSpacing: 1.2,
      color: T.muted,
      textTransform: "uppercase",
    },
    count: { fontFamily: T.displaySemi, fontSize: 15, color: T.white },
    countDim: { fontFamily: T.bodyMed, fontSize: 12, color: T.muted },
    dotsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 6,
      zIndex: 1,
    },
    dotCol: {
      flex: 1,
      alignItems: "center",
      gap: 6,
    },
    dot: {
      width: "100%",
      aspectRatio: 1,
      maxWidth: 28,
      maxHeight: 28,
      borderRadius: 8,
      backgroundColor: T.accentTint,
    },
    dotFilled: {
      backgroundColor: T.accent,
    },
    dotRest: {
      backgroundColor: T.border,
      opacity: 0.45,
    },
    dotBonus: {
      backgroundColor: T.muted,
      opacity: 0.7,
    },
    dotToday: {
      borderWidth: 1.5,
      borderColor: T.white,
    },
    dayLabel: {
      fontFamily: T.bodySemi,
      fontSize: 10,
      color: T.faint,
    },
    dayLabelToday: {
      color: T.white,
    },
  });
}
