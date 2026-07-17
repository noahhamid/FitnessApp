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
import { HeroImage } from "../HeroImage";
import { useOnboardingStore, type FitnessLevel } from "../../store/onboardingStore";

const T = {
  bg: "#0A0A0A",
  card: "#141414",
  border: "#242424",
  accent: "#FF1F4D",
  accentDim: "#FF1F4D33",
  text: "#FFFFFF",
  muted: "#A8A8A8",
};

const LEVELS: { id: FitnessLevel; label: string; desc: string; icon: string }[] = [
  {
    id: "beginner",
    label: "Beginner",
    desc: "New to fitness or getting back after a break",
    icon: "○",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    desc: "Consistent training for 6+ months",
    icon: "◐",
  },
  {
    id: "advanced",
    label: "Advanced",
    desc: "Training consistently for years, know your limits",
    icon: "●",
  },
];

export function FitnessStep() {
  const { fitnessLevel, setFitnessLevel } = useOnboardingStore();
  const [selected, setSelected] = useState<FitnessLevel | null>(fitnessLevel);

  function handleSelect(level: FitnessLevel) {
    setSelected(level);
    setFitnessLevel(level);
    setTimeout(() => {
      router.push("/(auth)/onboarding/weight");
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
            <Text style={s.step}>STEP 6 OF 7</Text>
            <Text style={s.title}>FITNESS{"\n"}LEVEL</Text>
            <Text style={s.subtitle}>
              This helps us set appropriate workout intensity and progression speed.
            </Text>
          </View>

          <View style={s.options}>
            {LEVELS.map((level) => (
              <Pressable
                key={level.id}
                onPress={() => handleSelect(level.id)}
                style={[
                  s.card,
                  selected === level.id && s.cardSelected,
                ]}
              >
                <View style={s.cardHeader}>
                  <Text style={s.icon}>{level.icon}</Text>
                  <Text style={[s.label, selected === level.id && s.labelSelected]}>
                    {level.label}
                  </Text>
                </View>
                <Text style={s.desc}>{level.desc}</Text>
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
  options: {
    gap: 16,
  },
  card: {
    backgroundColor: T.card,
    borderWidth: 2,
    borderColor: T.border,
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 12,
  },
  cardSelected: {
    borderColor: T.accent,
    backgroundColor: T.accentDim,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    fontSize: 24,
    color: T.text,
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
  desc: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: T.muted,
    lineHeight: 20,
  },
});
