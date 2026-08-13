import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { localDateOnly } from "@/src/features/progress/lib/localDate";
import { dayCaption } from "@/src/lib/week-days";
import { PressableScale } from "./PressableScale";

type Day = {
  label: string;
  num: number;
  hasLog?: boolean;
  date: string;
  /** Days before account creation — shown but not selectable. */
  disabled?: boolean;
};

type Props = {
  days: Day[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  weekLabel: string;
  /** When false, hide/disable going to an earlier week. Default true. */
  canGoPrevWeek?: boolean;
  /** When false, hide/disable going to a later week. Default true. */
  canGoNextWeek?: boolean;
  /** When false, omit the weekday + date caption under the row. Default true. */
  showSelectedDate?: boolean;
};

const INDICATOR_INSET = 2;

export function DaySelector({
  days,
  activeIndex,
  onSelect,
  onPrevWeek,
  onNextWeek,
  weekLabel,
  canGoPrevWeek = true,
  canGoNextWeek = true,
  showSelectedDate = true,
}: Props) {
  const { T, styles } = useThemedStyles(makeStyles);
  const todayKey = localDateOnly();
  const selectedDate = days[activeIndex]?.date;
  const [rowWidth, setRowWidth] = useState(0);
  const [rowHeight, setRowHeight] = useState(0);
  // Always divide by 7 so a short/empty days array can't inflate cell width.
  const itemWidth = rowWidth > 0 ? rowWidth / 7 : 0;

  const hasSelectionInWeek = activeIndex >= 0 && activeIndex < days.length;

  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const indicatorScale = useRef(new Animated.Value(1)).current;
  // Keyed by date, created lazily — NOT a fixed-length array. If DaySelector
  // first mounts before days load, an array sized off that first render would
  // stay frozen at length 0 forever.
  const numberScalesRef = useRef<Map<string, Animated.Value>>(new Map());
  const getNumberScale = (dateKey: string) => {
    let v = numberScalesRef.current.get(dateKey);
    if (!v) {
      v = new Animated.Value(1);
      numberScalesRef.current.set(dateKey, v);
    }
    return v;
  };
  const hasMounted = useRef(false);

  useEffect(() => {
    if (itemWidth === 0 || !hasSelectionInWeek) return;

    const targetX = activeIndex * itemWidth + INDICATOR_INSET;
    const targetW = Math.max(0, itemWidth - INDICATOR_INSET * 2);

    if (!hasMounted.current) {
      indicatorX.setValue(targetX);
      indicatorWidth.setValue(targetW);
      hasMounted.current = true;
      return;
    }

    Animated.parallel([
      Animated.timing(indicatorX, {
        toValue: targetX,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(indicatorWidth, {
        toValue: targetW,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, itemWidth, hasSelectionInWeek]);

  // When the visible week changes, re-snap indicator if selection is in-week.
  useEffect(() => {
    if (itemWidth === 0 || !hasSelectionInWeek) return;
    indicatorX.setValue(activeIndex * itemWidth + INDICATOR_INSET);
    indicatorWidth.setValue(Math.max(0, itemWidth - INDICATOR_INSET * 2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days[0]?.date]);

  const pulse = (dateKey: string) => {
    const scale = getNumberScale(dateKey);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.1,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(scale, { toValue: 1, ...T.motion.settle }),
    ]).start();

    Animated.sequence([
      Animated.timing(indicatorScale, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: false,
      }),
      Animated.spring(indicatorScale, {
        toValue: 1,
        ...T.motion.settle,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleRowLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setRowWidth((prev) => (prev === width ? prev : width));
    setRowHeight((prev) => (prev === height ? prev : height));
  };

  const handleSelect = (index: number, dateKey: string, disabled?: boolean) => {
    if (disabled) return;
    onSelect(index);
    pulse(dateKey);
  };

  const ready = itemWidth > 0 && rowHeight > 0 && hasSelectionInWeek;

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={canGoPrevWeek ? onPrevWeek : undefined}
          disabled={!canGoPrevWeek}
          hitSlop={8}
          style={[styles.navBtn, !canGoPrevWeek && styles.navBtnDisabled]}
          accessibilityState={{ disabled: !canGoPrevWeek }}
        >
          <ChevronLeft
            size={18}
            color={canGoPrevWeek ? T.white : T.faint}
            strokeWidth={2.2}
          />
        </Pressable>
        <Text style={styles.weekLabel} numberOfLines={1}>
          {weekLabel}
        </Text>
        <Pressable
          onPress={canGoNextWeek ? onNextWeek : undefined}
          disabled={!canGoNextWeek}
          hitSlop={8}
          style={[styles.navBtn, !canGoNextWeek && styles.navBtnDisabled]}
          accessibilityState={{ disabled: !canGoNextWeek }}
        >
          <ChevronRight
            size={18}
            color={canGoNextWeek ? T.white : T.faint}
            strokeWidth={2.2}
          />
        </Pressable>
      </View>

      <View style={styles.wrap}>
        {ready && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              {
                height: rowHeight,
                width: indicatorWidth,
                transform: [
                  { translateX: indicatorX },
                  { scale: indicatorScale },
                ],
              },
            ]}
          />
        )}

        <View style={styles.row} onLayout={handleRowLayout}>
          {days.map((d, i) => {
            const active = i === activeIndex;
            const isToday = d.date === todayKey;
            const disabled = !!d.disabled;
            return (
              <View key={d.date} style={[styles.item, disabled && styles.itemDisabled]}>
                {/* Absolutely positioned so today's ring matches the selected
                    pill's geometry without adding border box to the cell. */}
                {isToday && !disabled && (
                  <View
                    pointerEvents="none"
                    style={[
                      styles.todayRing,
                      active && styles.todayRingOnFill,
                    ]}
                  />
                )}
                <PressableScale
                  onPress={() => handleSelect(i, d.date, disabled)}
                  scaleTo={disabled ? 1 : 0.94}
                  style={styles.pressableReset}
                >
                  <View style={styles.day}>
                    <Text
                      style={[
                        styles.dname,
                        active && styles.dnameActive,
                        disabled && styles.dnameDisabled,
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                    >
                      {d.label}
                    </Text>
                    <Animated.Text
                      style={[
                        styles.dnum,
                        isToday && !active && !disabled && styles.dnumToday,
                        active && styles.dnumActive,
                        disabled && styles.dnumDisabled,
                        { transform: [{ scale: getNumberScale(d.date) }] },
                      ]}
                    >
                      {d.num}
                    </Animated.Text>
                    {d.hasLog && !disabled && (
                      <View
                        style={[styles.logDot, active && styles.logDotActive]}
                      />
                    )}
                  </View>
                </PressableScale>
              </View>
            );
          })}
        </View>
      </View>

      {showSelectedDate && selectedDate ? (
        <Text style={styles.selectedCaption} numberOfLines={1}>
          {dayCaption(selectedDate, todayKey)}
        </Text>
      ) : null}
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    root: {
      width: "100%",
      alignSelf: "stretch",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
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
    navBtnDisabled: {
      opacity: 0.35,
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
      width: "100%",
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      width: "100%",
    },
    // minWidth: 0 lets flex children shrink so 7× content can't force
    // the row wider than the container (and no horizontal ScrollView).
    item: {
      flex: 1,
      minWidth: 0,
    },
    itemDisabled: {
      opacity: 0.35,
    },
    pressableReset: { borderRadius: 15, width: "100%" },
    todayRing: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: INDICATOR_INSET,
      right: INDICATOR_INSET,
      borderRadius: 15,
      borderWidth: 1.5,
      borderColor: T.accent,
      backgroundColor: T.accentTint,
    },
    // Selected + today: the accent pill already fills the cell, so the ring
    // becomes an inset outline instead of a second fill.
    todayRingOnFill: {
      borderColor: T.onAccent,
      backgroundColor: "transparent",
    },
    indicator: {
      position: "absolute",
      top: 0,
      left: 0,
      borderRadius: 15,
      backgroundColor: T.accent,
      ...T.shadow.lifted,
    },
    day: {
      width: "100%",
      alignItems: "center",
      paddingVertical: 9,
      paddingBottom: 10,
    },
    dname: {
      fontFamily: T.bodyBold,
      fontSize: 9.5,
      color: T.muted,
      letterSpacing: 0.3,
      textAlign: "center",
      width: "100%",
    },
    dnameActive: { color: T.onAccent },
    dnameDisabled: { color: T.faint },
    dnum: { fontFamily: T.display, fontSize: 16, color: T.white, marginTop: 3 },
    dnumActive: { color: T.onAccent },
    dnumToday: { color: T.accent },
    dnumDisabled: { color: T.faint },
    selectedCaption: {
      marginTop: 8,
      textAlign: "center",
      fontFamily: T.bodyMed,
      fontSize: 11.5,
      letterSpacing: 0.1,
      color: T.muted,
    },
    logDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: T.accent,
      marginTop: 4,
    },
    logDotActive: { backgroundColor: T.onAccent },
  });
}
