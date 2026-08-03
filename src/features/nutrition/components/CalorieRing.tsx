import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, Animated, Easing } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

type Props = {
  consumed: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
};

const TICK_COUNT = 48;
const TICK_LENGTH = 5;
const TICK_INSET = 3; // gap between the arc and the tick ring

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

export function CalorieRing({
  consumed,
  goal,
  size = 118,
  strokeWidth = 8,
}: Props) {
  const { T, styles } = useThemedStyles(makeStyles);
  const cx = size / 2;
  const cy = size / 2;
  const arcRadius = (size - strokeWidth) / 2 - TICK_LENGTH - TICK_INSET;
  const tickOuterR = size / 2 - 1;
  const tickInnerR = tickOuterR - TICK_LENGTH;

  const circumference = 2 * Math.PI * arcRadius;
  const pct = goal > 0 ? Math.max(0, Math.min(consumed / goal, 1)) : 0;

  // Signature motion: this is the one thing on the meal screen a user
  // actually watches happen. The ring fills from empty to the real
  // percentage and the calorie count ticks up alongside it, in lockstep —
  // not a decorative flourish, the animation *is* the data arriving.
  const progress = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);
  const [capPos, setCapPos] = useState(() => polar(cx, cy, arcRadius, 0));

  useEffect(() => {
    progress.setValue(0);
    setDisplayValue(0);
    setCapPos(polar(cx, cy, arcRadius, 0));

    const listenerId = progress.addListener(({ value }) => {
      setDisplayValue(Math.round(value * consumed));
      setCapPos(polar(cx, cy, arcRadius, value * pct * 360));
    });

    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // strokeDashoffset can't ride the native driver
    });
    anim.start();

    return () => {
      anim.stop();
      progress.removeListener(listenerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consumed, goal]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, circumference * (1 - pct)],
  });

  const ticks = Array.from({ length: TICK_COUNT }).map((_, i) => {
    const angle = (i / TICK_COUNT) * 360;
    const outer = polar(cx, cy, tickOuterR, angle);
    const inner = polar(cx, cy, tickInnerR, angle);
    // every 4th tick (12 marks total) drawn slightly bolder, like minute
    // marks vs hour marks on a watch face — pure bezel detail, not data
    const major = i % 4 === 0;
    return { key: i, outer, inner, major };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {ticks.map((t) => (
          <Line
            key={t.key}
            x1={t.inner.x}
            y1={t.inner.y}
            x2={t.outer.x}
            y2={t.outer.y}
            stroke={T.border}
            strokeWidth={t.major ? 1.5 : 1}
            strokeLinecap="round"
            opacity={t.major ? 0.9 : 0.5}
          />
        ))}

        <Circle
          cx={cx}
          cy={cy}
          r={arcRadius}
          stroke={T.accentTint}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={arcRadius}
          stroke={T.accent}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          fill="none"
          transform={`rotate(-90 ${cx} ${cy})`}
        />

        {pct > 0.01 && (
          <Circle
            cx={capPos.x}
            cy={capPos.y}
            r={strokeWidth / 2 + 1.5}
            fill={T.accent}
          />
        )}
      </Svg>
      <View style={styles.center}>
        <Text style={styles.num}>{displayValue}</Text>
        <Text style={styles.lbl}>of {goal} Cal</Text>
      </View>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    center: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
    },
    num: {
      fontFamily: T.display,
      fontSize: 22,
      color: T.white,
      fontVariant: ["tabular-nums"],
    },
    lbl: { fontFamily: T.bodyMed, fontSize: 9.5, color: T.muted, marginTop: 3 },
  });
}
