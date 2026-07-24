import React, { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import type { WorkoutSessionSummary } from "../hooks/useProgress";

const T = {
  panel: "#15161C",
  panelBorder: "rgba(255,255,255,0.08)",
  accent: "#FFC700",
  accentText: "#1A1300",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.45)",
  dimText: "rgba(255,255,255,0.25)",
  display: "SpaceGrotesk_700Bold",
  bodyMed: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
};

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

interface Props {
  sessions: WorkoutSessionSummary[];
  monthDate: Date; // any date within the month being shown
  onMonthChange: (newMonthDate: Date) => void;
  onSelectDay: (dateStr: string) => void;
  selectedDate: string | null;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildMonthGrid(monthDate: Date): (Date | null)[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Monday-start offset: getDay() 0=Sun..6=Sat, shift so Monday=0
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++)
    cells.push(new Date(year, month, day));
  return cells;
}

export function WorkoutCalendar({
  sessions,
  monthDate,
  onMonthChange,
  onSelectDay,
  selectedDate,
}: Props) {
  const daysWithWorkouts = useMemo(() => {
    const set = new Set<string>();
    for (const s of sessions) {
      if (s.completedAt) set.add(s.completedAt.slice(0, 10));
    }
    return set;
  }, [sessions]);

  const cells = useMemo(() => buildMonthGrid(monthDate), [monthDate]);
  const todayStr = toDateStr(new Date());

  const monthLabel = monthDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const goPrevMonth = () => {
    const d = new Date(monthDate);
    d.setMonth(d.getMonth() - 1);
    onMonthChange(d);
  };
  const goNextMonth = () => {
    const d = new Date(monthDate);
    d.setMonth(d.getMonth() + 1);
    onMonthChange(d);
  };

  return (
    <View style={s.card}>
      <View style={s.headerRow}>
        <Pressable onPress={goPrevMonth} hitSlop={8} style={s.navBtn}>
          <ChevronLeft size={18} color={T.white} strokeWidth={2.2} />
        </Pressable>
        <Text style={s.monthLabel}>{monthLabel}</Text>
        <Pressable onPress={goNextMonth} hitSlop={8} style={s.navBtn}>
          <ChevronRight size={18} color={T.white} strokeWidth={2.2} />
        </Pressable>
      </View>

      <View style={s.weekdayRow}>
        {WEEKDAY_LABELS.map((label, i) => (
          <Text key={i} style={s.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={s.grid}>
        {cells.map((date, i) => {
          if (!date) return <View key={i} style={s.cell} />;

          const dateStr = toDateStr(date);
          const hasWorkout = daysWithWorkouts.has(dateStr);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          return (
            <Pressable
              key={i}
              style={s.cell}
              onPress={() => onSelectDay(dateStr)}
              disabled={!hasWorkout}
            >
              <View
                style={[
                  s.dayCircle,
                  isSelected && s.dayCircleSelected,
                  !isSelected && isToday && s.dayCircleToday,
                ]}
              >
                <Text
                  style={[
                    s.dayText,
                    !hasWorkout && s.dayTextDim,
                    isSelected && s.dayTextSelected,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </View>
              {hasWorkout && !isSelected && <View style={s.dot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const CELL_SIZE = 40;

const s = StyleSheet.create({
  card: {
    backgroundColor: T.panel,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: {
    fontFamily: T.display,
    fontSize: 15,
    color: T.white,
    letterSpacing: -0.2,
  },
  weekdayRow: { flexDirection: "row", marginBottom: 6 },
  weekdayLabel: {
    width: CELL_SIZE,
    textAlign: "center",
    fontFamily: T.bodySemi,
    fontSize: 11,
    color: T.muted,
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleSelected: { backgroundColor: T.accent },
  dayCircleToday: { borderWidth: 1.5, borderColor: T.accent },
  dayText: { fontFamily: T.bodyMed, fontSize: 13, color: T.white },
  dayTextDim: { color: T.dimText },
  dayTextSelected: { color: T.accentText, fontFamily: T.bodySemi },
  dot: {
    position: "absolute",
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.accent,
  },
});
