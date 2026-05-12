import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "@/src/theme";
import { FoodLogItem } from "./FoodLogItem";
import type { MealEntry } from "../types";

type Props = { title: string; items: MealEntry[] };

export function MealSection({ title, items }: Props) {
  if (items.length === 0) return null;
  return (
    <View style={s.wrap}>
      <Text style={s.title}>{title}</Text>
      {items.map((item) => (
        <FoodLogItem key={item.id} item={item} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginBottom: 20 },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.muted,
    letterSpacing: 1,
    marginBottom: 8,
  },
});
