import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { COLORS, FONTS } from "@/src/ui/tokens";

type Props = {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  sublabel?: string;
};

export function ProgressRing({
  pct,
  size = 120,
  stroke = 11,
  color = COLORS.accent,
  label,
  sublabel,
}: Props) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - pct / 100);

  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLORS.border} strokeWidth={stroke} />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          strokeDashoffset={`${dash}`}
        />
      </Svg>
      <View style={s.center}>
        {label ? <Text style={s.label}>{label}</Text> : null}
        {sublabel ? <Text style={s.sub}>{sublabel}</Text> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  center: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  label: { fontFamily: FONTS.black, fontSize: 22, color: COLORS.text, lineHeight: 22 },
  sub: { fontFamily: FONTS.medium, fontSize: 10, color: COLORS.muted, letterSpacing: 0.8, marginTop: 2 },
});
