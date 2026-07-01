import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ── Design Tokens — "Muscle Monster" ────────────────────────────────────────
const T = {
  bg0: "#121212", // Deep matte charcoal — screen background
  bg2: "#1E1E1E", // Card / block surface
  bg3: "#282828", // Elevated stat block
  gold: "#FFC700", // Primary accent — badge, key stats, CTA
  goldDim: "#3A320A", // Gold-tinted wash for PR card border/bg
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#5A5A5A",
};

export type PersonalRecord = {
  exercise: string;
  detail: string; // e.g. "100kg × 5 — up from 92.5kg"
};

type Props = {
  workoutName?: string;
  timestamp?: string; // e.g. "Today at 7:30 PM"
  durationMin?: number;
  volumeKg?: number;
  setCount?: number;
  personalRecords?: PersonalRecord[];
  onDone?: () => void;
};

type BigStatProps = {
  value: string;
  unit: string;
  label: string;
  delay?: number;
};

// ── Big stat block ───────────────────────────────────────────────────────────
function BigStat({ value, unit, label, delay = 0 }: BigStatProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        s.bigStat,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={s.bigStatValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
        <Text style={s.bigStatUnit}> {unit}</Text>
      </Text>
      <Text style={s.bigStatLabel}>{label}</Text>
    </Animated.View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function WorkoutSummary({
  workoutName = "Push Day",
  timestamp = "Today at 7:30 PM",
  durationMin = 45,
  volumeKg = 8200,
  setCount = 24,
  personalRecords = [],
  onDone,
}: Props) {
  const badgeScale = useRef(new Animated.Value(0.4)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const prFade = useRef(new Animated.Value(0)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(badgeScale, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(badgeOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(prFade, {
      toValue: 1,
      duration: 400,
      delay: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDonePressIn = () =>
    Animated.spring(ctaScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  const handleDonePressOut = () =>
    Animated.spring(ctaScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();

  const volFormatted = volumeKg.toLocaleString();

  return (
    <View style={s.screen}>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Victory header ── */}
        <View style={s.victoryHeader}>
          <Animated.View
            style={[
              s.badgeCircle,
              {
                opacity: badgeOpacity,
                transform: [{ scale: badgeScale }],
              },
            ]}
          >
            <Ionicons name="trophy" size={30} color={T.bg0} />
          </Animated.View>

          <Animated.View style={{ opacity: headerFade, alignItems: "center" }}>
            <Text style={s.victoryTitle}>WORKOUT COMPLETE</Text>
            <Text style={s.workoutName}>{workoutName}</Text>
            <Text style={s.timestamp}>{timestamp}</Text>
          </Animated.View>
        </View>

        {/* ── Big stats grid ── */}
        <View style={s.statsGrid}>
          <BigStat
            value={String(durationMin)}
            unit="min"
            label="DURATION"
            delay={80}
          />
          <BigStat
            value={volFormatted}
            unit="kg"
            label="TOTAL VOLUME"
            delay={160}
          />
          <BigStat
            value={String(setCount)}
            unit="sets"
            label="COMPLETED"
            delay={240}
          />
        </View>

        {/* ── PR / Achievements showcase ── */}
        {personalRecords.length > 0 && (
          <Animated.View style={[s.prCard, { opacity: prFade }]}>
            <View style={s.prHeader}>
              <Ionicons name="flame" size={16} color={T.gold} />
              <Text style={s.prHeaderText}>NEW PERSONAL RECORDS</Text>
            </View>

            {personalRecords.map((pr, i) => (
              <View
                key={`${pr.exercise}-${i}`}
                style={[
                  s.prRow,
                  i === personalRecords.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <Text style={s.prExercise}>{pr.exercise}</Text>
                <Text style={s.prDetail}>{pr.detail}</Text>
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {/* ── Commanding CTA ── */}
      <View style={s.ctaWrap}>
        <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
          <TouchableOpacity
            onPress={onDone}
            onPressIn={handleDonePressIn}
            onPressOut={handleDonePressOut}
            style={s.ctaBtn}
            activeOpacity={1}
          >
            <Text style={s.ctaText}>BACK TO DASHBOARD</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: T.bg0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
    gap: 22,
  },

  // Victory header
  victoryHeader: {
    alignItems: "center",
    gap: 14,
  },
  badgeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: T.gold,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: T.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  victoryTitle: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 24,
    color: T.text,
    letterSpacing: 2,
    textAlign: "center",
  },
  workoutName: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 16,
    color: T.gold,
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: "center",
  },
  timestamp: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.sub,
    marginTop: 2,
    textAlign: "center",
  },

  // Big stats grid
  statsGrid: {
    flexDirection: "row",
    backgroundColor: T.bg2,
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 10,
  },
  bigStat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  bigStatValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 32,
    color: T.text,
    letterSpacing: -0.5,
  },
  bigStatUnit: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: T.sub,
  },
  bigStatLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
    letterSpacing: 1.5,
    marginTop: 2,
  },

  // PR showcase
  prCard: {
    backgroundColor: T.bg2,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: T.goldDim, // Subtle gold tint, not a loud outline
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  prHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10,
  },
  prHeaderText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.gold,
    letterSpacing: 1.8,
  },
  prRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.bg3,
  },
  prExercise: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 16,
    color: T.text,
  },
  prDetail: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.sub,
    marginTop: 2,
  },

  // Commanding CTA
  ctaWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: T.bg0,
  },
  ctaBtn: {
    backgroundColor: T.gold,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: T.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  ctaText: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 17,
    color: T.bg0, // Thick dark type on gold — max contrast, feels definitive
    letterSpacing: 2,
  },
});
