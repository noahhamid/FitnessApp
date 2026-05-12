import { View, type StyleProp, type ViewStyle } from "react-native";
import { COLORS } from "@/src/ui/tokens";

type Props = { width?: number | `${number}%`; height?: number; style?: StyleProp<ViewStyle> };

export function Skeleton({ width = "100%", height = 16, style }: Props) {
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: 8,
          backgroundColor: COLORS.bg3,
        },
        style,
      ]}
    />
  );
}
