import { useEffect, useRef } from "react";
import { Flame } from "lucide-react-native";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";

type Day = { label: string; pct: number; isToday?: boolean };

type Props = {
  days: Day[];
  streak: number;
};

type BarStyles = Pick<ReturnType<typeof makeStyles>, "barTrack" | "barFill">;

// Signature motion for this card: each bar grows from 0 to its real
// height rather than appearing — a smaller echo of the same "reveal the
// data arriving" idea as CalorieRing, staggered left-to-right like the
// screen's standard card entrance.
function Bar({
  pct,
  isToday,
  delay,
  styles,
}: {
  pct: number;
  isToday?: boolean;
  delay: number;
  styles: BarStyles;
}) {
  const grow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    grow.setValue(0);
    const anim = Animated.timing(grow, {
      toValue: 1,
      duration: 560,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // height can't ride the native driver
    });
    anim.start();
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct]);

  const height = grow.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", `${pct}%`],
  });

  return (
    <View style={styles.barTrack}>
      <Animated.View
        style={[styles.barFill, { height, opacity: isToday ? 1 : 0.55 }]}
      />
    </View>
  );
}

export function WeeklyTrendCard({ days, streak }: Props) {
  const { T, styles } = useThemedStyles(makeStyles);

  return (
    <GlassSurface style={styles.card}>
      <Text style={styles.title}>Calories logged, last 7 days</Text>

      <View style={styles.chart}>
        {days.map((d, i) => (
          <Bar
            key={i}
            pct={d.pct}
            isToday={d.isToday}
            delay={i * 60}
            styles={styles}
          />
        ))}
      </View>

      <View style={styles.labels}>
        {days.map((d, i) => (
          <Text key={i} style={styles.labelText}>
            {d.label}
          </Text>
        ))}
      </View>

      <View style={styles.streakRow}>
        <Flame size={13} color={T.accent} strokeWidth={2.4} />
        <Text style={styles.streak}>
          <Text style={styles.streakBold}>{streak}-day</Text> logging streak
        </Text>
      </View>
    </GlassSurface>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      borderRadius: 20,
      padding: 18,
    },
    title: {
      fontFamily: T.bodySemi,
      fontSize: 12,
      color: T.muted,
      zIndex: 1,
    },
    chart: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 9,
      height: 78,
      marginTop: 14,
      zIndex: 1,
    },
    barTrack: {
      flex: 1,
      height: "100%",
      borderRadius: 7,
      backgroundColor: T.accentTint,
      justifyContent: "flex-end",
      overflow: "hidden",
    },
    barFill: { width: "100%", borderRadius: 7, backgroundColor: T.accent },
    labels: { flexDirection: "row", gap: 9, marginTop: 8, zIndex: 1 },
    labelText: {
      flex: 1,
      textAlign: "center",
      fontFamily: T.bodyBold,
      fontSize: 9.5,
      color: T.muted,
    },
    streakRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 15,
      zIndex: 1,
    },
    streak: {
      fontFamily: T.bodyMed,
      fontSize: 11.5,
      color: T.muted,
      flexShrink: 1,
    },
    streakBold: { fontFamily: T.bodyBold, color: T.white },
  });
}
