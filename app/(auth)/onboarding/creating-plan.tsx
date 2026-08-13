import { FONTS, useOnboardingColors, type OnboardingColors } from "@/src/ui/tokens";
import { useOnboardingStyles } from "@/src/features/auth/hooks/useOnboardingStyles";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STAGES = [
  "Analyzing your goals...",
  "Building your split...",
  "Calibrating your nutrition...",
  "Finishing touches...",
];

const STAGE_DURATION_MS = 650;

export default function CreatingPlanScreen() {
  const { C, styles: s, resolved } = useOnboardingStyles(makeStyles);

  const params = useLocalSearchParams();
  const [stageIndex, setStageIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((i) => {
        if (i >= STAGES.length - 1) return i;
        Animated.sequence([
          Animated.timing(fade, { toValue: 0, duration: 120, useNativeDriver: true }),
          Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }),
        ]).start();
        return i + 1;
      });
    }, STAGE_DURATION_MS);

    const timeout = setTimeout(() => {
      router.replace({ pathname: "/(auth)/onboarding/ready", params });
    }, STAGE_DURATION_MS * STAGES.length);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // Runs once on mount — params are captured at entry, not re-triggered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle={resolved === "dark" ? "light-content" : "dark-content"} backgroundColor={C.bg} />
      <View style={s.content}>
        <ActivityIndicator size="large" color={C.accent} />
        <Animated.Text style={[s.stage, { opacity: fade }]}>
          {STAGES[stageIndex]}
        </Animated.Text>
      </View>
    </SafeAreaView>
  );
}


function makeStyles(C: OnboardingColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 20,
  },
  stage: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    letterSpacing: 0.5,
    color: C.text,
    textAlign: "center",
  },
});
}

