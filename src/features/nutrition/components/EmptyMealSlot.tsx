import { Plus } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { T } from "../theme";
import { PressableScale } from "./PressableScale";

type Props = {
  slot: string;
  recommendedRange: string;
  onAdd: () => void;
};

// Same 168px height as MealPhotoCard so empty and logged slots line up in a
// scroll list, but a dashed glass panel instead of a photo.
export function EmptyMealSlot({ slot, recommendedRange, onAdd }: Props) {
  return (
    <PressableScale onPress={onAdd} scaleTo={0.98} style={s.pressableReset}>
      <View style={s.card}>
        <View>
          <Text style={s.slot}>{slot}</Text>
          <Text style={s.range}>{recommendedRange}</Text>
        </View>
        <View style={s.addRing}>
          <Plus size={18} color={T.accent} strokeWidth={2.2} />
        </View>
      </View>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  pressableReset: { borderRadius: 24 },
  card: {
    height: 88,
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: T.glassBorder,
    backgroundColor: T.glass,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  slot: { fontFamily: T.bodyBold, fontSize: 14, color: T.white },
  range: { fontFamily: T.bodyMed, fontSize: 11, color: T.muted, marginTop: 3 },
  addRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: T.ringBorder,
    backgroundColor: T.ringGlass,
    alignItems: "center",
    justifyContent: "center",
  },
});
