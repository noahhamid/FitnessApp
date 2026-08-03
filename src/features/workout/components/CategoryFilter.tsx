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
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

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
  const { T, styles: s } = useThemedStyles(makeStyles);
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.94, ...T.motion.settle }).start();
  }, [scale, T]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, ...T.motion.settle }).start();
  }, [scale, T]);

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

// Renamed generic param C (was T) — T is also the imported theme object,
// and having both in scope in the same function is a landmine for any
// future edit inside this component that reaches for T.* and silently
// gets the generic type instead.
export function CategoryFilter<C extends string>({
  categories,
  active,
  onChange,
}: {
  categories: C[];
  active: C;
  onChange: (c: C) => void;
}) {
  const { styles: s } = useThemedStyles(makeStyles);
  const [layoutMap, setLayoutMap] = useState<Partial<Record<C, ChipLayout>>>(
    {},
  );
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const measuredOnce = useRef(false);
  const scrollRef = useRef<ScrollView>(null);
  const scrollContentWidth = useRef(0);
  const scrollViewportWidth = useRef(0);

  const handleChipLayout = useCallback(
    (cat: C) => (e: LayoutChangeEvent) => {
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
    } else {
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
    }

    // Bring the active chip into view if it's outside the visible scroll
    // area — without this, selecting a category near the end of a long
    // list (e.g. "Core") moves the indicator to a chip the user can't
    // actually see, since the ScrollView never follows selection on its
    // own.
    const viewport = scrollViewportWidth.current;
    const contentWidth = scrollContentWidth.current;
    if (viewport === 0 || contentWidth === 0) return;

    const chipStart = l.x;
    const chipEnd = l.x + l.width;
    const maxScrollX = Math.max(0, contentWidth - viewport);

    let targetX: number | null = null;
    if (chipStart < 0) {
      // (shouldn't happen — x is relative to content start — kept as a
      // defensive floor)
      targetX = 0;
    } else if (chipEnd > viewport) {
      // Center the chip in the viewport rather than just nudging it to the
      // edge, so the next/prev chips are still visible as a hint there's
      // more to scroll.
      targetX = Math.min(
        maxScrollX,
        Math.max(0, chipStart - viewport / 2 + l.width / 2),
      );
    }

    if (targetX !== null) {
      scrollRef.current?.scrollTo({ x: targetX, animated: true });
    }
  }, [active, layoutMap, indicatorX, indicatorWidth]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.scrollContent}
      onLayout={(e) => {
        scrollViewportWidth.current = e.nativeEvent.layout.width;
      }}
      onContentSizeChange={(w) => {
        scrollContentWidth.current = w;
      }}
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

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
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
    color: T.onAccent,
  },
  });
}
