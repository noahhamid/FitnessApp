import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, SafeAreaView } from "react-native";
import { RulerSlider } from "@/src/ui/components/RulerSlider";
import { WeightScale } from "@/src/ui/components/WeightScale";

const T = {
  canvas: "#0D0C0B",
  card: "#161412",
  gold: "#D4AF37",
  goldDim: "#8A7530",
  goldBorder: "rgba(212, 175, 55, 0.25)",
};

const MIN_KG = 35;
const MAX_KG = 180;

function kgToLb(kg: number) {
  return Math.round(kg * 2.20462);
}

interface WeightScreenProps {
  onContinue: (weightKg: number) => void;
}

export default function WeightScreen({ onContinue }: WeightScreenProps) {
  const [weightKg, setWeightKg] = useState(70);
  const [unit, setUnit] = useState<"kg" | "lb">("kg");

  const displayValue = unit === "kg" ? weightKg : kgToLb(weightKg);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>ABOUT YOU</Text>
        <Text style={styles.title}>What's your current weight?</Text>
        <Text style={styles.subtitle}>
          This is your starting point — you'll log changes as you progress.
        </Text>
      </View>

      <View style={styles.visualRow}>
        <View style={styles.readoutBlock}>
          <View style={styles.readoutRow}>
            <Text style={styles.readoutNumber}>{displayValue}</Text>
            <Text style={styles.readoutUnit}>{unit}</Text>
          </View>

          <Pressable
            onPress={() => setUnit(unit === "kg" ? "lb" : "kg")}
            style={styles.unitToggle}
          >
            <Text style={styles.unitToggleText}>
              Switch to {unit === "kg" ? "lb" : "kg"}
            </Text>
          </Pressable>
        </View>

        <WeightScale weightKg={weightKg} min={MIN_KG} max={MAX_KG} size={180} />
      </View>

      <RulerSlider
        min={MIN_KG}
        max={MAX_KG}
        step={1}
        value={weightKg}
        onChange={setWeightKg}
        unitLabel="weight in kilograms"
      />

      <Pressable
        style={styles.continueButton}
        onPress={() => onContinue(weightKg)}
      >
        <Text style={styles.continueText}>Continue</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: T.canvas,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  header: {
    marginTop: 24,
  },
  eyebrow: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
    letterSpacing: 2,
    color: T.goldDim,
    marginBottom: 8,
  },
  title: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 32,
    color: "#FFFFFF",
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginTop: 8,
  },
  visualRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 24,
  },
  readoutBlock: {
    flex: 1,
  },
  readoutRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  readoutNumber: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 72,
    color: T.gold,
    lineHeight: 72,
  },
  readoutUnit: {
    fontFamily: "DMSans_500Medium",
    fontSize: 20,
    color: "rgba(255,255,255,0.5)",
    marginLeft: 6,
    marginBottom: 10,
  },
  unitToggle: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.goldBorder,
  },
  unitToggleText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: T.goldDim,
  },
  continueButton: {
    backgroundColor: T.gold,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 24,
  },
  continueText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 16,
    color: T.canvas,
  },
});
