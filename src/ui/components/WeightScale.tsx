import { View } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Stop,
} from "react-native-svg";

const C = {
  card: "#1E1E1E",
  accent: "#FFC700",
};

interface WeightScaleProps {
  weightKg: number;
  min: number;
  max: number;
  size?: number;
}

/** A dial illustration: needle sweeps -60deg to +60deg across min..max */
export function WeightScale({
  weightKg,
  min,
  max,
  size = 220,
}: WeightScaleProps) {
  const clamped = Math.max(min, Math.min(max, weightKg));
  const ratio = (clamped - min) / (max - min);
  const angle = -60 + ratio * 120;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;

  const ticks = Array.from({ length: 13 }, (_, i) => {
    const tAngle = -60 + i * 10;
    const isMajor = i % 3 === 0;
    const rad = (tAngle * Math.PI) / 180;
    const outer = radius;
    const inner = radius - (isMajor ? 14 : 8);
    return {
      x1: cx + outer * Math.sin(rad),
      y1: cy - outer * Math.cos(rad),
      x2: cx + inner * Math.sin(rad),
      y2: cy - inner * Math.cos(rad),
      isMajor,
    };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="dialGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={C.card} />
            <Stop offset="1" stopColor="#121212" />
          </LinearGradient>
        </Defs>

        <Circle
          cx={cx}
          cy={cy}
          r={radius + 20}
          fill="url(#dialGrad)"
          stroke="rgba(255,199,0,0.15)"
          strokeWidth={1}
        />

        {ticks.map((t, i) => (
          <Line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.isMajor ? C.accent : "rgba(255,255,255,0.25)"}
            strokeWidth={t.isMajor ? 2.5 : 1.5}
            strokeLinecap="round"
          />
        ))}

        <G rotation={angle} origin={`${cx}, ${cy}`}>
          <Line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - radius + 22}
            stroke={C.accent}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </G>

        <Circle cx={cx} cy={cy} r={7} fill={C.accent} />
        <Circle cx={cx} cy={cy} r={3} fill={C.card} />
      </Svg>
    </View>
  );
}
