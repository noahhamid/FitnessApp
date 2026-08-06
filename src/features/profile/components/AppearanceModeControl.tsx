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
import { useTheme, type ThemeMode } from "@/src/context/ThemeContext";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

const OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: "light", label: "Light" },
  { mode: "dark", label: "Dark" },
  { mode: "system", label: "System" },
];

const INSET = 3;

/**
 * Fixed 3-segment appearance control — sliding accent pill, same motion
 * language as DaySelector / CategoryFilter (no scroll, equal thirds).
 */
export function AppearanceModeControl() {
  const { mode, setMode } = useTheme();
  const { styles } = useThemedStyles(makeStyles);
  const [trackWidth, setTrackWidth] = useState(0);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const mounted = useRef(false);

  const activeIndex = Math.max(
    0,
    OPTIONS.findIndex((o) => o.mode === mode),
  );
  const segmentWidth = trackWidth > 0 ? trackWidth / OPTIONS.length : 0;

  useEffect(() => {
    if (segmentWidth === 0) return;
    const targetX = activeIndex * segmentWidth + INSET;
    const targetW = Math.max(0, segmentWidth - INSET * 2);

    if (!mounted.current) {
      indicatorX.setValue(targetX);
      indicatorWidth.setValue(targetW);
      mounted.current = true;
      return;
    }

    Animated.parallel([
      Animated.timing(indicatorX, {
        toValue: targetX,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(indicatorWidth, {
        toValue: targetW,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [activeIndex, segmentWidth, indicatorX, indicatorWidth]);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setTrackWidth((prev) => (prev === w ? prev : w));
  };

  return (
    <View style={styles.track} onLayout={onTrackLayout}>
      {segmentWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              width: indicatorWidth,
              transform: [{ translateX: indicatorX }],
            },
          ]}
        />
      )}
      {OPTIONS.map((opt) => {
        const active = mode === opt.mode;
        return (
          <Pressable
            key={opt.mode}
            onPress={() => setMode(opt.mode)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={styles.segment}
          >
            <Text
              style={[styles.segmentText, active && styles.segmentTextActive]}
              numberOfLines={1}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    track: {
      flexDirection: "row",
      alignItems: "center",
      position: "relative",
      backgroundColor: T.accentTint,
      borderRadius: T.radius.sm,
      borderWidth: 0.5,
      borderColor: T.border,
      paddingVertical: 0,
      overflow: "hidden",
    },
    indicator: {
      position: "absolute",
      top: INSET,
      bottom: INSET,
      left: 0,
      borderRadius: T.radius.sm - 1,
      backgroundColor: T.accent,
      ...T.shadow.lifted,
    },
    segment: {
      flex: 1,
      minWidth: 0,
      paddingVertical: 9,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    },
    segmentText: {
      fontFamily: T.bodySemi,
      fontSize: 12,
      color: T.muted,
    },
    segmentTextActive: {
      fontFamily: T.bodyBold,
      color: T.onAccent,
    },
  });
}
