import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react-native";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { AppIcon } from "@/src/components/AppIcon";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";

type Props = {
  glasses: number;
  total: number;
  onAdjust: (delta: number) => void;
};

const WATER_WELL = {
  light: {
    bg: "rgba(64,140,230,0.14)",
    border: "rgba(64,140,230,0.28)",
  },
  dark: {
    bg: "rgba(70,150,255,0.18)",
    border: "rgba(70,150,255,0.32)",
  },
} as const;

const TAP_COOLDOWN_MS = 160;

function Dash({
  filled,
  T,
  dashStyle,
}: {
  filled: boolean;
  T: AppTheme;
  dashStyle: ViewStyle;
}) {
  return (
    <View style={[dashStyle, { backgroundColor: T.border }]}>
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: T.accent,
            opacity: filled ? 1 : 0,
            borderRadius: 3,
          },
        ]}
      />
    </View>
  );
}

export function WaterTracker({ glasses, total, onAdjust }: Props) {
  const { T, styles, resolved } = useThemedStyles(makeStyles);
  const well = WATER_WELL[resolved];

  // Local display owns the count while the user is tapping so a late
  // server write can't bounce the UI (the flicker on rapid +/-).
  const [display, setDisplay] = useState(glasses);
  const intentRef = useRef(glasses);
  const lastTapAt = useRef(0);
  const dirtyUntil = useRef(0);
  const sparkBusy = useRef(false);

  const dropY = useRef(new Animated.Value(0)).current;
  const dropOpacity = useRef(new Animated.Value(0)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (glasses === intentRef.current) {
      setDisplay(glasses);
      dirtyUntil.current = 0;
      return;
    }
    // Ignore stale server writes while the user is still tapping / syncing.
    if (Date.now() < dirtyUntil.current) return;
    intentRef.current = glasses;
    setDisplay(glasses);
  }, [glasses]);

  const atMin = display <= 0;
  const atMax = display >= total;

  const playSpark = (direction: 1 | -1) => {
    if (sparkBusy.current) return;
    sparkBusy.current = true;

    dropY.setValue(0);
    dropOpacity.setValue(0);
    iconPulse.setValue(1);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 0.9,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.spring(iconPulse, {
          toValue: 1,
          friction: 6,
          tension: 140,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(dropOpacity, {
          toValue: 1,
          duration: 30,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(dropY, {
            toValue: direction > 0 ? -26 : 16,
            duration: 380,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(dropOpacity, {
            toValue: 0,
            duration: 380,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(() => {
      sparkBusy.current = false;
    });
  };

  const handleAdjust = (delta: 1 | -1) => {
    const now = Date.now();
    if (now - lastTapAt.current < TAP_COOLDOWN_MS) return;

    const next = Math.max(0, Math.min(total, display + delta));
    if (next === display) return;

    lastTapAt.current = now;
    dirtyUntil.current = now + 2500;
    intentRef.current = next;
    setDisplay(next);
    onAdjust(delta);
    playSpark(delta);
  };

  return (
    <GlassSurface style={styles.card}>
      <View style={styles.iconWrap}>
        <Animated.View
          style={[
            styles.icon,
            {
              backgroundColor: well.bg,
              borderColor: well.border,
              transform: [{ scale: iconPulse }],
            },
          ]}
        >
          <AppIcon name="water" size={28} />
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.risingDrop,
            {
              opacity: dropOpacity,
              transform: [{ translateY: dropY }, { scale: 0.9 }],
            },
          ]}
        >
          <AppIcon name="water" size={16} />
        </Animated.View>
      </View>

      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={styles.label}>Water intake</Text>
          <Text style={styles.value}>
            {display} of {total} glasses
          </Text>
        </View>
        <View style={styles.dashes}>
          {Array.from({ length: total }).map((_, i) => (
            <Dash key={i} filled={i < display} T={T} dashStyle={styles.dash} />
          ))}
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable
          onPress={() => handleAdjust(-1)}
          disabled={atMin}
          hitSlop={6}
          style={({ pressed }) => [
            styles.ctrlBtn,
            atMin && styles.ctrlBtnDisabled,
            pressed && !atMin && styles.ctrlBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Remove a glass"
        >
          <Minus size={15} color={T.white} strokeWidth={2.4} />
        </Pressable>
        <Pressable
          onPress={() => handleAdjust(1)}
          disabled={atMax}
          hitSlop={6}
          style={({ pressed }) => [
            styles.ctrlBtn,
            styles.ctrlBtnAdd,
            atMax && styles.ctrlBtnDisabled,
            pressed && !atMax && styles.ctrlBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Add a glass"
        >
          <Plus size={15} color={T.onAccent} strokeWidth={2.4} />
        </Pressable>
      </View>
    </GlassSurface>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 20,
      padding: 16,
    },
    iconWrap: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
    },
    icon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 0.5,
      alignItems: "center",
      justifyContent: "center",
    },
    risingDrop: {
      position: "absolute",
      top: 4,
      zIndex: 3,
    },
    body: { flex: 1, zIndex: 1 },
    top: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 7,
      gap: 8,
    },
    label: { fontFamily: T.bodySemi, fontSize: 12, color: T.white },
    value: {
      fontFamily: T.bodyMed,
      fontSize: 11,
      color: T.muted,
      fontVariant: ["tabular-nums"],
    },
    dashes: { flexDirection: "row", gap: 4 },
    dash: { height: 6, flex: 1, borderRadius: 3 },
    controls: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      zIndex: 1,
    },
    ctrlBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: T.accentTint,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: T.accentLine,
    },
    ctrlBtnAdd: {
      backgroundColor: T.accent,
      borderColor: T.accent,
    },
    ctrlBtnDisabled: { opacity: 0.35 },
    ctrlBtnPressed: { opacity: 0.85 },
  });
}
