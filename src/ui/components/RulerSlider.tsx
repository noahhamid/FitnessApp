import * as Haptics from "expo-haptics";
import { useCallback, useRef } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { FONTS } from "@/src/ui/tokens";

const C = {
  bg: "#121212",
  bg2: "#181818",
  card: "#1E1E1E",
  border: "#2A2A2A",
  accent: "#FFC700",
  accentDim: "rgba(255, 199, 0, 0.10)",
  text: "#FFFFFF",
  muted: "#A0A0A0",
};

const TICK_GAP = 12; // px between each unit tick

interface RulerSliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  unitLabel?: string;
}

export function RulerSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  unitLabel = "",
}: RulerSliderProps) {
  const lastHaptic = useRef(value);
  const values = Array.from(
    { length: Math.round((max - min) / step) + 1 },
    (_, i) => min + i * step,
  );

  const SIDE_PADDING = 180;

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const index = Math.round(x / TICK_GAP);
      const clamped = Math.max(0, Math.min(values.length - 1, index));
      const nextValue = values[clamped];

      if (nextValue !== lastHaptic.current) {
        lastHaptic.current = nextValue;
        if (Platform.OS !== "web") {
          Haptics.selectionAsync();
        }
        onChange(nextValue);
      }
    },
    [values, onChange],
  );

  return (
    <View style={s.container}>
      <View pointerEvents="none" style={s.centerLine} />
      <View pointerEvents="none" style={s.centerLineGlow} />

      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={TICK_GAP}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: SIDE_PADDING }}
        contentOffset={{ x: ((value - min) / step) * TICK_GAP, y: 0 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        accessibilityRole="adjustable"
        accessibilityLabel={`${unitLabel} selector`}
      >
        {values.map((v) => {
          const isMajor = v % 10 === 0;
          const isMid = v % 5 === 0;
          return (
            <View key={v} style={{ width: TICK_GAP, alignItems: "center" }}>
              <View
                style={[
                  s.tick,
                  isMajor ? s.tickMajor : isMid ? s.tickMid : s.tickMinor,
                ]}
              />
              {isMajor && <Text style={s.tickLabel}>{v}</Text>}
            </View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { height: 110, justifyContent: "flex-end" },
  centerLine: {
    position: "absolute",
    top: 0,
    left: "50%",
    marginLeft: -1,
    width: 2,
    height: 64,
    backgroundColor: C.accent,
    zIndex: 10,
  },
  centerLineGlow: {
    position: "absolute",
    top: 0,
    left: "50%",
    marginLeft: -8,
    width: 16,
    height: 64,
    backgroundColor: C.accent,
    opacity: 0.15,
    borderRadius: 8,
    zIndex: 9,
  },
  tick: { borderRadius: 2 },
  tickMinor: {
    width: 1.5,
    height: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginBottom: 24,
  },
  tickMid: {
    width: 1.5,
    height: 26,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginBottom: 24,
  },
  tickMajor: {
    width: 2,
    height: 40,
    backgroundColor: C.accent,
    marginBottom: 8,
  },
  tickLabel: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: C.muted,
  },
});
