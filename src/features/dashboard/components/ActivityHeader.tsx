import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from "react-native";
import { Grid3x3, ChevronLeft, ChevronRight } from "lucide-react-native";

// ─── Theme tokens ────────────────────────────────────────────────────────────
// Keep in sync with your shared theme file if you have one.

const T = {
  card: "#1C1F26",
  lime: "#D4F445",
  textPrimary: "#FFFFFF",
  textMuted: "#9AA0AE",
  textFaint: "#71717A",
  textDim: "#D4D4D8",
};

// Font families — load these via @expo-google-fonts/space-grotesk and
// @expo-google-fonts/inter in your root layout, then reference the same
// family strings here. Falls back to system font if not loaded.
const FONT_DISPLAY = "SpaceGrotesk_700Bold";
const FONT_BODY = "Inter_500Medium";
const FONT_BODY_SEMIBOLD = "Inter_600SemiBold";

// ─── Layout constants (used for the sliding indicator math) ────────────────

const CIRCLE_SIZE = 34;
const LABEL_HEIGHT = 13;
const LABEL_MARGIN = 6;
const INDICATOR_TOP = LABEL_HEIGHT + LABEL_MARGIN;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CalendarDay {
  label: string; // M, T, W, T, F, S, S
  date: number;
  /** Shows a small lime dot under the date when true. Defaults to true. */
  hasActivity?: boolean;
}

export interface ActivityHeaderProps {
  monthLabel: string;
  days: CalendarDay[];
  selectedDate: number;
  onSelectDate: (date: number) => void;
  onPressGrid?: () => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  /** Set true if you want the "May 2024 ‹ ›" row back. Defaults to hidden. */
  showMonthRow?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ActivityHeader({
  monthLabel,
  days,
  selectedDate,
  onSelectDate,
  onPressGrid,
  onPrevMonth,
  onNextMonth,
  showMonthRow = false,
}: ActivityHeaderProps) {
  const [rowWidth, setRowWidth] = useState(0);
  const itemWidth = rowWidth > 0 ? rowWidth / days.length : 0;

  const selectedIndex = Math.max(
    0,
    days.findIndex((d) => d.date === selectedDate),
  );

  const indicatorX = useRef(new Animated.Value(0)).current;
  const scaleValues = useRef(days.map(() => new Animated.Value(1))).current;

  // Slide the indicator to the newly selected day
  useEffect(() => {
    if (itemWidth === 0) return;
    const targetX = selectedIndex * itemWidth + itemWidth / 2 - CIRCLE_SIZE / 2;

    Animated.spring(indicatorX, {
      toValue: targetX,
      useNativeDriver: true,
      speed: 16,
      bounciness: 8,
    }).start();
  }, [selectedIndex, itemWidth]);

  // Pop the tapped day's number briefly for tactile feedback
  const pulseDay = (index: number) => {
    Animated.sequence([
      Animated.timing(scaleValues[index], {
        toValue: 1.2,
        duration: 110,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValues[index], {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 10,
      }),
    ]).start();
  };

  const handleRowLayout = (e: LayoutChangeEvent) => {
    setRowWidth(e.nativeEvent.layout.width);
  };

  const handleSelect = (day: CalendarDay, index: number) => {
    onSelectDate(day.date);
    pulseDay(index);
  };

  return (
    <View>
      {/* ------------------------------------------------------------- */}
      {/* Title row                                                    */}
      {/* ------------------------------------------------------------- */}
      <View style={s.headerRow}>
        <Text style={s.headerTitle}>Your Activity</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={s.gridButton}
          onPress={onPressGrid}
        >
          <Grid3x3 size={18} color={T.textMuted} />
        </TouchableOpacity>
      </View>

      {/* ------------------------------------------------------------- */}
      {/* Calendar card                                                */}
      {/* ------------------------------------------------------------- */}
      <View style={s.calendarCard}>
        {showMonthRow && (
          <>
            <View style={s.monthRow}>
              <Text style={s.monthText}>{monthLabel}</Text>
              <View style={s.monthNavPill}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onPrevMonth}
                  hitSlop={8}
                >
                  <ChevronLeft size={16} color={T.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onNextMonth}
                  hitSlop={8}
                >
                  <ChevronRight size={16} color={T.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={s.divider} />
          </>
        )}

        {/* Calendar strip with sliding selection indicator */}
        <View style={s.calendarWrap} onLayout={handleRowLayout}>
          {rowWidth > 0 && (
            <Animated.View
              style={[
                s.indicator,
                {
                  top: INDICATOR_TOP,
                  transform: [{ translateX: indicatorX }],
                },
              ]}
            />
          )}

          <View style={s.calendarRow}>
            {days.map((day, index) => {
              const isSelected = day.date === selectedDate;
              const showDot = day.hasActivity !== false;
              return (
                <TouchableOpacity
                  key={day.date}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(day, index)}
                  style={s.calendarItem}
                >
                  <Text style={s.calendarLabel}>{day.label}</Text>
                  <View style={s.calendarCircle}>
                    <Animated.Text
                      style={[
                        s.calendarDate,
                        isSelected && s.calendarDateActive,
                        { transform: [{ scale: scaleValues[index] }] },
                      ]}
                    >
                      {day.date}
                    </Animated.Text>
                  </View>
                  <View
                    style={[
                      s.activityDot,
                      showDot ? s.activityDotFilled : s.activityDotEmpty,
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    color: T.textPrimary,
    fontSize: 26,
    fontFamily: FONT_DISPLAY,
    letterSpacing: -0.5,
  },
  gridButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: T.card,
    alignItems: "center",
    justifyContent: "center",
  },

  calendarCard: {
    backgroundColor: T.card,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    marginBottom: 24,
  },

  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  monthText: {
    color: T.textFaint,
    fontSize: 16,
    fontFamily: FONT_BODY,
  },
  monthNavPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 16,
  },

  calendarWrap: {
    position: "relative",
  },
  indicator: {
    position: "absolute",
    left: 0,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: T.lime,
    shadowColor: T.lime,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 5,
  },
  calendarRow: {
    flexDirection: "row",
  },
  calendarItem: {
    flex: 1,
    alignItems: "center",
  },
  calendarLabel: {
    color: T.textFaint,
    fontSize: 12,
    fontFamily: FONT_BODY,
    height: LABEL_HEIGHT,
    marginBottom: LABEL_MARGIN,
  },
  calendarCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarDate: {
    color: T.textDim,
    fontSize: 14,
    fontFamily: FONT_BODY_SEMIBOLD,
  },
  calendarDateActive: {
    color: "#12140F",
  },
  activityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
  activityDotFilled: {
    backgroundColor: T.lime,
  },
  activityDotEmpty: {
    backgroundColor: "transparent",
  },
});
