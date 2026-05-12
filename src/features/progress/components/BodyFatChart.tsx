import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/src/theme";

export function BodyFatChart() {
  return (
    <View style={s.box}>
      <Text style={s.text}>Body fat trend</Text>
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    height: 160,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontFamily: FONTS.medium, color: COLORS.muted },
});
