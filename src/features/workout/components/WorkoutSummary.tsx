import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/src/theme";

type Props = { durationMin?: number; volumeKg?: number };

export function WorkoutSummary({ durationMin = 45, volumeKg = 8200 }: Props) {
  return (
    <View style={s.card}>
      <Text style={s.title}>SESSION SUMMARY</Text>
      <Text style={s.line}>{durationMin} min · {volumeKg.toLocaleString()} kg volume</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: { fontFamily: FONTS.black, color: COLORS.text, fontSize: 18 },
  line: { fontFamily: FONTS.regular, color: COLORS.muted, marginTop: 8 },
});
