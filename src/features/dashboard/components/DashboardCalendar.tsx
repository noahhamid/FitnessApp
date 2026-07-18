import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from "react-native";
import { T } from "../theme";

// Layout constants for the sliding indicator math.
const CIRCLE_SIZE = 34;
const LABEL_HEIGHT = 13;
const LABEL_MARGIN = 6;
const INDICATOR_PAD_V = 7; // extra breathing room above/below the label+number
const INDICATOR_HEIGHT =
  LABEL_HEIGHT + LABEL_MARGIN + CIRCLE_SIZE + INDICATOR_PAD_V * 2;
const INDICATOR_INSET = 7; // horizontal padding — more room than before so it doesn't hug the cell edges

export type CalendarDay = {
  label: string; // M, T, W...
  date: number;
  hasWorkout?: boolean;
  hasMeal?: boolean;
};

type Props = {
  days: CalendarDay[];
  selectedDate: number;
  onSelectDate: (date: number) => void;
};

export function DashboardCalendar({ days, selectedDate, onSelectDate }: Props) {
  const [rowWidth, setRowWidth] = useState(0);
  const itemWidth = rowWidth > 0 ? rowWidth / days.length : 0;

  const selectedIndex = Math.max(
    0,
    days.findIndex((d) => d.date === selectedDate),
  );

  const indicatorX = useRef(new Animated.Value(0)).current;
  const scaleValues = useRef(days.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    if (itemWidth === 0) return;
    // Slide to the inset left edge of the selected cell (not centered on a
    // fixed-width circle anymore — the pill now matches the cell width).
    const targetX = selectedIndex * itemWidth + INDICATOR_INSET;
    Animated.spring(indicatorX, {
      toValue: targetX,
      useNativeDriver: true,
      speed: 16,
      bounciness: 8,
    }).start();
  }, [selectedIndex, itemWidth]);

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

  const handleRowLayout = (e: LayoutChangeEvent) =>
    setRowWidth(e.nativeEvent.layout.width);

  const handleSelect = (day: CalendarDay, index: number) => {
    onSelectDate(day.date);
    pulseDay(index);
  };

  const indicatorWidth = itemWidth > 0 ? itemWidth - INDICATOR_INSET * 2 : 0;

  return (
    <View style={styles.card}>
      <View style={styles.wrap} onLayout={handleRowLayout}>
        {rowWidth > 0 && (
          <Animated.View
            style={[
              styles.indicator,
              {
                width: indicatorWidth,
                top: -INDICATOR_PAD_V,
                transform: [{ translateX: indicatorX }],
              },
            ]}
          />
        )}

        <View style={styles.row}>
          {days.map((day, index) => {
            const isSelected = day.date === selectedDate;
            return (
              <TouchableOpacity
                key={day.date}
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
                <View style={styles.dots}>
                  <View
                    style={[
                      styles.dot,
                      day.hasWorkout ? styles.dotWorkout : styles.dotEmpty,
                    ]}
                  />
                  <View
                    style={[
                      styles.dot,
                      day.hasMeal ? styles.dotMeal : styles.dotEmpty,
                    ]}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.glassBorder,
    borderRadius: 22,
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 10,
  },
  wrap: { position: "relative" },
  // Transparent fill, gold border only — and now tall enough to wrap both
  // the day name and the number instead of just circling the number.
  indicator: {
    position: "absolute",
    left: 0,
    top: 0,
    height: INDICATOR_HEIGHT,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: T.accent,
    backgroundColor: "transparent",
  },
  row: { flexDirection: "row" },
  item: { flex: 1, alignItems: "center" },
  label: {
    color: T.faint,
    fontSize: 10,
    fontFamily: T.bodyMed,
    height: LABEL_HEIGHT,
    marginBottom: LABEL_MARGIN,
  },
  labelActive: { color: T.accent, fontFamily: T.bodyBold },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  date: { color: T.white, fontSize: 14, fontFamily: T.bodySemi },
  dateActive: { color: T.accent },
  dots: { flexDirection: "row", gap: 3, marginTop: 4 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  dotWorkout: { backgroundColor: T.accent },
  dotMeal: { backgroundColor: "#6FA5C4" },
  dotEmpty: { backgroundColor: "rgba(255,255,255,0.15)" },
});
