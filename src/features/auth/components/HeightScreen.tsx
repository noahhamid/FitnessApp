import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, SafeAreaView } from "react-native";
import { RulerSlider } from "@/src/ui/components/RulerSlider";
import { HeightSilhouette } from "@/src/ui/components/HeightSilhouette";

// Replace with your actual token import
const T = {
  canvas: "#0D0C0B",
  card: "#161412",
  gold: "#D4AF37",
  goldDim: "#8A7530",
  goldBorder: "rgba(212, 175, 55, 0.25)",
};

const MIN_CM = 120;
const MAX_CM = 220;

function cmToFtIn(cm: number) {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inch = Math.round(totalInches % 12);
  return { ft, inch };
}

interface HeightScreenProps {
  onContinue: (heightCm: number) => void;
}

export default function HeightScreen({ onContinue }: HeightScreenProps) {
  const [heightCm, setHeightCm] = useState(170);
  const [unit, setUnit] = useState<"cm" | "ft">("cm");

  const { ft, inch } = cmToFtIn(heightCm);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>ABOUT YOU</Text>
        <Text style={styles.title}>How tall are you?</Text>
        <Text style={styles.subtitle}>
          We'll use this to calculate your baseline metrics.
        </Text>
      </View>

      <View style={styles.visualRow}>
        <View style={styles.readoutBlock}>
          <View style={styles.readoutRow}>
            {unit === "cm" ? (
              <>
                <Text style={styles.readoutNumber}>{heightCm}</Text>
                <Text style={styles.readoutUnit}>cm</Text>
              </>
            ) : (
              <>
                <Text style={styles.readoutNumber}>{ft}</Text>
                <Text style={styles.readoutUnit}>ft</Text>
                <Text style={[styles.readoutNumber, { marginLeft: 12 }]}>
                  {inch}
                </Text>
                <Text style={styles.readoutUnit}>in</Text>
              </>
            )}
          </View>

          <Pressable
            onPress={() => setUnit(unit === "cm" ? "ft" : "cm")}
            style={styles.unitToggle}
          >
            <Text style={styles.unitToggleText}>
              Switch to {unit === "cm" ? "ft/in" : "cm"}
            </Text>
          </Pressable>
        </View>

        <HeightSilhouette heightCm={heightCm} min={MIN_CM} max={MAX_CM} />
      </View>

      <RulerSlider
        min={MIN_CM}
        max={MAX_CM}
        step={1}
        value={heightCm}
        onChange={setHeightCm}
        unitLabel="height in centimeters"
      />

      <Pressable
        style={styles.continueButton}
        onPress={() => onContinue(heightCm)}
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
    fontSize: 36,
    color: "#FFFFFF",
    lineHeight: 38,
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
    alignItems: "flex-end",
    marginVertical: 32,
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
    fontSize: 84,
    color: T.gold,
    lineHeight: 84,
  },
  readoutUnit: {
    fontFamily: "DMSans_500Medium",
    fontSize: 20,
    color: "rgba(255,255,255,0.5)",
    marginLeft: 6,
    marginBottom: 12,
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
