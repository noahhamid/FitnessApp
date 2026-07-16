import { GlassWater, Plus } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { T } from "../theme";
import { PressableScale } from "./PressableScale";

type Props = {
  glasses: number;
  total: number;
  onAdd: () => void;
};

export function WaterTracker({ glasses, total, onAdd }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <GlassWater size={17} color={T.accent} strokeWidth={2} />
      </View>

      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={styles.label}>Water intake</Text>
          <Text style={styles.value}>
            {glasses} of {total} glasses
          </Text>
        </View>
        <View style={styles.dashes}>
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              style={[styles.dash, i < glasses && styles.dashFilled]}
            />
          ))}
        </View>
      </View>

      <PressableScale onPress={onAdd} scaleTo={0.9} style={styles.addPressable}>
        <View style={styles.add}>
          <Plus size={15} color={T.bg} strokeWidth={2.4} />
        </View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.glassBorder,
    borderRadius: 20,
    padding: 16,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: T.ringGlass,
    borderWidth: 1,
    borderColor: T.ringBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1 },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  label: { fontFamily: T.bodySemi, fontSize: 12, color: T.white },
  value: { fontFamily: T.bodyMed, fontSize: 11, color: T.muted },
  dashes: { flexDirection: "row", gap: 4 },
  dash: { height: 6, flex: 1, borderRadius: 3, backgroundColor: T.glass },
  dashFilled: { backgroundColor: T.accent },
  addPressable: { borderRadius: 15 },
  add: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: T.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
