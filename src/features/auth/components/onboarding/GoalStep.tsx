import { FONTS } from "@/src/ui/tokens";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useOnboardingStore, type Goal } from "../../store/onboardingStore";
import { HeroImage } from "../HeroImage";

const T = {
  bg: "#0A0A0A",
  card: "#141414",
  border: "#242424",
  accent: "#FF1F4D",
  accentDim: "#FF1F4D33",
  text: "#FFFFFF",
  muted: "#A8A8A8",
};

const GOALS: { id: Goal; label: string; sub: string }[] = [
  { id: "lose", label: "Lose Weight", sub: "Burn fat, cut calories"},
  { id: "build", label: "Build Muscle", sub: "Strength & hypertrophy"},
  { id: "endure", label: "Endurance", sub: "Cardio & stamina"},
  { id: "health", label: "Stay Healthy", sub: "Balanced lifestyle"},
];

export function GoalStep() {
  const { goal, setGoal } = useOnboardingStore();
  const [selected, setSelected] = useState<Goal | null>(goal);
 
  function handleSelect(g: Goal) {
    setSelected(g);
    setGoal(g);
    setTimeout(() => {
      router.push("/(auth)/onboarding/age");
    }, 300);
  }

  return (
    <View style={s.container}>
      <HeroImage />
      
      <SafeAreaView style={s.safe}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.header}>
            <Text style={s.step}>STEP 2 OF 7</Text>
            <Text style={s.title}>WHAT'S YOUR{"\n"}MAIN GOAL?</Text>
            <Text style={s.subtitle}>
              We'll tailor your plan around this. You can always change it later.
            </Text>
          </View>

          <View style={s.grid}>
            {GOALS.map((g) => (
              <Pressable
                key={g.id}
                onPress={() => handleSelect(g.id)}
                style={[
                  s.card,
                  selected === g.id && s.cardSelected,
                ]}
              >
                <Text style={[s.label, selected === g.id && s.labelSelected]}>
                  {g.label}
                </Text>
                <Text style={s.sub}>{g.sub}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 32,
  },
  header: {
    gap: 12,
  },
  step: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 2,
    color: T.muted,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: FONTS.black,
    fontSize: 42,
    lineHeight: 46,
    color: T.accent,
    letterSpacing: -1,
    textTransform: "uppercase",
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
    color: T.muted,
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: T.card,
    borderWidth: 2,
    borderColor: T.border,
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 8,
  },
  cardSelected: {
    borderColor: T.accent,
    backgroundColor: T.accentDim,
  },
  icon: {
    fontSize: 32,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: T.text,
    letterSpacing: 0.5,
  },
  labelSelected: {
    color: T.accent,
  },
  sub: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: T.muted,
  },
});
