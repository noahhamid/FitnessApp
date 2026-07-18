import { View } from "react-native";
import Svg, { Path, Rect, Circle } from "react-native-svg";

const C = { accent: "#FFC700" };

export type EquipmentAccess = "full_gym" | "home_dumbbells" | "bodyweight";

function IconPath({ type, color }: { type: EquipmentAccess; color: string }) {
  switch (type) {
    case "full_gym":
      // barbell
      return (
        <>
          <Rect x="4" y="14" width="4" height="8" rx="1" fill={color} />
          <Rect x="9" y="11" width="3" height="14" rx="1" fill={color} />
          <Rect x="12" y="15" width="12" height="6" rx="1" fill={color} />
          <Rect x="24" y="11" width="3" height="14" rx="1" fill={color} />
          <Rect x="28" y="14" width="4" height="8" rx="1" fill={color} />
        </>
      );
    case "home_dumbbells":
      // single dumbbell
      return (
        <>
          <Rect x="6" y="14" width="6" height="8" rx="2" fill={color} />
          <Rect x="12" y="16.5" width="12" height="3" rx="1.5" fill={color} />
          <Rect x="24" y="14" width="6" height="8" rx="2" fill={color} />
        </>
      );
    case "bodyweight":
      // simple figure doing a push-up-ish pose
      return (
        <>
          <Circle cx="10" cy="10" r="3.5" fill={color} />
          <Path
            d="M10 14 L24 10 M14 14 L12 24 M14 14 L20 22"
            stroke={color}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        </>
      );
  }
}

export function EquipmentIcon({
  type,
  active,
  size = 28,
}: {
  type: EquipmentAccess;
  active: boolean;
  size?: number;
}) {
  const color = active ? "#121212" : C.accent;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <IconPath type={type} color={color} />
      </Svg>
    </View>
  );
}
