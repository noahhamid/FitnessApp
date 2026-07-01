import { COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Theme constants ──────────────────────────────────────────────────────────
const GOLD = "#FFC700";
const GOLD_TINT = "rgba(255,199,0,0.10)";
const GOLD_BORDER = "rgba(255,199,0,0.22)";
const TRACK = "#2A2A2A";

type Props = {
  pct: number;
  size?: number;
  stroke?: number;
  label: string;
  sub?: string;
};

// color prop removed — gold is the single source of truth for all arcs.
// Pass isOver-sensitive color decisions down through internal logic, not props.
export function ProgressCircle({
  pct,
  size = 130,
  stroke = 12,
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

  const arcColor = isOver ? COLORS.red : GOLD;
  const labelColor = isOver ? COLORS.red : COLORS.text; // white when healthy
  const pctColor = isOver ? COLORS.red : GOLD;

  return (
    <View style={[s.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={s.svg}>
        {/* Dark matte track — replaces the old COLORS.border ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={TRACK}
          strokeWidth={stroke}
          fill="none"
        />

        {/* Progress arc — starts at 12 o'clock */}
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={arcColor}
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
          style={[s.label, { fontSize: size * 0.175, color: labelColor }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {label}
        </Text>
        {sub ? <Text style={s.sub}>{sub}</Text> : null}
        <Text style={[s.pct, { color: pctColor }]}>{Math.round(pct)}%</Text>
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

  // ── Over-budget badge ─────────────────────────────────────────────────────
  // Red is kept as the sole semantic exception — danger state only
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

  // ── Center labels ─────────────────────────────────────────────────────────
  label: {
    fontFamily: FONTS.black,
    lineHeight: undefined,
  },
  sub: {
    fontFamily: FONTS.medium,
    fontSize: 9,
    color: COLORS.muted, // #A0A0A0
    letterSpacing: 0.8,
    marginTop: 1,
  },
  pct: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    marginTop: 2,
  },
});
