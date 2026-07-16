import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";

const C = {
  accent: "#FFC700",
};

interface HeightSilhouetteProps {
  heightCm: number;
  min: number;
  max: number;
  containerHeight?: number;
}

/**
 * Stylized figure whose vertical scale interpolates between min/max height.
 * A dashed marker line tracks the current value against the frame.
 */
export function HeightSilhouette({
  heightCm,
  min,
  max,
  containerHeight = 260,
}: HeightSilhouetteProps) {
  const clamped = Math.max(min, Math.min(max, heightCm));
  const ratio = (clamped - min) / (max - min);
  const figureHeight = 90 + ratio * (containerHeight - 110);
  const figureWidth = figureHeight * 0.24;

  return (
    <View style={[s.frame, { height: containerHeight }]}>
      <View style={s.baseline} />
      <View style={[s.markerLine, { bottom: figureHeight + 4 }]} />

      <Svg
        width={figureWidth}
        height={figureHeight}
        viewBox="0 0 100 400"
        style={{ marginBottom: 2 }}
      >
        <Defs>
          <LinearGradient id="figGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={C.accent} stopOpacity="1" />
            <Stop offset="1" stopColor={C.accent} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>

        <Circle cx="50" cy="40" r="32" fill="url(#figGrad)" />

        <Path
          d="
            M 50 76
            C 20 76, 12 120, 18 180
            L 24 260
            C 20 300, 22 340, 30 395
            L 45 395
            C 42 340, 44 300, 46 260
            L 50 220
            L 54 260
            C 56 300, 58 340, 55 395
            L 70 395
            C 78 340, 80 300, 76 260
            L 82 180
            C 88 120, 80 76, 50 76
            Z
          "
          fill="url(#figGrad)"
        />
      </Svg>
    </View>
  );
}

const s = StyleSheet.create({
  frame: {
    width: 100,
    justifyContent: "flex-end",
    alignItems: "center",
    position: "relative",
  },
  baseline: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 2,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  markerLine: {
    position: "absolute",
    width: "70%",
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "rgba(255,199,0,0.4)",
  },
});
