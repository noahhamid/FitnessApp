import { Text, View, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/src/ui/tokens";

type Props = { label: string; color?: string };

export function Badge({ label, color = COLORS.accent }: Props) {
  return (
    <View style={[s.wrap, { borderColor: color }]}>
      <Text style={[s.text, { color }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: `${COLORS.bg}99`,
  },
  text: { fontFamily: FONTS.semiBold, fontSize: 10, letterSpacing: 0.6 },
});
