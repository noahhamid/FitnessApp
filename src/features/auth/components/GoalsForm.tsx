import { Button } from "@/src/ui/components/Button";
import { ProgressDots } from "@/src/ui/components/ProgressDots";
import { C, FONTS } from "@/src/ui/tokens";
import { useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SW } = Dimensions.get("window");

// Fixed: onNext now passes goalId to the route so it can be stored
type Props = { onNext: (goalId: string) => void };

const GOALS = [
  {
    id: "lose",
    label: "Lose Weight",
    sub: "Burn fat, cut calories",
    icon: "🔥",
  },
  {
    id: "build",
    label: "Build Muscle",
    sub: "Strength & hypertrophy",
    icon: "💪",
  },
  {
    id: "endure",
    label: "Endurance",
    sub: "Cardio & stamina",
    icon: "🏃",
  },
  {
    id: "health",
    label: "Stay Healthy",
    sub: "Balanced lifestyle",
    icon: "❤️",
  },
];

const CARD_W = (SW - 64 - 12) / 2;

export function GoalsForm({ onNext }: Props) {
  const [goal, setGoal] = useState<string | null>(null);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.counter}>STEP 1 OF 2</Text>
          <ProgressDots total={2} current={0} />
          <Text style={s.headline}>WHAT'S YOUR{"\n"}MAIN GOAL?</Text>
          <Text style={s.sub}>
            We'll tailor your plan around this. You can always change it later.
          </Text>
        </View>

        {/* Goal grid */}
        <View style={s.goalGrid}>
          {GOALS.map((g) => (
            <TouchableOpacity
              key={g.id}
              onPress={() => setGoal(g.id)}
              activeOpacity={0.8}
              style={[s.goalCard, goal === g.id && s.goalCardActive]}
            >
              <View style={[s.iconWrap, goal === g.id && s.iconWrapActive]}>
                <Text style={s.goalIcon}>{g.icon}</Text>
              </View>
              <Text style={[s.goalLabel, goal === g.id && s.goalLabelActive]}>
                {g.label}
              </Text>
              <Text style={[s.goalSub, goal === g.id && s.goalSubActive]}>
                {g.sub}
              </Text>

              {/* Active check indicator */}
              {goal === g.id && (
                <View style={s.checkDot}>
                  <Text style={s.checkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Button
          disabled={!goal}
          onPress={() => goal && onNext(goal)}
          style={{ marginTop: 32 }}
        >
          CONTINUE →
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: {
    paddingHorizontal: 32,
    paddingTop: 52,
    paddingBottom: 48,
    flexGrow: 1,
  },
  header: { marginBottom: 28 },
  counter: {
    color: C.muted,
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: FONTS.bold,
    marginBottom: 8,
  },
  headline: {
    fontFamily: FONTS.black,
    fontSize: 36,
    color: C.text,
    lineHeight: 38,
    letterSpacing: -0.5,
    marginTop: 16,
    marginBottom: 10,
  },
  sub: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: C.muted,
    lineHeight: 21,
  },
  goalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  goalCard: {
    width: CARD_W,
    backgroundColor: C.bg3,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 20,
    padding: 18,
    position: "relative",
    minHeight: 140,
  },
  goalCardActive: {
    borderColor: C.accent,
    backgroundColor: `${C.accent}12`,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  iconWrapActive: {
    backgroundColor: `${C.accent}20`,
    borderColor: `${C.accent}40`,
  },
  goalIcon: { fontSize: 24 },
  goalLabel: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: C.text,
    marginBottom: 4,
  },
  goalLabelActive: { color: C.accent },
  goalSub: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: C.muted,
    lineHeight: 15,
  },
  goalSubActive: { color: `${C.accent}99` },
  checkDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: { fontSize: 11, color: C.bg, fontFamily: FONTS.bold },
});
