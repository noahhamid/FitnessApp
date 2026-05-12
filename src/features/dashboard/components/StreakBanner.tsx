import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/src/theme";

type Props = { days?: number; message?: string };

export function StreakBanner({ days = 12, message }: Props) {
  return (
    <View style={s.wrap}>
      <Text style={{ fontSize: 13 }}>🔥</Text>
      <Text style={s.text}>{message ?? `${days}-day streak — keep it going!`}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginTop: 14,
    backgroundColor: COLORS.bg2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: { fontFamily: FONTS.semiBold, fontSize: 12, color: COLORS.text, marginLeft: 6 },
});
