import { OnboardingHeader } from "@/src/features/auth/components/OnboardingHeader";
import { OnboardingNav } from "@/src/features/auth/components/OnboardingNav";
import { NumberWheel } from "@/src/ui/components/NumberWheel";
import { C, FONTS } from "@/src/ui/tokens";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MIN_AGE = 13;
const MAX_AGE = 90;
const DEFAULT_AGE = 25;

export default function OnboardingAgeScreen() {
  const params = useLocalSearchParams();
  const [age, setAge] = useState(DEFAULT_AGE);

  const handleNext = () => {
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
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

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
          onChange={setAge}
          unit="Y.O."
          accessibilityLabel="Age selector"
        />
        <Text style={s.hint}>SCROLL TO ADJUST</Text>
      </View>

      <OnboardingNav onNext={handleNext} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
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
