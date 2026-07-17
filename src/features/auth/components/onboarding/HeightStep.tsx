import { FONTS } from "@/src/ui/tokens";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { HeroImage } from "../HeroImage";
import { useOnboardingStore } from "../../store/onboardingStore";

const T = {
  bg: "#0A0A0A",
  card: "#141414",
  border: "#242424",
  accent: "#FF1F4D",
  text: "#FFFFFF",
  muted: "#A8A8A8",
};

export function HeightStep() {
  const { heightCm, heightUnit, setHeight } = useOnboardingStore();
  const [unit, setUnit] = useState<"cm" | "ft">(heightUnit);
  const [value, setValue] = useState(
    heightCm ? (unit === "cm" ? heightCm.toString() : (heightCm / 30.48).toFixed(1)) : ""
  );
  const [focused, setFocused] = useState(false);

  function toggleUnit() {
    const newUnit = unit === "cm" ? "ft" : "cm";
    if (value) {
      const num = parseFloat(value);
      if (unit === "cm") {
        setValue((num / 30.48).toFixed(1));
      } else {
        setValue(Math.round(num * 30.48).toString());
      }
    }
    setUnit(newUnit);
  }

  function handleNext() {
    const num = parseFloat(value);
    if (!num) return;
    
    const heightInCm = unit === "cm" ? num : num * 30.48;
    setHeight(heightInCm, unit);
    router.push("/(auth)/onboarding/activity");
  }

  const canContinue = value.length > 0 && parseFloat(value) > 0;

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <HeroImage />
      
      <SafeAreaView style={s.safe}>
        <View style={s.content}>
          <View style={s.header}>
            <Text style={s.step}>STEP 4 OF 7</Text>
            <Text style={s.title}>WHAT'S YOUR{"\n"}HEIGHT?</Text>
            <Text style={s.subtitle}>
              Used for body composition calculations and proper form guidance.
            </Text>
          </View>

          <View style={s.inputSection}>
            <View style={[s.inputBox, focused && s.inputBoxFocused]}>
              <TextInput
                value={value}
                onChangeText={setValue}
                placeholder={unit === "cm" ? "175" : "5.7"}
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
              CONTINUE →
            </Text>
          </Pressable>
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
    paddingTop: 24,
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
});
