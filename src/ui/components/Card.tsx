import { View, type StyleProp, type ViewStyle } from "react-native";
import { COLORS } from "@/src/ui/tokens";
import type { ReactNode } from "react";

type Props = { children: ReactNode; style?: StyleProp<ViewStyle> };

export function Card({ children, style }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: COLORS.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: COLORS.border,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
