import { COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

// ✅ Created once at module level — not inside the component.
// Calling createAnimatedComponent() inside a component body recreates it
// on every render, which breaks animation state and causes flickering.
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  label: string;
  sub?: string;
};

export function ProgressCircle({
  pct,
  size = 130,
  stroke = 12,
  color = COLORS.accent,
  label,
  sub,
}: Props) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clampedPct = Math.min(Math.max(pct, 0), 100);
  const isOver = pct > 100;

  const animPct = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animPct, {
      toValue: clampedPct,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clampedPct]);

  const dashOffset = animPct.interpolate({
    inputRange: [0, 100],
    outputRange: [circ, 0],
  });

  return (
    <View style={[s.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={s.svg}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={COLORS.border}
          strokeWidth={stroke}
          fill="none"
        />

        {/* Progress arc — rotated so it starts at 12 o'clock */}
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={isOver ? COLORS.red : color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Center content */}
      <View style={s.center} pointerEvents="none">
        {isOver && (
          <View style={s.overBadge}>
            <Text style={s.overText}>OVER</Text>
          </View>
        )}
        <Text
          style={[
            s.label,
            {
              fontSize: size * 0.175,
              color: isOver ? COLORS.red : COLORS.text,
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {label}
        </Text>
        {sub ? <Text style={s.sub}>{sub}</Text> : null}
        <Text style={[s.pct, { color: isOver ? COLORS.red : color }]}>
          {Math.round(pct)}%
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    position: "absolute",
  },
  center: {
    alignItems: "center",
    gap: 1,
  },
  overBadge: {
    backgroundColor: COLORS.red + "18",
    borderWidth: 1,
    borderColor: COLORS.red + "40",
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginBottom: 2,
  },
  overText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: COLORS.red,
    letterSpacing: 0.5,
  },
  label: {
    fontFamily: FONTS.black,
    lineHeight: undefined,
  },
  sub: {
    fontFamily: FONTS.medium,
    fontSize: 9,
    color: COLORS.muted,
    letterSpacing: 0.8,
    marginTop: 1,
  },
  pct: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    marginTop: 2,
  },
});
