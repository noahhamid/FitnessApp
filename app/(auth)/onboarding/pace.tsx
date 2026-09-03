import { OnboardingHeader } from "@/src/features/auth/components/OnboardingHeader";
import { OnboardingNav } from "@/src/features/auth/components/OnboardingNav";
import { paceChipImage } from "@/src/features/auth/constants/chip-images";
import { ChipSelect, type ChipOption } from "@/src/ui/components/ChipSelect";
import { useOnboardingColors, useSystemResolvedScheme } from "@/src/ui/tokens";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PACE_COPY: Record<string, { id: string; label: string; desc: string }[]> = {
  lose: [
    { id: "slow", label: "Slow & Steady", desc: "Smaller weekly change. Longer timeline." },
    { id: "moderate", label: "Moderate", desc: "Balanced weekly change." },
    { id: "aggressive", label: "Aggressive", desc: "Faster weekly change. Shorter timeline." },
  ],
  build: [
    { id: "slow", label: "Slow & Steady", desc: "Smaller weekly change. Longer timeline." },
    { id: "moderate", label: "Moderate", desc: "Balanced weekly change." },
    { id: "aggressive", label: "Aggressive", desc: "Faster weekly change. Shorter timeline." },
  ],
  endure: [
    { id: "slow", label: "Easy Does It", desc: "Smaller weekly change. Longer timeline." },
    { id: "moderate", label: "Balanced", desc: "Balanced weekly change." },
    { id: "aggressive", label: "Push Hard", desc: "Faster weekly change. Shorter timeline." },
  ],
  health: [
    { id: "slow", label: "Easy Does It", desc: "Smaller weekly change. Longer timeline." },
    { id: "moderate", label: "Balanced", desc: "Balanced weekly change." },
    { id: "aggressive", label: "Push Hard", desc: "Faster weekly change. Shorter timeline." },
  ],
};

export default function OnboardingPaceScreen() {
  const C = useOnboardingColors();
  const resolved = useSystemResolvedScheme();

  const params = useLocalSearchParams<{
    goalId?: string;
    gender?: string;
    pace?: string;
  }>();
  const goalId = params.goalId ?? "health";
  const savedPace =
    typeof params.pace === "string" && params.pace.length > 0
      ? params.pace
      : null;
  const [selected, setSelected] = useState<string[]>(
    savedPace ? [savedPace] : [],
  );

  const options = useMemo<ChipOption[]>(() => {
    const base = PACE_COPY[goalId] ?? PACE_COPY.health;
    return base.map((opt) => ({
      ...opt,
      image: paceChipImage(opt.id),
    }));
  }, [goalId]);

  return (
    <SafeAreaView
      style={[s.safe, { backgroundColor: C.bg }]}
      edges={["top", "bottom"]}
    >
      <StatusBar barStyle={resolved === "dark" ? "light-content" : "dark-content"} backgroundColor={C.bg} />

      <OnboardingHeader
        headline={"YOUR\nPACE."}
        sub="How fast the plan moves your weight — not how hard each session feels."
        onBack={() => router.back()}
      />

      <View style={s.body}>
        <ChipSelect
          options={options}
          selected={selected}
          onChange={setSelected}
          imageEmphasis="low"
        />
      </View>

      <OnboardingNav
        nextDisabled={selected.length === 0}
        onNext={() => {
          if (!selected[0]) return;
          router.push({
            pathname: "/(auth)/onboarding/predicted-date",
            params: { ...params, pace: selected[0] },
          });
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    paddingBottom: 12,
    justifyContent: "space-between",
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 20,
    minHeight: 0,
  },
});
