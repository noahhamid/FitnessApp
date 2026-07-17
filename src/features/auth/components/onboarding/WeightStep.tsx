import { FONTS } from "@/src/ui/tokens";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useOnboardingStore } from "../../store/onboardingStore";

const T = {
  bg: "#0A0A0A",
  card: "#141414",
  border: "#242424",
  accent: "#FF1F4D",
  text: "#FFFFFF",
  muted: "#A8A8A8",
};

export function WeightStep() {
  const { weightKg, weightUnit, setWeight } = useOnboardingStore();
  const [unit, setUnit] = useState<"kg" | "lbs">(weightUnit);
  const [value, setValue] = useState(
    weightKg ? (unit === "kg" ? weightKg.toString() : (weightKg * 2.20462).toFixed(1)) : ""
  );
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  function toggleUnit() {
    const newUnit = unit === "kg" ? "lbs" : "kg";
    if (value) {
      const num = parseFloat(value);
      if (unit === "kg") {
        setValue((num * 2.20462).toFixed(1));
      } else {
        setValue((num / 2.20462).toFixed(1));
      }
    }
    setUnit(newUnit);
  }

  async function handleNext() {
    const num = parseFloat(value);
    if (!num) return;
    
    const weightInKg = unit === "kg" ? num : num / 2.20462;
    setWeight(weightInKg, unit);
    
    // Show "Personalizing" loading state
    setLoading(true);
    
    // Simulate calculation time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Navigate to sign-up/sign-in
    router.push("/(auth)/sign-up");
  }

  const canContinue = value.length > 0 && parseFloat(value) > 0;

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={s.safe}>
        <View style={s.content}>
          {loading ? (
            <View style={s.loadingContainer}>
              <ActivityIndicator size="large" color={T.accent} />
              <Text style={s.loadingTitle}>PERSONALIZING</Text>
              <Text style={s.loadingText}>
                Calculating your targets...
              </Text>
            </View>
          ) : (
            <>
              <View style={s.header}>
                <Text style={s.step}>STEP 7 OF 7</Text>
                <Text style={s.title}>CURRENT{"\n"}WEIGHT</Text>
                <Text style={s.subtitle}>
                  Your starting point. We'll track your progress from here.
                </Text>
              </View>

              <View style={s.inputSection}>
                <View style={[s.inputBox, focused && s.inputBoxFocused]}>
                  <TextInput
                    value={value}
                    onChangeText={setValue}
                    placeholder={unit === "kg" ? "70" : "154"}
                    placeholderTextColor={T.muted}
                    keyboardType="decimal-pad"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={s.input}
                    selectionColor={T.accent}
                  />
                  <Pressable onPress={toggleUnit} style={s.unitButton}>
                    <Text style={s.unitText}>{unit}</Text>
                  </Pressable>
                </View>
              </View>

              <Pressable
                onPress={handleNext}
                disabled={!canContinue}
                style={[s.button, !canContinue && s.buttonDisabled]}
              >
                <Text style={[s.buttonText, !canContinue && s.buttonTextDisabled]}>
                  COMPLETE →
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: "space-between",
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
  inputSection: {
    gap: 16,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.card,
    borderWidth: 2,
    borderColor: T.border,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  inputBoxFocused: {
    borderColor: T.accent,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: T.text,
    padding: 0,
  },
  unitButton: {
    backgroundColor: T.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  unitText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  button: {
    backgroundColor: T.accent,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: T.card,
    borderWidth: 2,
    borderColor: T.border,
  },
  buttonText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    letterSpacing: 1.5,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  buttonTextDisabled: {
    color: T.muted,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  loadingTitle: {
    fontFamily: FONTS.black,
    fontSize: 28,
    color: T.accent,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  loadingText: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: T.muted,
  },
});
