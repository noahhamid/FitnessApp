import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/src/theme";

type Props = { lift: string; weight: string; date?: string };

export function PRCard({ lift, weight, date }: Props) {
  return (
    <View style={s.card}>
      <Text style={s.lift}>{lift}</Text>
      <Text style={s.weight}>{weight}</Text>
      {date ? <Text style={s.date}>{date}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  lift: { fontFamily: FONTS.bold, color: COLORS.text, fontSize: 15 },
  weight: { fontFamily: FONTS.black, color: COLORS.accent, fontSize: 22, marginTop: 4 },
  date: { fontFamily: FONTS.regular, color: COLORS.muted, fontSize: 11, marginTop: 6 },
});
