import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from "react-native";
import { T } from "@/src/theme";

const CIRCLE_SIZE = 36;
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
const INDICATOR_INSET = 6;

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
};

export function DashboardCalendar({ days, selectedDate, onSelectDate }: Props) {
  const [rowWidth, setRowWidth] = useState(0);
  const itemWidth = rowWidth > 0 ? rowWidth / days.length : 0;

  const selectedIndex = Math.max(
    0,
    days.findIndex((d) => d.fullDate === selectedDate),
  );

  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorScale = useRef(new Animated.Value(1)).current;
  const mountFade = useRef(new Animated.Value(0)).current;
  const mountRise = useRef(new Animated.Value(6)).current;
  const scaleValues = useRef(days.map(() => new Animated.Value(1))).current;
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
    if (itemWidth === 0) return;
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
  }, [selectedIndex, itemWidth]);

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
      style={[
        styles.card,
        { opacity: mountFade, transform: [{ translateY: mountRise }] },
      ]}
    >
      <View style={styles.wrap} onLayout={handleRowLayout}>
        {rowWidth > 0 && (
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
                <Text style={[styles.label, isSelected && styles.labelActive]}>
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: T.glass,
    borderWidth: 0.5,
    borderColor: T.glassBorder,
    borderRadius: T.radius.lg,
    paddingHorizontal: T.space.sm,
    paddingTop: T.space.md + 2,
    paddingBottom: T.space.sm,
    ...T.shadow.card,
  },
  wrap: { position: "relative" },
  indicator: {
    position: "absolute",
    left: 0,
    top: 0,
    height: INDICATOR_HEIGHT,
    borderRadius: T.radius.md,
    backgroundColor: T.accent,
    ...T.shadow.lifted,
  },
  row: { flexDirection: "row" },
  item: { flex: 1, alignItems: "center" },
  label: {
    color: T.faint,
    fontSize: 10,
    fontFamily: T.bodyMed,
    letterSpacing: 0.4,
    height: LABEL_HEIGHT,
    marginBottom: LABEL_MARGIN,
  },
  labelActive: { color: T.onImage, fontFamily: T.bodyBold },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  date: {
    color: T.white,
    fontSize: 15,
    fontFamily: T.bodySemi,
    fontVariant: ["tabular-nums"],
  },
  dateActive: { color: T.onImage },

  capsule: {
    flexDirection: "row",
    gap: 3,
    marginTop: CAPSULE_MARGIN,
    height: CAPSULE_HEIGHT,
  },
  capsuleHalf: {
    width: 9,
    height: CAPSULE_HEIGHT,
    borderRadius: CAPSULE_HEIGHT / 2,
  },
  capsuleLeft: {},
  capsuleRight: {},
  capsuleEmpty: { backgroundColor: T.border },
  capsuleFillWorkout: { backgroundColor: T.accent },
  capsuleFillMeal: { backgroundColor: T.secondary },
  // when the day is selected, the backdrop is already accent-colored,
  // so logged marks turn paper-white to keep contrast instead of
  // disappearing into the fill
  capsuleFillOnAccent: { backgroundColor: "rgba(255,255,255,0.85)" },
});
