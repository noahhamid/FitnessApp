import { FONTS, useOnboardingColors } from "@/src/ui/tokens";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ITEM_HEIGHT = 56;
const BAND_HEIGHT = ITEM_HEIGHT;
const VISIBLE_ITEMS = 5; // Odd number so exactly one row sits dead centre
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const EDGE_PADDING = (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2;

/** Balanced perspective for a clean, natural cylinder arc. */
const WHEEL_PERSPECTIVE = 450;

type ItemProps = {
  value: number;
  index: number;
  scrollY: Animated.Value;
  textColor: string;
};

/**
 * Memoised so emitting a new value never re-renders the list. 
 * All visual changes are interpolated natively on the UI thread.
 */
const WheelItem = memo(function WheelItem({
  value,
  index,
  scrollY,
  textColor,
}: ItemProps) {
  const offset = index * ITEM_HEIGHT;
  
  // Cylinder arc spread mapping across 3 steps above and below center
  const spread = [
    offset - ITEM_HEIGHT * 3,
    offset - ITEM_HEIGHT * 2,
    offset - ITEM_HEIGHT,
    offset,
    offset + ITEM_HEIGHT,
    offset + ITEM_HEIGHT * 2,
    offset + ITEM_HEIGHT * 3,
  ];

  const rotateX = scrollY.interpolate({
    inputRange: spread,
    outputRange: [
      "75deg",
      "50deg",
      "25deg",
      "0deg",
      "-25deg",
      "-50deg",
      "-75deg",
    ],
    extrapolate: "clamp",
  });

  const scale = scrollY.interpolate({
    inputRange: spread,
    outputRange: [0.45, 0.65, 0.85, 1.12, 0.85, 0.65, 0.45],
    extrapolate: "clamp",
  });

  // Fade out completely outside the active 5-item wheel window
  const opacity = scrollY.interpolate({
    inputRange: spread,
    outputRange: [0, 0.35, 0.75, 1, 0.75, 0.35, 0],
    extrapolate: "clamp",
  });

  // Pull outer items inward to simulate true cylindrical depth wrapping
  const translateY = scrollY.interpolate({
    inputRange: spread,
    outputRange: [24, 14, 6, 0, -6, -14, -24],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        s.item,
        {
          opacity,
          transform: [
            { perspective: WHEEL_PERSPECTIVE },
            { rotateX },
            { translateY },
            { scale },
          ],
        },
      ]}
    >
      <Text style={[s.itemText, { color: textColor }]} allowFontScaling={false}>
        {value}
      </Text>
    </Animated.View>
  );
});

type Props = {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  unit?: string;
  backgroundColor?: string;
  accessibilityLabel?: string;
};

function edgeFade(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [`rgba(${r}, ${g}, ${b}, 1)`, `rgba(${r}, ${g}, ${b}, 0)`] as const;
}

export function NumberWheel({
  min,
  max,
  value,
  onChange,
  step = 1,
  unit,
  backgroundColor,
  accessibilityLabel,
}: Props) {
  const C = useOnboardingColors();
  const resolvedBg = backgroundColor ?? C.bg;
  const values = useMemo(
    () =>
      Array.from(
        { length: Math.floor((max - min) / step) + 1 },
        (_, i) => min + i * step,
      ),
    [min, max, step],
  );

  const lastEmitted = useRef(value);
  const initialOffset = useRef(((value - min) / step) * ITEM_HEIGHT).current;
  // Must match contentOffset or the first paint interpolates as if we are at 0
  // (every visible number is faded / rotated away until the user scrolls).
  const scrollY = useRef(new Animated.Value(initialOffset)).current;
  const listRef = useRef<ScrollView>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ y: initialOffset, animated: false });
  }, [initialOffset]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(values.length - 1, index));
      const next = values[clamped];

      if (next !== lastEmitted.current) {
        lastEmitted.current = next;
        if (Platform.OS !== "web") Haptics.selectionAsync();
        onChange(next);
      }
    },
    [values, onChange],
  );

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
        listener: handleScroll,
      }),
    [scrollY, handleScroll],
  );

  const fade = edgeFade(resolvedBg);

  return (
    <View style={s.container}>
      <View pointerEvents="none" style={s.band} />

      <Animated.ScrollView
        ref={listRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate={0.985}
        overScrollMode="never"
        contentContainerStyle={s.content}
        contentOffset={{ x: 0, y: initialOffset }}
        scrollEventThrottle={16}
        onScroll={onScroll}
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ text: `${value}${unit ? ` ${unit}` : ""}` }}
      >
        {values.map((v, i) => (
          <WheelItem
            key={v}
            value={v}
            index={i}
            scrollY={scrollY}
            textColor={C.text}
          />
        ))}
      </Animated.ScrollView>

      <LinearGradient
        pointerEvents="none"
        colors={fade}
        style={[s.edge, s.edgeTop]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={fade}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={[s.edge, s.edgeBottom]}
      />

      {unit ? (
        <Text pointerEvents="none" style={[s.unit, { color: C.muted }]}>
          {unit}
        </Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    height: WHEEL_HEIGHT,
    justifyContent: "center",
    overflow: "hidden",
  },
  content: {
    paddingVertical: EDGE_PADDING,
  },
  band: {
    position: "absolute",
    left: 24,
    right: 24,
    top: EDGE_PADDING,
    height: BAND_HEIGHT,
    borderRadius: BAND_HEIGHT / 2,
    backgroundColor: "rgba(229, 57, 53, 0.35)",
    zIndex: 0,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
  },
  itemText: {
    // Distinct display face for the wheel — not the body/UI fonts.
    fontFamily: FONTS.blackItalic,
    fontSize: 40,
    lineHeight: 40,
    letterSpacing: -1,
    textAlign: "center",
    includeFontPadding: false,
  },
  edge: {
    position: "absolute",
    left: 0,
    right: 0,
    height: EDGE_PADDING,
  },
  edgeTop: {
    top: 0,
  },
  edgeBottom: {
    bottom: 0,
  },
  unit: {
    position: "absolute",
    right: 48,
    alignSelf: "center",
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 2,
  },
});