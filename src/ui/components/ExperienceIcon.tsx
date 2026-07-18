import { View } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

const C = { accent: "#FFC700" };

export type ExperienceLevel = "novice" | "intermediate" | "advanced";

function Bars({ filled }: { filled: number }) {
  const heights = [10, 16, 22];
  return (
    <>
      {heights.map((h, i) => (
        <Path
          key={i}
          d={`M${8 + i * 8} ${28 - h} h5 v${h} h-5 Z`}
          fill={i < filled ? C.accent : "rgba(255,199,0,0.2)"}
        />
      ))}
    </>
  );
}

export function ExperienceIcon({
  level,
  size = 32,
}: {
  level: ExperienceLevel;
  size?: number;
}) {
  const filled = level === "novice" ? 1 : level === "intermediate" ? 2 : 3;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Bars filled={filled} />
      </Svg>
    </View>
  );
}
