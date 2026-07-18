import { View } from "react-native";
import Svg, {
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

const C = {
  accent: "#FFC700",
};

export function CheckBadge({ size = 96 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 96 96">
        <Defs>
          <LinearGradient id="badgeGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={C.accent} stopOpacity="1" />
            <Stop offset="1" stopColor={C.accent} stopOpacity="0.7" />
          </LinearGradient>
        </Defs>
        <Circle
          cx="48"
          cy="48"
          r="46"
          stroke="rgba(255,199,0,0.2)"
          strokeWidth="1.5"
          fill="none"
        />
        <Circle cx="48" cy="48" r="36" fill="url(#badgeGrad)" />
        <Path
          d="M34 49 L44 59 L64 37"
          stroke="#121212"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}
