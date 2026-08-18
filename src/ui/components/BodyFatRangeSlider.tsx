import { type OnboardingColors } from "@/src/ui/tokens";
import { useOnboardingStyles } from "@/src/features/auth/hooks/useOnboardingStyles";
import type { BodyFatBand } from "@/src/lib/body-fat-bands";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  View,
} from "react-native";

type Props = {
  bands: BodyFatBand[];
  index: number;
  onChangeIndex: (index: number) => void;
};

export function BodyFatRangeSlider({ bands, index, onChangeIndex }: Props) {
  const { C, styles } = useOnboardingStyles(makeStyles);
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const indexRef = useRef(index);
  indexRef.current = index;

  const count = bands.length;
  const last = Math.max(1, count - 1);

  const indexFromX = useCallback(
    (x: number) => {
      const w = widthRef.current;
      if (w <= 0) return indexRef.current;
      const t = Math.min(1, Math.max(0, x / w));
      return Math.round(t * last);
    },
    [last],
  );

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          onChangeIndex(indexFromX(evt.nativeEvent.locationX));
        },
        onPanResponderMove: (evt) => {
          onChangeIndex(indexFromX(evt.nativeEvent.locationX));
        },
      }),
    [indexFromX, onChangeIndex],
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const next = e.nativeEvent.layout.width;
    widthRef.current = next;
    setWidth(next);
  };

  const thumbLeft = width > 0 ? (index / last) * width : 0;

  return (
    <View style={styles.wrap} onLayout={onLayout} {...pan.panHandlers}>
      <View style={styles.track} />
      {bands.map((band, i) => (
        <View
          key={band.id}
          pointerEvents="none"
          style={[
            styles.tick,
            {
              left: width > 0 ? (i / last) * width - 5 : 0,
              backgroundColor: i === index ? C.accent : C.border,
            },
          ]}
        />
      ))}
      <View
        pointerEvents="none"
        style={[
          styles.thumb,
          { left: thumbLeft - 11, backgroundColor: C.accent },
        ]}
      />
    </View>
  );
}

function makeStyles(_C: OnboardingColors) {
  return StyleSheet.create({
    wrap: {
      height: 44,
      width: "100%",
      justifyContent: "center",
    },
    track: {
      height: 3,
      borderRadius: 2,
      backgroundColor: _C.border,
      width: "100%",
    },
    tick: {
      position: "absolute",
      width: 10,
      height: 10,
      borderRadius: 5,
      top: 17,
    },
    thumb: {
      position: "absolute",
      width: 22,
      height: 22,
      borderRadius: 11,
      top: 11,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
      elevation: 3,
    },
  });
}
