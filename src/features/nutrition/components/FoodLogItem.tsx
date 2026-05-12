import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/src/theme";
import type { MealEntry } from "../types";

type Props = { item: MealEntry };

export function FoodLogItem({ item }: Props) {
  return (
    <View style={s.row}>
      <View style={{ flex: 1 }}>
        <Text style={s.name}>{item.name}</Text>
        <Text style={s.meta}>
          {item.time} · {item.meal}
        </Text>
      </View>
      <Text style={s.cal}>{item.cal} kcal</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  name: { fontFamily: FONTS.semiBold, color: COLORS.text, fontSize: 14 },
  meta: { fontFamily: FONTS.regular, color: COLORS.muted, fontSize: 11, marginTop: 2 },
  cal: { fontFamily: FONTS.bold, color: COLORS.accent, fontSize: 13 },
});
