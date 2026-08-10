import { OnboardingHeader } from "@/src/features/auth/components/OnboardingHeader";
import { OnboardingNav } from "@/src/features/auth/components/OnboardingNav";
import { NumberWheel } from "@/src/ui/components/NumberWheel";
import { C, FONTS } from "@/src/ui/tokens";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MIN_KG = 30;
const MAX_KG = 300;

const COPY_BY_GOAL: Record<string, { headline: string; sub: string }> = {
  lose: {
    headline: "YOUR TARGET\nWEIGHT.",
    sub: "What weight are you aiming for?",
  },
  build: {
    headline: "YOUR TARGET\nWEIGHT.",
    sub: "What weight are you aiming for?",
  },
  endure: {
    headline: "A WEIGHT TO\nMAINTAIN.",
    sub: "A healthy weight to hold steady around.",
  },
  health: {
    headline: "A WEIGHT TO\nMAINTAIN.",
    sub: "A healthy weight to hold steady around.",
  },
};

function clampKg(n: number) {
  return Math.max(MIN_KG, Math.min(MAX_KG, Math.round(n)));
}

export default function OnboardingTargetWeightScreen() {
  const params = useLocalSearchParams<{ weightKg?: string; goalId?: string }>();
  const currentKg = clampKg(parseInt(params.weightKg ?? "70", 10) || 70);
  const goalId = params.goalId ?? "health";
  const copy = COPY_BY_GOAL[goalId] ?? COPY_BY_GOAL.health;

  const defaultTarget = clampKg(
    goalId === "lose" ? currentKg - 5 : goalId === "build" ? currentKg + 5 : currentKg,
  );
  const [targetKg, setTargetKg] = useState(defaultTarget);

  const handleNext = () => {
    router.push({
      pathname: "/(auth)/onboarding/pace",
      params: { ...params, targetWeightKg: String(targetKg) },
    });
  };

  return (
    <SafeAreaView
      style={[s.safe, { backgroundColor: C.bg }]}
      edges={["top", "bottom"]}
    >
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <OnboardingHeader
        headline={copy.headline}
        sub={copy.sub}
        onBack={() => router.back()}
      />

      <View style={s.wheelContainer}>
        <NumberWheel
          min={MIN_KG}
          max={MAX_KG}
          value={targetKg}
          onChange={setTargetKg}
          unit="KG"
          accessibilityLabel="Target weight selector"
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
  },
  wheelContainer: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 30,
  },
  hint: {
    marginTop: 20,
    textAlign: "center",
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 2.5,
    color: C.muted2,
  },
});
