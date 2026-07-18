import { View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

const C = {
  accent: "#FFC700",
  card: "#1E1E1E",
};

interface HeroMarkProps {
  size?: number;
}

/** Abstract dumbbell mark built from primitives — no external image asset needed. */
export function HeroMark({ size = 220 }: HeroMarkProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 220 220">
        <Defs>
          <LinearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={C.accent} stopOpacity="1" />
            <Stop offset="1" stopColor={C.accent} stopOpacity="0.55" />
          </LinearGradient>
        </Defs>

        {/* backdrop ring */}
        <Circle
          cx="110"
          cy="110"
          r="95"
          stroke="rgba(255,199,0,0.12)"
          strokeWidth="1.5"
          fill="none"
        />
        <Circle
          cx="110"
          cy="110"
          r="70"
          stroke="rgba(255,199,0,0.18)"
          strokeWidth="1"
          fill="none"
        />

        {/* dumbbell bar */}
        <Rect
          x="70"
          y="103"
          width="80"
          height="14"
          rx="7"
          fill="url(#heroGrad)"
        />

        {/* left plates */}
        <Rect
          x="38"
          y="70"
          width="16"
          height="80"
          rx="6"
          fill="url(#heroGrad)"
        />
        <Rect
          x="58"
          y="85"
          width="10"
          height="50"
          rx="4"
          fill="url(#heroGrad)"
          opacity={0.8}
        />

        {/* right plates */}
        <Rect
          x="166"
          y="70"
          width="16"
          height="80"
          rx="6"
          fill="url(#heroGrad)"
        />
        <Rect
          x="152"
          y="85"
          width="10"
          height="50"
          rx="4"
          fill="url(#heroGrad)"
          opacity={0.8}
        />
      </Svg>
    </View>
  );
}
