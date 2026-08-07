import { useEffect, useRef } from "react";
import { Droplet, Plus } from "lucide-react-native";
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

/** Same cool-blue well as TodaySnapshotRow water — light/dark safe. */
const WATER_WELL = {
  light: {
    bg: "rgba(64,140,230,0.14)",
    border: "rgba(64,140,230,0.28)",
    icon: "#2F7FD4",
  },
  dark: {
    bg: "rgba(70,150,255,0.18)",
    border: "rgba(70,150,255,0.32)",
    icon: "#6BA8FF",
  },
} as const;

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
      useNativeDriver: true,
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
  const { T, styles, resolved } = useThemedStyles(makeStyles);
  const well = WATER_WELL[resolved];

  const btnScale = useRef(new Animated.Value(1)).current;
  const dropY = useRef(new Animated.Value(0)).current;
  const dropOpacity = useRef(new Animated.Value(0)).current;

  const handleAdd = () => {
    onAdd();

    btnScale.setValue(1);
    dropY.setValue(0);
    dropOpacity.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(btnScale, {
          toValue: 0.86,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.spring(btnScale, {
          toValue: 1,
          ...T.motion.settle,
        }),
      ]),
      Animated.sequence([
        Animated.timing(dropOpacity, {
          toValue: 1,
          duration: 40,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(dropY, {
            toValue: -22,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(dropOpacity, {
            toValue: 0,
            duration: 420,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  };

  return (
    <GlassSurface style={styles.card}>
      <View
        style={[
          styles.icon,
          { backgroundColor: well.bg, borderColor: well.border },
        ]}
      >
        <Droplet size={17} color={well.icon} strokeWidth={2} />
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

      <View style={styles.addWrap}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.risingDrop,
            {
              opacity: dropOpacity,
              transform: [{ translateY: dropY }, { scale: 0.85 }],
            },
          ]}
        >
          <Droplet size={12} color={well.icon} strokeWidth={2.4} fill={well.icon} />
        </Animated.View>
        <PressableScale onPress={handleAdd} scaleTo={0.9} style={styles.addPressable}>
          <Animated.View style={[styles.add, { transform: [{ scale: btnScale }] }]}>
            <Plus size={15} color={T.onAccent} strokeWidth={2.4} />
          </Animated.View>
        </PressableScale>
      </View>
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
      borderRadius: 18,
      borderWidth: 0.5,
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
    addWrap: {
      width: 30,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    },
    risingDrop: {
      position: "absolute",
      top: -2,
      zIndex: 2,
    },
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
}
