import { useEffect, useRef } from "react";
import { GlassWater, Plus } from "lucide-react-native";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";
import { PressableScale } from "./PressableScale";

type Props = {
  glasses: number;
  total: number;
  onAdd: () => void;
};

// Signature motion for this card: a dash eases from empty to filled
// instead of snapping, so tapping "+" reads as a small, immediate
// confirmation rather than a silent state change.
function Dash({
  filled,
  T,
  dashStyle,
}: {
  filled: boolean;
  T: AppTheme;
  dashStyle: ViewStyle;
}) {
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
    <View style={[dashStyle, { backgroundColor: T.border }]}>
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
  const { T, styles } = useThemedStyles(makeStyles);

  return (
    <GlassSurface style={styles.card}>
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
            <Dash key={i} filled={i < glasses} T={T} dashStyle={styles.dash} />
          ))}
        </View>
      </View>

      <PressableScale onPress={onAdd} scaleTo={0.9} style={styles.addPressable}>
        <View style={styles.add}>
          <Plus size={15} color={T.onAccent} strokeWidth={2.4} />
        </View>
      </PressableScale>
    </GlassSurface>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      borderRadius: 20,
      padding: 16,
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
      zIndex: 1,
    },
    body: { flex: 1, zIndex: 1 },
    top: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 7,
    },
    label: { fontFamily: T.bodySemi, fontSize: 12, color: T.white },
    value: { fontFamily: T.bodyMed, fontSize: 11, color: T.muted },
    dashes: { flexDirection: "row", gap: 4 },
    dash: { height: 6, flex: 1, borderRadius: 3 },
    addPressable: { borderRadius: 15, zIndex: 1 },
    add: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: T.accent,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
