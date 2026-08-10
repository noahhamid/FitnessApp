import { C, FONTS } from "@/src/ui/tokens";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const TICK_GAP = 14;
/** Visible viewport height of the meter — keep in sync with positioning in height.tsx. */
export const HEIGHT_METER_VISIBLE = 520;
/** Distance from the top of the meter to the accent marker (center line). */
export const HEIGHT_METER_MARKER_OFFSET = HEIGHT_METER_VISIBLE / 2;

const VISIBLE_HEIGHT = HEIGHT_METER_VISIBLE;
const EDGE_PADDING = VISIBLE_HEIGHT / 2 - TICK_GAP / 2;

export type HeightMeterHandle = {
  scrollToValue: (cm: number) => void;
};

type Props = {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  backgroundColor?: string;
  accessibilityLabel?: string;
};

function edgeFade(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [`rgba(${r}, ${g}, ${b}, 1)`, `rgba(${r}, ${g}, ${b}, 0)`] as const;
}

/** Tallest value at the top of the list (classic height-chart orientation). */
function offsetForValue(value: number, max: number) {
  return (max - value) * TICK_GAP;
}

function valueForOffset(y: number, min: number, max: number) {
  const index = Math.round(y / TICK_GAP);
  return Math.max(min, Math.min(max, max - index));
}

type TickProps = {
  value: number;
  onPress: (value: number) => void;
};

const Tick = memo(function Tick({ value, onPress }: TickProps) {
  const isMajor = value % 10 === 0;
  const isMid = value % 5 === 0;

  return (
    <Pressable
      style={s.tickRow}
      onPress={() => onPress(value)}
      accessibilityRole="button"
      accessibilityLabel={`${value} centimeters`}
    >
      {isMajor ? (
        <Text style={s.tickLabel} allowFontScaling={false}>
          {value}
        </Text>
      ) : (
        <View style={s.tickLabelSpacer} />
      )}
      <View
        style={[
          s.tick,
          isMajor ? s.tickMajor : isMid ? s.tickMid : s.tickMinor,
        ]}
      />
    </Pressable>
  );
});

export const HeightMeter = forwardRef<HeightMeterHandle, Props>(
  function HeightMeter(
    {
      min,
      max,
      value,
      onChange,
      backgroundColor = C.bg,
      accessibilityLabel = "Height meter",
    },
    ref,
  ) {
    // Descending so taller cm sits at the top of the scroll content.
    const values = useMemo(
      () => Array.from({ length: max - min + 1 }, (_, i) => max - i),
      [min, max],
    );

    const scrollRef = useRef<ScrollView>(null);
    const lastEmitted = useRef(value);
    const initialOffset = useRef(offsetForValue(value, max)).current;

    const emit = useCallback(
      (next: number) => {
        if (next === lastEmitted.current) return;
        lastEmitted.current = next;
        if (Platform.OS !== "web") Haptics.selectionAsync();
        onChange(next);
      },
      [onChange],
    );

    const scrollToValue = useCallback(
      (cm: number) => {
        const clamped = Math.max(min, Math.min(max, Math.round(cm)));
        const y = offsetForValue(clamped, max);
        scrollRef.current?.scrollTo({ y, animated: true });
        emit(clamped);
      },
      [min, max, emit],
    );

    useImperativeHandle(ref, () => ({ scrollToValue }), [scrollToValue]);

    const handleScroll = useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        emit(valueForOffset(e.nativeEvent.contentOffset.y, min, max));
      },
      [min, max, emit],
    );

    const fade = edgeFade(backgroundColor);

    return (
      <View
        style={s.container}
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ text: `${value} cm` }}
      >
        <View pointerEvents="none" style={s.centerLine} />
        <View pointerEvents="none" style={s.centerGlow} />

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={TICK_GAP}
          snapToAlignment="start"
          decelerationRate={0.985}
          overScrollMode="never"
          contentContainerStyle={s.content}
          contentOffset={{ x: 0, y: initialOffset }}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          keyboardShouldPersistTaps="handled"
        >
          {values.map((v) => (
            <Tick key={v} value={v} onPress={scrollToValue} />
          ))}
        </ScrollView>

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
      </View>
    );
  },
);

const s = StyleSheet.create({
  container: {
    width: 88,
    height: VISIBLE_HEIGHT,
    overflow: "hidden",
  },
  content: {
    paddingVertical: EDGE_PADDING,
    alignItems: "flex-start",
    paddingLeft: 4,
  },
  centerLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: VISIBLE_HEIGHT / 2 - 1,
    height: 2,
    backgroundColor: C.accent,
    zIndex: 10,
    borderRadius: 1,
  },
  centerGlow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: VISIBLE_HEIGHT / 2 - 8,
    height: 16,
    backgroundColor: C.accent,
    opacity: 0.15,
    borderRadius: 8,
    zIndex: 9,
  },
  tickRow: {
    height: TICK_GAP,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 6,
  },
  tickLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: C.muted,
    minWidth: 28,
    textAlign: "left",
  },
  tickLabelSpacer: {
    minWidth: 28,
  },
  tick: {
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  tickMinor: {
    width: 10,
    height: 1.5,
  },
  tickMid: {
    width: 16,
    height: 1.5,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  tickMajor: {
    width: 24,
    height: 2,
    backgroundColor: C.accent,
  },
  edge: {
    position: "absolute",
    left: 0,
    right: 0,
    height: EDGE_PADDING * 0.85,
    zIndex: 8,
  },
  edgeTop: {
    top: 0,
  },
  edgeBottom: {
    bottom: 0,
  },
});
