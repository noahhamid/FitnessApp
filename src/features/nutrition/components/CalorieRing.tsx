import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { T } from "../theme";

type Props = {
  consumed: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
};

// Same visual language as the card's calRing/durationRing — glass track,
// single gold accent fill, Space Grotesk number.
export function CalorieRing({
  consumed,
  goal,
  size = 118,
  strokeWidth = 11,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(consumed / goal, 1));
  const offset = circumference * (1 - pct);

  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={T.glassBorder}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={T.accent}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.num}>{consumed}</Text>
        <Text style={styles.lbl}>of {goal} Cal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  num: { fontFamily: T.display, fontSize: 24, color: T.white },
  lbl: { fontFamily: T.bodyMed, fontSize: 10, color: T.muted, marginTop: 3 },
});
