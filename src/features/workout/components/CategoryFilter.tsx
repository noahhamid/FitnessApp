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
import { T } from "@/src/theme";

// Kept for backward compatibility wherever this specific union was
// imported elsewhere — the component itself is now generic, so new
// usages don't need to conform to this particular set of labels.
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
    Animated.spring(scale, { toValue: 0.94, ...T.motion.settle }).start();
  }, [scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, ...T.motion.settle }).start();
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

export function CategoryFilter<T extends string>({
  categories,
  active,
  onChange,
}: {
  categories: T[];
  active: T;
  onChange: (c: T) => void;
}) {
  const [layoutMap, setLayoutMap] = useState<Partial<Record<T, ChipLayout>>>(
    {},
  );
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const measuredOnce = useRef(false);

  const handleChipLayout = useCallback(
    (cat: T) => (e: LayoutChangeEvent) => {
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
  scrollContent: { paddingRight: T.space.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.space.sm,
  },
  indicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderRadius: T.radius.pill,
    backgroundColor: T.accent,
    // same treatment as the calendar's selection pill — the one
    // "currently chosen" shape on screen gets the lifted, accent-tinted
    // shadow, nothing else does
    ...T.shadow.lifted,
  },
  chip: {
    paddingHorizontal: T.space.lg,
    paddingVertical: 9,
    borderRadius: T.radius.pill,
    borderWidth: 1,
    borderColor: T.border,
  },
  chipActive: {
    borderColor: "transparent",
  },
  chipText: {
    fontFamily: T.bodySemi,
    fontSize: 13,
    color: T.faint,
  },
  chipTextActive: {
    fontFamily: T.bodyBold,
    // cream, not stark white — same warm-text-on-accent choice as the
    // workout card's CTA pill, so filled-accent surfaces read consistently
    color: T.bg,
  },
});
