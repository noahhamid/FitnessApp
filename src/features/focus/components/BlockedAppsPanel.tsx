import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/src/theme";

export function BlockedAppsPanel() {
  return (
    <View style={s.box}>
      <Text style={s.text}>Blocked apps (PotentialPeak)</Text>
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: COLORS.bg3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: { fontFamily: FONTS.medium, color: COLORS.muted },
});
