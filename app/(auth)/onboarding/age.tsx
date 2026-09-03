import { OnboardingHeader } from "@/src/features/auth/components/OnboardingHeader";
import { OnboardingNav } from "@/src/features/auth/components/OnboardingNav";
import { NumberWheel } from "@/src/ui/components/NumberWheel";
import { FONTS, type OnboardingColors } from "@/src/ui/tokens";
import { useOnboardingStyles } from "@/src/features/auth/hooks/useOnboardingStyles";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MIN_AGE = 13;
const MAX_AGE = 90;
const DEFAULT_AGE = 25;

export default function OnboardingAgeScreen() {
  const { C, styles: s, resolved } = useOnboardingStyles(makeStyles);

  const params = useLocalSearchParams<{ age?: string }>();
  const savedAge = parseInt(String(params.age ?? ""), 10);
  const hasSavedAge = Number.isFinite(savedAge);
  const [age, setAge] = useState(hasSavedAge ? savedAge : DEFAULT_AGE);
  const [chosen, setChosen] = useState(true);

  const handleAgeChange = (next: number) => {
    setAge(next);
    setChosen(true);
  };

  const handleNext = () => {
    if (!chosen) return;
    router.push({
      pathname: "/(auth)/onboarding/height",
      params: { ...params, age: String(age) },
    });
  };

  return (
    <SafeAreaView
      style={[s.safe, { backgroundColor: C.bg }]}
      edges={["top", "bottom"]}
    >
      <StatusBar barStyle={resolved === "dark" ? "light-content" : "dark-content"} backgroundColor={C.bg} />

      <OnboardingHeader
        headline={"YOUR\nAGE."}
        sub="Age sharpens your recovery and intensity targets."
        onBack={() => router.back()}
      />

      <View style={s.wheelContainer}>
        <NumberWheel
          min={MIN_AGE}
          max={MAX_AGE}
          value={age}
          onChange={handleAgeChange}
          unit="Y.O."
          accessibilityLabel="Age selector"
        />
        <Text style={s.hint}>SCROLL TO ADJUST</Text>
      </View>

      <OnboardingNav nextDisabled={!chosen} onNext={handleNext} />
    </SafeAreaView>
  );
}


function makeStyles(C: OnboardingColors) {
  return StyleSheet.create({
  safe: {
    flex: 1,
    paddingBottom: 12,
    justifyContent: "space-between",
    position: "relative",
  },
  wheelContainer: {
    flex: 1,
    justifyContent: "center",
    zIndex: 1,
    paddingVertical: 24,
  },
  hint: {
    marginTop: 16,
    textAlign: "center",
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 2.5,
    color: C.muted2,
  },
});
}

