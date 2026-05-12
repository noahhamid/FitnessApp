import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/src/theme";

type Props = { seconds?: number };

export function RestTimer({ seconds = 90 }: Props) {
  return (
    <View style={s.box}>
      <Text style={s.text}>Rest {seconds}s</Text>
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: { color: COLORS.accent, fontFamily: FONTS.bold },
});
