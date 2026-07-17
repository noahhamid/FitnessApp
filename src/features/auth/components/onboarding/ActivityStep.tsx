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
import { useOnboardingStore, type ActivityLevel } from "../../store/onboardingStore";

const T = {
  bg: "#0A0A0A",
  card: "#141414",
  border: "#242424",
  accent: "#FF1F4D",
  accentDim: "#FF1F4D33",
  text: "#FFFFFF",
  muted: "#A8A8A8",
};

const LEVELS: { id: ActivityLevel; label: string; desc: string }[] = [
  { id: "sedentary", label: "Sedentary", desc: "Little to no exercise" },
  { id: "light", label: "Light", desc: "Exercise 1-3 days/week" },
  { id: "moderate", label: "Moderate", desc: "Exercise 3-5 days/week" },
  { id: "active", label: "Active", desc: "Exercise 6-7 days/week" },
  { id: "veryActive", label: "Very Active", desc: "Physical job + daily exercise" },
];

export function ActivityStep() {
  const { activityLevel, setActivityLevel } = useOnboardingStore();
  const [selected, setSelected] = useState<ActivityLevel | null>(activityLevel);

  function handleSelect(level: ActivityLevel) {
    setSelected(level);
    setActivityLevel(level);
    setTimeout(() => {
      router.push("/(auth)/onboarding/fitness");
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
            <Text style={s.step}>STEP 5 OF 7</Text>
            <Text style={s.title}>ACTIVITY{"\n"}LEVEL</Text>
            <Text style={s.subtitle}>
              How often do you currently exercise or stay active throughout the week?
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
                <Text style={[s.label, selected === level.id && s.labelSelected]}>
                  {level.label}
                </Text>
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
    gap: 12,
  },
  card: {
    backgroundColor: T.card,
    borderWidth: 2,
    borderColor: T.border,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 4,
  },
  cardSelected: {
    borderColor: T.accent,
    backgroundColor: T.accentDim,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: T.text,
    letterSpacing: 0.5,
  },
  labelSelected: {
    color: T.accent,
  },
  desc: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: T.muted,
  },
});
