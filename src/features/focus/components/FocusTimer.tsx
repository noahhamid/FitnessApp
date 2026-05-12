import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/src/theme";

type Props = { label?: string };

export function FocusTimer({ label = "25:00" }: Props) {
  return (
    <View style={s.wrap}>
      <Text style={s.label}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: 24 },
  label: { fontFamily: FONTS.black, fontSize: 48, color: COLORS.accent, letterSpacing: 2 },
});
