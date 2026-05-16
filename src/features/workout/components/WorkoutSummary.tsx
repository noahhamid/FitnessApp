import { COLORS, FONTS } from "@/src/theme";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

type Props = {
  durationMin?: number;
  volumeKg?: number;
  exerciseCount?: number;
  setCount?: number;
};

type StatPillProps = {
  label: string;
  value: string;
  unit?: string;
  delay?: number;
};

function StatPill({ label, value, unit, delay = 0 }: StatPillProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 380,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        s.statPill,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={s.statValue}>
        {value}
        {unit ? <Text style={s.statUnit}> {unit}</Text> : null}
      </Text>
      <Text style={s.statLabel}>{label}</Text>
    </Animated.View>
  );
}

export function WorkoutSummary({
  durationMin = 45,
  volumeKg = 8200,
  exerciseCount = 6,
  setCount = 24,
}: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[s.card, { opacity: fadeAnim }]}>
      {/* Header row */}
      <View style={s.header}>
        <View style={s.titleRow}>
          <View style={s.titleAccent} />
          <Text style={s.title}>SESSION SUMMARY</Text>
        </View>
        <View style={s.badge}>
          <Text style={s.badgeText}>✓ DONE</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={s.divider} />

      {/* Stats grid */}
      <View style={s.statsGrid}>
        <StatPill
          label="DURATION"
          value={String(durationMin)}
          unit="min"
          delay={60}
        />
        <StatPill
          label="VOLUME"
          value={volumeKg.toLocaleString()}
          unit="kg"
          delay={120}
        />
        <StatPill label="EXERCISES" value={String(exerciseCount)} delay={180} />
        <StatPill label="SETS" value={String(setCount)} delay={240} />
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    // Depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  titleAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
  title: {
    fontFamily: FONTS.black ?? "BarlowCondensed_900Black",
    color: COLORS.text,
    fontSize: 17,
    letterSpacing: 1.2,
  },
  badge: {
    backgroundColor: COLORS.accent + "22", // 13% opacity tint
    borderWidth: 1,
    borderColor: COLORS.accent + "55",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: FONTS.medium ?? "DMSans_500Medium",
    fontSize: 10,
    color: COLORS.accent,
    letterSpacing: 1.5,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 0,
  },

  // Stats
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 8,
  },
  statPill: {
    flex: 1,
    minWidth: "40%",
    backgroundColor: COLORS.bg2 ?? COLORS.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: "flex-start",
  },
  statValue: {
    fontFamily: FONTS.black ?? "BarlowCondensed_900Black",
    fontSize: 26,
    color: COLORS.text,
    lineHeight: 28,
  },
  statUnit: {
    fontFamily: FONTS.medium ?? "DMSans_500Medium",
    fontSize: 14,
    color: COLORS.muted ?? COLORS.accent,
  },
  statLabel: {
    fontFamily: FONTS.medium ?? "DMSans_500Medium",
    fontSize: 10,
    color: COLORS.muted ?? COLORS.accent,
    letterSpacing: 1.8,
    marginTop: 3,
    opacity: 0.7,
  },
});
