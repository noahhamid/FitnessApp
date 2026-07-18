import { CheckBadge } from "@/src/ui/components/CheckBadge";
import { GoalIcon, GoalIconName } from "@/src/ui/components/GoalIcon";
import {
  ExperienceIcon,
  ExperienceLevel,
} from "@/src/ui/components/ExperienceIcon";
import { FONTS } from "@/src/ui/tokens";
import { api } from "@/src/lib/api";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const C = {
  bg: "#121212",
  card: "#1E1E1E",
  border: "#2A2A2A",
  accent: "#FFC700",
  text: "#FFFFFF",
  muted: "#A0A0A0",
};

const GOAL_LABELS: Record<string, string> = {
  lose: "Lose Fat",
  build: "Build Muscle",
  endure: "Build Endurance",
  health: "Stay Healthy",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  novice: "Novice",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const EQUIPMENT_LABELS: Record<string, string> = {
  full_gym: "Full Gym",
  home_dumbbells: "Home / Dumbbells",
  bodyweight: "Bodyweight Only",
};

export function ReadyScreen() {
  const params = useLocalSearchParams<{
    goalId?: string;
    weightKg?: string;
    heightCm?: string;
    gender?: string;
    daysPerWeek?: string;
    experience?: string;
    equipment?: string;
  }>();

  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(16)).current;
  const badgeScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(rise, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const goalId = params.goalId as GoalIconName | undefined;
  const experience = params.experience as ExperienceLevel | undefined;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.content}>
        <View style={{ flex: 1 }} />

        <Animated.View
          style={{ alignItems: "center", transform: [{ scale: badgeScale }] }}
        >
          <CheckBadge />
        </Animated.View>

        <Animated.View
          style={{
            opacity: fade,
            transform: [{ translateY: rise }],
            marginTop: 24,
          }}
        >
          <Text style={s.kicker}>YOU'RE ALL SET</Text>
          <Text style={s.headline}>PLAN{"\n"}READY.</Text>

          <View style={s.summaryCard}>
            {goalId && (
              <View style={s.summaryRow}>
                <GoalIcon name={goalId} size={40} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={s.rowLabel}>GOAL</Text>
                  <Text style={s.rowValue}>
                    {GOAL_LABELS[goalId] ?? goalId}
                  </Text>
                </View>
              </View>
            )}

            <View style={s.divider} />

            <View style={s.statRow}>
              <View style={s.statBlock}>
                <Text style={s.rowLabel}>GENDER</Text>
                <Text style={s.rowValue}>
                  {params.gender === "male"
                    ? "Male"
                    : params.gender === "female"
                      ? "Female"
                      : "—"}
                </Text>
              </View>
              <View style={s.statBlock}>
                <Text style={s.rowLabel}>WEIGHT</Text>
                <Text style={s.rowValue}>{params.weightKg ?? "—"} kg</Text>
              </View>
              <View style={s.statBlock}>
                <Text style={s.rowLabel}>HEIGHT</Text>
                <Text style={s.rowValue}>{params.heightCm ?? "—"} cm</Text>
              </View>
            </View>

            <View style={s.divider} />

            <View style={s.summaryRow}>
              {experience && <ExperienceIcon level={experience} />}
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={s.rowLabel}>TRAINING</Text>
                <Text style={s.rowValue}>
                  {params.daysPerWeek ?? "—"} days/week ·{" "}
                  {experience ? EXPERIENCE_LABELS[experience] : "—"}
                </Text>
              </View>
            </View>

            <View style={s.divider} />

            <View style={s.summaryRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.rowLabel}>EQUIPMENT</Text>
                <Text style={s.rowValue}>
                  {params.equipment ? EQUIPMENT_LABELS[params.equipment] : "—"}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={{ flex: 1 }} />

        <Pressable
          style={s.primaryBtn}
          onPress={() => router.replace("/(app)/(tabs)")}
        >
          <Text style={s.primaryBtnText}>START TRAINING →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { flex: 1, paddingHorizontal: 24, paddingBottom: 24 },
  kicker: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 3,
    color: C.accent,
    textAlign: "center",
    marginBottom: 8,
  },
  headline: {
    fontFamily: FONTS.black,
    fontSize: 36,
    lineHeight: 38,
    color: C.text,
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 18,
  },
  summaryRow: { flexDirection: "row", alignItems: "center" },
  statRow: { flexDirection: "row", justifyContent: "space-between" },
  statBlock: { alignItems: "flex-start" },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 16 },
  rowLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 1,
    color: C.muted,
    marginBottom: 3,
  },
  rowValue: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: C.text,
  },
  primaryBtn: {
    backgroundColor: C.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  primaryBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: C.bg,
    letterSpacing: 1,
  },
});
