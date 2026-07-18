import { View } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

const C = {
  accent: "#FFC700",
  card: "#1E1E1E",
};

export type GoalIconName = "lose" | "build" | "endure" | "health";

interface GoalIconProps {
  name: GoalIconName;
  size?: number;
}

function IconPath({ name }: { name: GoalIconName }) {
  switch (name) {
    case "lose":
      // downward trend arrow
      return (
        <Path
          d="M6 8 L13 15 L17 11 L26 20 M20 20 H26 V14"
          stroke={C.accent}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      );
    case "build":
      // dumbbell
      return (
        <>
          <Path
            d="M8 16 H24"
            stroke={C.accent}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
          <Circle cx="7" cy="16" r="3.5" fill={C.accent} />
          <Circle cx="25" cy="16" r="3.5" fill={C.accent} />
        </>
      );
    case "endure":
      // lightning bolt
      return (
        <Path
          d="M17 6 L9 18 H15 L13 26 L23 13 H16 L17 6 Z"
          fill={C.accent}
        />
      );
    case "health":
      // heart
      return (
        <Path
          d="M16 25 C10 20 6 16.5 6 12.5 C6 9.5 8.3 7.5 11 7.5 C13 7.5 14.7 8.7 16 10.5 C17.3 8.7 19 7.5 21 7.5 C23.7 7.5 26 9.5 26 12.5 C26 16.5 22 20 16 25 Z"
          fill={C.accent}
        />
      );
  }
}

export function GoalIcon({ name, size = 56 }: GoalIconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "rgba(255,199,0,0.12)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size * 0.57} height={size * 0.57} viewBox="0 0 32 32">
        <IconPath name={name} />
      </Svg>
    </View>
  );
}