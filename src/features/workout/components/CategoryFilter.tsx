import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from "react-native";

// Font family strings + palette — same convention as the other components.
// Worth pulling into a shared theme.ts alongside them at some point.
const T = {
  glassBorder: "rgba(255,255,255,0.14)",
  accent: "#FFC700",
  accentText: "#1A1300",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.62)",

  bodySemi: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
};

export type Category =
  | "All workouts"
  | "Lower body"
  | "Upper body"
  | "Full body"
  | "Core"
  | "Mobility";

type ChipLayout = { x: number; width: number };

function Chip({
  label,
  active,
  onPress,
  onLayout,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
      friction: 7,
      tension: 160,
    }).start();
  }, [scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 160,
    }).start();
  }, [scale]);

  return (
    <Animated.View onLayout={onLayout} style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        hitSlop={4}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={[s.chip, active && s.chipActive]}
      >
        <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function CategoryFilter({
  categories,
  active,
  onChange,
}: {
  categories: Category[];
  active: Category;
  onChange: (c: Category) => void;
}) {
  const [layoutMap, setLayoutMap] = useState<
    Partial<Record<Category, ChipLayout>>
  >({});
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const measuredOnce = useRef(false);

  const handleChipLayout = useCallback(
    (cat: Category) => (e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      setLayoutMap((prev) => {
        const existing = prev[cat];
        if (existing && existing.x === x && existing.width === width)
          return prev;
        return { ...prev, [cat]: { x, width } };
      });
    },
    [],
  );

  useEffect(() => {
    const l = layoutMap[active];
    if (!l) return;

    if (!measuredOnce.current) {
      // Snap into place on first measurement instead of sliding in from the
      // corner — nothing to animate from yet, so a spring here would look
      // like a glitch rather than a transition.
      indicatorX.setValue(l.x);
      indicatorWidth.setValue(l.width);
      measuredOnce.current = true;
      return;
    }

    // translateX and width are animated together on the same node, so both
    // stay on the JS driver (useNativeDriver: false) — width can't go
    // native anyway, and mixing driver modes on one node is what breaks
    // (see ActiveWorkoutScreen's panel height/transform fix).
    Animated.spring(indicatorX, {
      toValue: l.x,
      useNativeDriver: false,
      friction: 9,
      tension: 90,
    }).start();
    Animated.spring(indicatorWidth, {
      toValue: l.width,
      useNativeDriver: false,
      friction: 9,
      tension: 90,
    }).start();
  }, [active, layoutMap, indicatorX, indicatorWidth]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.scrollContent}
    >
      <View style={s.row}>
        <Animated.View
          pointerEvents="none"
          style={[
            s.indicator,
            { transform: [{ translateX: indicatorX }], width: indicatorWidth },
          ]}
        />
        {categories.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            active={cat === active}
            onPress={() => onChange(cat)}
            onLayout={handleChipLayout(cat)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scrollContent: { paddingRight: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  indicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: T.accent,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: T.glassBorder,
  },
  chipActive: {
    borderColor: "transparent",
  },
  chipText: {
    fontFamily: T.bodySemi,
    fontSize: 13,
    color: T.muted,
  },
  chipTextActive: {
    fontFamily: T.bodyBold,
    color: T.accentText,
  },
});
