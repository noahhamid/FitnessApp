import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/src/ui/tokens";

type Props = { initials: string; size?: number };

export function Avatar({ initials, size = 44 }: Props) {
  return (
    <View style={[s.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[s.text, { fontSize: size * 0.36 }]}>{initials.slice(0, 2).toUpperCase()}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  circle: {
    backgroundColor: COLORS.bg3,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontFamily: FONTS.bold, color: COLORS.text },
});
