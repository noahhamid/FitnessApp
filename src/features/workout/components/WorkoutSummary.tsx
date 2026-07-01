import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg0: "#121212",
  bg2: "#1E1E1E", // Card surface
  bg3: "#252525", // Stat pill surface
  gold: "#FFC700", // Primary accent
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#5A5A5A",
};

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

// ── Stat pill ─────────────────────────────────────────────────────────────────
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
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
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

// ── Main ──────────────────────────────────────────────────────────────────────
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
      {/* Header */}
      <View style={s.header}>
        <View style={s.titleRow}>
          <View style={s.titleAccent} />
          <Text style={s.title}>SESSION SUMMARY</Text>
        </View>

        {/* Done badge — solid gold */}
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

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Outer card — no border, no colored shadow
  card: {
    borderRadius: 20,
    backgroundColor: T.bg2,
    overflow: "hidden",
  },

  // Header
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
    backgroundColor: T.gold, // Gold accent bar
  },
  title: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 18,
    color: T.text,
    letterSpacing: 1.5,
  },

  // Done badge — solid gold fill, dark text
  badge: {
    backgroundColor: T.gold,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    color: T.bg0, // Dark text on gold — max contrast
    letterSpacing: 1.5,
  },

  // Thin divider
  divider: {
    height: 1,
    backgroundColor: T.bg3, // Subtle — same family as card
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
    backgroundColor: T.bg3, // #252525 — one step darker than card
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: "flex-start",
    // No border
  },
  statValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 30, // Bigger hero number
    color: T.text,
    lineHeight: 32,
  },
  statUnit: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: T.sub,
  },
  statLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
    letterSpacing: 1.8,
    marginTop: 4,
  },
});
