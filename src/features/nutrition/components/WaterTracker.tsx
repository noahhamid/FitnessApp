import { useEffect, useRef } from "react";
import { GlassWater, Plus } from "lucide-react-native";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { T } from "@/src/theme";
import { PressableScale } from "./PressableScale";

type Props = {
  glasses: number;
  total: number;
  onAdd: () => void;
};

// Signature motion for this card: a dash eases from empty to filled
// instead of snapping, so tapping "+" reads as a small, immediate
// confirmation rather than a silent state change.
function Dash({ filled }: { filled: boolean }) {
  const anim = useRef(new Animated.Value(filled ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: filled ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true, // now possible
    }).start();
  }, [filled]);

  return (
    <View style={[styles.dash, { backgroundColor: T.border }]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: T.accent, opacity: anim, borderRadius: 3 },
        ]}
      />
    </View>
  );
}

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
            <Dash key={i} filled={i < glasses} />
          ))}
        </View>
      </View>

      <PressableScale onPress={onAdd} scaleTo={0.9} style={styles.addPressable}>
        <View style={styles.add}>
          <Plus size={15} color={T.onImage} strokeWidth={2.4} />
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
    borderWidth: 0.5,
    borderColor: T.glassBorder,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: T.ringGlass,
    borderWidth: 0.5,
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
  dash: { height: 6, flex: 1, borderRadius: 3 },
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
