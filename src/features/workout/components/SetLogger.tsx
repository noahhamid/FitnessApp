import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/src/theme";

/** Placeholder set row logger */
export function SetLogger() {
  return (
    <View style={s.box}>
      <Text style={s.text}>Set logger</Text>
    </View>
  );
}

const s = StyleSheet.create({
  box: { padding: 12, borderRadius: 12, backgroundColor: COLORS.bg3 },
  text: { color: COLORS.muted, fontFamily: FONTS.medium },
});
