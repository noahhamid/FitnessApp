import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/src/theme";

export function SessionStats() {
  return (
    <View style={s.row}>
      <Text style={s.stat}>Sessions this week: 0</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { paddingVertical: 8 },
  stat: { fontFamily: FONTS.regular, color: COLORS.text, fontSize: 14 },
});
