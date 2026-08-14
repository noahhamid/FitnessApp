import { FONTS, type OnboardingColors } from "@/src/ui/tokens";
import { useOnboardingStyles } from "@/src/features/auth/hooks/useOnboardingStyles";
import * as Haptics from "expo-haptics";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const TICK_GAP = 8;
const SCALE_HEIGHT = 112;

export type HorizontalWeightScaleHandle = {
  scrollToValue: (kg: number) => void;
};

type Props = {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export const HorizontalWeightScale = forwardRef<
  HorizontalWeightScaleHandle,
  Props
>(function HorizontalWeightScale({ min, max, value, onChange }, ref) {
  const { C, styles: s } = useOnboardingStyles(makeStyles);
  const scrollRef = useRef<ScrollView>(null);
  const lastValue = useRef(value);
  const initialValue = useRef(value).current;
  const [width, setWidth] = useState(0);

  const scrollToValue = useCallback(
    (kg: number) => {
      const next = clamp(kg, min, max);
      scrollRef.current?.scrollTo({
        x: (next - min) * TICK_GAP,
        animated: true,
      });
      if (next !== lastValue.current) {
        lastValue.current = next;
        onChange(next);
      }
    },
    [min, max, onChange],
  );

  useImperativeHandle(ref, () => ({ scrollToValue }), [scrollToValue]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = clamp(
        min + event.nativeEvent.contentOffset.x / TICK_GAP,
        min,
        max,
      );
      if (next === lastValue.current) return;

      lastValue.current = next;
      if (Platform.OS !== "web") void Haptics.selectionAsync();
      onChange(next);
    },
    [min, max, onChange],
  );

  const values = Array.from({ length: max - min + 1 }, (_, index) => min + index);
  const sidePadding = Math.max(0, width / 2 - TICK_GAP / 2);

  return (
    <View
      style={s.container}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <View pointerEvents="none" style={s.track} />
      <View pointerEvents="none" style={s.markerGlow} />
      <View pointerEvents="none" style={s.marker} />

      {width > 0 ? (
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={TICK_GAP}
          decelerationRate="fast"
          overScrollMode="never"
          contentOffset={{
            x: (initialValue - min) * TICK_GAP,
            y: 0,
          }}
          contentContainerStyle={{ paddingHorizontal: sidePadding }}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          accessibilityRole="adjustable"
          accessibilityLabel="Weight in kilograms"
          accessibilityValue={{ text: `${value} kg` }}
        >
          {values.map((kg) => {
            const major = kg % 50 === 0;
            const mid = !major && kg % 10 === 0;
            const visible = major || mid || kg % 5 === 0;

            return (
              <View key={kg} style={s.tickSlot}>
                {visible ? (
                  <View
                    style={[
                      s.tick,
                      major ? s.tickMajor : mid ? s.tickMid : s.tickMinor,
                    ]}
                  />
                ) : null}
                {major ? <Text style={s.label}>{kg}</Text> : null}
              </View>
            );
          })}
        </ScrollView>
      ) : null}

      <Text pointerEvents="none" style={s.hint}>
        SLIDE HORIZONTALLY TO ADJUST
      </Text>
    </View>
  );
});


function makeStyles(C: OnboardingColors) {
  return StyleSheet.create({
  container: {
    width: "100%",
    height: SCALE_HEIGHT,
    justifyContent: "center",
  },
  track: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 42,
    height: 2,
    backgroundColor: C.border,
  },
  marker: {
    position: "absolute",
    top: 13,
    bottom: 32,
    left: "50%",
    width: 3,
    marginLeft: -1.5,
    borderRadius: 2,
    backgroundColor: C.accent,
    zIndex: 10,
  },
  markerGlow: {
    position: "absolute",
    top: 8,
    bottom: 27,
    left: "50%",
    width: 17,
    marginLeft: -8.5,
    borderRadius: 9,
    backgroundColor: "rgba(229,57,53,0.15)",
    zIndex: 9,
  },
  tickSlot: {
    width: TICK_GAP,
    height: 78,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 22,
  },
  tick: {
    backgroundColor: C.muted2,
    borderRadius: 1,
  },
  tickMinor: {
    width: 1,
    height: 12,
  },
  tickMid: {
    width: 1.5,
    height: 20,
    backgroundColor: C.muted,
  },
  tickMajor: {
    width: 2,
    height: 30,
    backgroundColor: C.accent,
  },
  label: {
    position: "absolute",
    top: 56,
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: C.muted,
  },
  hint: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    fontFamily: FONTS.bold,
    fontSize: 9,
    letterSpacing: 1.5,
    color: C.muted2,
  },
});
}

