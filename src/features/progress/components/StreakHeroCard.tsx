import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Flame } from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";
import { useTheme } from "@/src/context/ThemeContext";
import { STREAK_FLAME_ORANGE } from "@/src/components/StreakPill";
import type { WorkoutSessionSummary } from "../hooks/useProgress";
import { completedDayKeys, contributionGrid } from "../lib/analytics";
import { localDateOnly, parseLocalDateKey } from "../lib/localDate";

type Props = {
  streakDays: number;
  sessions: WorkoutSessionSummary[];
};

/** Mon→Sun — matches contributionGrid day order. */
const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"] as const;

const WEEK_COUNT = 8;

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function weekColumnLabel(
  weekIndex: number,
  weekCount: number,
  mondayKey: string,
): string {
  if (weekIndex === weekCount - 1) return "Now";
  if (weekIndex === 0) {
    const d = parseLocalDateKey(mondayKey);
    return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
  }
  return "";
}

export function StreakHeroCard({ streakDays, sessions }: Props) {
  const { T, styles: s } = useThemedStyles(makeStyles);
  const { resolved } = useTheme();
  const flame = STREAK_FLAME_ORANGE[resolved];
  const todayKey = localDateOnly();

  const weeks = useMemo(() => {
    const days = completedDayKeys(sessions);
    return contributionGrid(days, WEEK_COUNT);
  }, [sessions]);

  const dayRows = useMemo(() => {
    return DAY_LETTERS.map((letter, dayIndex) => ({
      letter,
      cells: weeks.map((week) => week[dayIndex]!),
    }));
  }, [weeks]);

  const weekLabels = useMemo(() => {
    return weeks.map((week, weekIndex) =>
      weekColumnLabel(weekIndex, weeks.length, week[0]!.date),
    );
  }, [weeks]);

  return (
    <GlassSurface style={s.card}>
      <Text style={s.eyebrow}>STREAK</Text>
      <View style={s.heroRow}>
        <View style={[s.iconWrap, { backgroundColor: "rgba(217,107,31,0.14)" }]}>
          <Flame size={22} color={flame} strokeWidth={2.2} fill={flame} />
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
          ? "Finish a workout today to start your streak."
          : "Last 8 weeks of training. Each square is a day — red means you worked out."}
      </Text>

      <View style={s.graph}>
        <View style={s.monthRow}>
          <View style={s.dayGutter} />
          <View style={s.monthTrack}>
            {weekLabels.map((label, wi) => (
              <View
                key={`m-${wi}`}
                style={[
                  s.monthCell,
                  wi === weekLabels.length - 1 && s.monthCellEnd,
                ]}
              >
                {label ? (
                  <Text
                    style={[
                      s.monthLabel,
                      wi === weekLabels.length - 1 && s.monthLabelEnd,
                    ]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        </View>

        {dayRows.map((row, rowIndex) => (
          <View key={`d-${rowIndex}`} style={s.graphRow}>
            <View style={s.dayGutter}>
              <Text style={s.dayLabel}>{row.letter}</Text>
            </View>
            <View style={s.cellsRow}>
              {row.cells.map((cell) => {
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
          </View>
        ))}
      </View>

      <View style={s.legend}>
        <Text style={s.legendText}>Rest day</Text>
        <View style={[s.legendSwatch, { backgroundColor: T.accentTint }]} />
        <View style={[s.legendSwatch, s.cellFilled]} />
        <Text style={s.legendText}>Trained</Text>
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
      marginBottom: 14,
      zIndex: 1,
    },
    graph: { gap: 3, zIndex: 1 },
    monthRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginBottom: 2,
      minHeight: 14,
    },
    monthTrack: {
      flex: 1,
      flexDirection: "row",
      gap: 3,
    },
    monthCell: {
      flex: 1,
      alignItems: "flex-start",
    },
    monthCellEnd: {
      alignItems: "flex-end",
    },
    monthLabel: {
      fontFamily: T.bodyMed,
      fontSize: 9,
      color: T.faint,
      letterSpacing: 0.2,
    },
    monthLabelEnd: {
      textAlign: "right",
    },
    graphRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 0,
    },
    dayGutter: {
      width: 18,
      paddingRight: 4,
      justifyContent: "center",
    },
    dayLabel: {
      fontFamily: T.bodyMed,
      fontSize: 9,
      lineHeight: 11,
      color: T.faint,
      textAlign: "right",
    },
    cellsRow: {
      flex: 1,
      flexDirection: "row",
      gap: 3,
    },
    cell: {
      flex: 1,
      aspectRatio: 1,
      maxHeight: 14,
      borderRadius: 2,
      backgroundColor: T.accentTint,
    },
    cellFilled: {
      backgroundColor: T.accent,
    },
    cellToday: {
      borderWidth: 1,
      borderColor: T.white,
    },
    legend: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 4,
      marginTop: 12,
      zIndex: 1,
    },
    legendText: {
      fontFamily: T.bodyMed,
      fontSize: 10,
      color: T.faint,
      marginHorizontal: 2,
    },
    legendSwatch: {
      width: 10,
      height: 10,
      borderRadius: 2,
      backgroundColor: T.accent,
    },
  });
}
