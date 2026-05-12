import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/src/theme";

export function PhotoComparison() {
  return (
    <View style={s.box}>
      <Text style={s.text}>Before / after photos</Text>
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg3,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  text: { fontFamily: FONTS.medium, color: COLORS.muted, textAlign: "center" },
});
