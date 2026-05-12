import { View, StyleSheet } from "react-native";
import { C } from "@/src/ui/tokens";

type Props = { total: number; current: number };

export function ProgressDots({ total, current }: Props) {
  return (
    <View style={s.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[s.dot, i === current ? s.active : s.inactive]} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 6,
  },
  dot: { height: 4, borderRadius: 2 },
  active: { width: 24, backgroundColor: C.accent },
  inactive: { width: 8, backgroundColor: C.border },
});
