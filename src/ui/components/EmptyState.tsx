import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/src/ui/tokens";

type Props = { title: string; subtitle?: string };

export function EmptyState({ title, subtitle }: Props) {
  return (
    <View style={s.wrap}>
      <Text style={s.title}>{title}</Text>
      {subtitle ? <Text style={s.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 24, alignItems: "center" },
  title: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.text, textAlign: "center" },
  sub: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.muted, textAlign: "center", marginTop: 8 },
});
