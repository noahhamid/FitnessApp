import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "./GlassSurface";

const CIRCLE_SIZE = 32;
const LABEL_HEIGHT = 13;
const LABEL_MARGIN = 6;
const CAPSULE_HEIGHT = 3;
const CAPSULE_MARGIN = 6;
const INDICATOR_PAD_V = 6;
const INDICATOR_HEIGHT =
  LABEL_HEIGHT +
  LABEL_MARGIN +
  CIRCLE_SIZE +
  CAPSULE_MARGIN +
  CAPSULE_HEIGHT +
  INDICATOR_PAD_V * 2;
const INDICATOR_INSET = 4;

export type CalendarDay = {
  label: string;
  date: number;
  fullDate: string; // ISO YYYY-MM-DD — the source of truth for selection
  hasWorkout?: boolean;
  hasMeal?: boolean;
};

type Props = {
  days: CalendarDay[];
  selectedDate: string; // now an ISO fullDate string, not a bare day number
  onSelectDate: (fullDate: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  weekLabel: string;
};

export function DashboardCalendar({
  days,
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  weekLabel,
}: Props) {
  const { T, styles } = useThemedStyles(makeStyles);

  const [rowWidth, setRowWidth] = useState(0);
  // Always divide by 7 so a short/empty days array can't inflate cell width.
  const itemWidth = rowWidth > 0 ? rowWidth / 7 : 0;

  const selectedIndex = days.findIndex((d) => d.fullDate === selectedDate);
  const hasSelectionInWeek = selectedIndex >= 0;

  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorScale = useRef(new Animated.Value(1)).current;
  const mountFade = useRef(new Animated.Value(0)).current;
  const mountRise = useRef(new Animated.Value(6)).current;
  const scaleValues = useRef(
    Array.from({ length: 7 }, () => new Animated.Value(1)),
  ).current;
  const hasMounted = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mountFade, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.spring(mountRise, { toValue: 0, ...T.motion.glide }),
    ]).start();
  }, []);

  useEffect(() => {
    if (itemWidth === 0 || !hasSelectionInWeek) return;
    const targetX = selectedIndex * itemWidth + INDICATOR_INSET;
    if (!hasMounted.current) {
      // snap into place on first layout, no glide from x=0
      indicatorX.setValue(targetX);
      hasMounted.current = true;
      return;
    }
    Animated.spring(indicatorX, {
      toValue: targetX,
      ...T.motion.glide,
    }).start();
  }, [selectedIndex, itemWidth, hasSelectionInWeek]);

  // When the visible week changes, re-snap indicator if selection is in-week.
  useEffect(() => {
    if (itemWidth === 0 || !hasSelectionInWeek) return;
    indicatorX.setValue(selectedIndex * itemWidth + INDICATOR_INSET);
  }, [days[0]?.fullDate]);

  const pulseDay = (index: number) => {
    Animated.sequence([
      Animated.timing(scaleValues[index], {
        toValue: 1.08,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValues[index], { toValue: 1, ...T.motion.settle }),
    ]).start();

    Animated.sequence([
      Animated.timing(indicatorScale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(indicatorScale, { toValue: 1, ...T.motion.settle }),
    ]).start();
  };

  const handleRowLayout = (e: LayoutChangeEvent) =>
    setRowWidth(e.nativeEvent.layout.width);

  const handleSelect = (day: CalendarDay, index: number) => {
    onSelectDate(day.fullDate);
    pulseDay(index);
  };

  const indicatorWidth = itemWidth > 0 ? itemWidth - INDICATOR_INSET * 2 : 0;

  return (
    <Animated.View
      style={{ opacity: mountFade, transform: [{ translateY: mountRise }] }}
    >
      <GlassSurface style={styles.card}>
        <View style={styles.headerRow}>
          <Pressable onPress={onPrevWeek} hitSlop={8} style={styles.navBtn}>
            <ChevronLeft size={18} color={T.white} strokeWidth={2.2} />
          </Pressable>
          <Text style={styles.weekLabel} numberOfLines={1}>
            {weekLabel}
          </Text>
          <Pressable onPress={onNextWeek} hitSlop={8} style={styles.navBtn}>
            <ChevronRight size={18} color={T.white} strokeWidth={2.2} />
          </Pressable>
        </View>

        <View style={styles.wrap} onLayout={handleRowLayout}>
          {rowWidth > 0 && hasSelectionInWeek && (
            <Animated.View
              style={[
                styles.indicator,
                {
                  width: indicatorWidth,
                  top: -INDICATOR_PAD_V,
                  transform: [
                    { translateX: indicatorX },
                    { scale: indicatorScale },
                  ],
                },
              ]}
            />
          )}

          <View style={styles.row}>
            {days.map((day, index) => {
              const isSelected = day.fullDate === selectedDate;
              return (
                <TouchableOpacity
                  key={day.fullDate}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(day, index)}
                  style={styles.item}
                >
                  <Text
                    style={[styles.label, isSelected && styles.labelActive]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.85}
                  >
                    {day.label}
                  </Text>

                  <View style={styles.circle}>
                    <Animated.Text
                      style={[
                        styles.date,
                        isSelected && styles.dateActive,
                        { transform: [{ scale: scaleValues[index] }] },
                      ]}
                    >
                      {day.date}
                    </Animated.Text>
                  </View>

                  {/* Progress capsule — replaces the old two-dot row.
                      One quiet mark, split into two halves (workout / meal),
                      that only speaks up when something's actually logged. */}
                  <View style={styles.capsule}>
                    <View
                      style={[
                        styles.capsuleHalf,
                        styles.capsuleLeft,
                        day.hasWorkout
                          ? isSelected
                            ? styles.capsuleFillOnAccent
                            : styles.capsuleFillWorkout
                          : styles.capsuleEmpty,
                      ]}
                    />
                    <View
                      style={[
                        styles.capsuleHalf,
                        styles.capsuleRight,
                        day.hasMeal
                          ? isSelected
                            ? styles.capsuleFillOnAccent
                            : styles.capsuleFillMeal
                          : styles.capsuleEmpty,
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </GlassSurface>
    </Animated.View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      borderRadius: T.radius.lg,
      paddingHorizontal: T.space.sm,
      paddingTop: T.space.sm + 2,
      paddingBottom: T.space.sm,
      width: "100%",
      alignSelf: "stretch",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
      zIndex: 1,
    },
    navBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: T.accentTint,
      borderWidth: 0.5,
      borderColor: T.border,
      alignItems: "center",
      justifyContent: "center",
    },
    weekLabel: {
      flex: 1,
      textAlign: "center",
      fontFamily: T.displaySemi,
      fontSize: 14,
      color: T.white,
      letterSpacing: -0.2,
      marginHorizontal: 8,
    },
    wrap: {
      position: "relative",
      zIndex: 1,
      width: "100%",
      overflow: "hidden",
    },
    indicator: {
      position: "absolute",
      left: 0,
      top: 0,
      height: INDICATOR_HEIGHT,
      borderRadius: T.radius.md,
      backgroundColor: T.accent,
      ...T.shadow.lifted,
    },
    row: {
      flexDirection: "row",
      width: "100%",
    },
    // minWidth: 0 lets flex children shrink so 7× content can't force
    // the row wider than the card (root cause of Sunday clipping).
    item: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
    },
    label: {
      color: T.faint,
      fontSize: 9.5,
      fontFamily: T.bodyMed,
      letterSpacing: 0.2,
      height: LABEL_HEIGHT,
      marginBottom: LABEL_MARGIN,
      textAlign: "center",
      width: "100%",
    },
    labelActive: { color: T.onAccent, fontFamily: T.bodyBold },
    circle: {
      width: CIRCLE_SIZE,
      height: CIRCLE_SIZE,
      alignItems: "center",
      justifyContent: "center",
    },
    date: {
      color: T.white,
      fontSize: 14,
      fontFamily: T.bodySemi,
      fontVariant: ["tabular-nums"],
    },
    dateActive: { color: T.onAccent },

    capsule: {
      flexDirection: "row",
      gap: 2,
      marginTop: CAPSULE_MARGIN,
      height: CAPSULE_HEIGHT,
    },
    capsuleHalf: {
      width: 7,
      height: CAPSULE_HEIGHT,
      borderRadius: CAPSULE_HEIGHT / 2,
    },
    capsuleLeft: {},
    capsuleRight: {},
    capsuleEmpty: { backgroundColor: T.border },
    capsuleFillWorkout: { backgroundColor: T.accent },
    capsuleFillMeal: { backgroundColor: T.secondary },
    // when the day is selected, the backdrop is already accent-colored,
    // so logged marks use onAccent ink to keep contrast instead of
    // disappearing into the fill
    capsuleFillOnAccent: { backgroundColor: T.onAccent },
  });
}
