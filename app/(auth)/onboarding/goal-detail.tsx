import { OnboardingHeader } from "@/src/features/auth/components/OnboardingHeader";
import { OnboardingNav } from "@/src/features/auth/components/OnboardingNav";
import {
  goalDetailChipImage,
  resolveChipGender,
} from "@/src/features/auth/constants/chip-images";
import { ChipSelect, type ChipOption } from "@/src/ui/components/ChipSelect";
import { C } from "@/src/ui/tokens";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DETAILS_BY_GOAL: Record<string, { id: string; label: string }[]> = {
  lose: [
    { id: "steady", label: "Lose weight steadily" },
    { id: "tone", label: "Tone up / recomposition" },
    { id: "aggressive_cut", label: "Aggressive cut" },
  ],
  build: [
    { id: "bulk", label: "Bulk up" },
    { id: "lean_muscle", label: "Lean muscle" },
    { id: "strength", label: "Strength focus" },
  ],
  endure: [
    { id: "stamina", label: "Improve stamina" },
    { id: "event", label: "Train for an event" },
    { id: "conditioning", label: "General conditioning" },
  ],
  health: [
    { id: "wellness", label: "General wellness" },
    { id: "energy", label: "More energy" },
    { id: "habit", label: "Build the habit" },
  ],
};

export default function OnboardingGoalDetailScreen() {
  const params = useLocalSearchParams<{ goalId?: string; gender?: string }>();
  const goalId = params.goalId ?? "health";
  const gender = resolveChipGender(params.gender);
  const [selected, setSelected] = useState<string[]>([]);

  const options = useMemo<ChipOption[]>(() => {
    const base = DETAILS_BY_GOAL[goalId] ?? DETAILS_BY_GOAL.health;
    return base.map((opt) => ({
      ...opt,
      image: goalDetailChipImage(opt.id, gender),
    }));
  }, [goalId, gender]);

  return (
    <SafeAreaView
      style={[s.safe, { backgroundColor: C.bg }]}
      edges={["top", "bottom"]}
    >
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <OnboardingHeader
        headline={"GET MORE\nSPECIFIC."}
        sub="Pick what matters most within your goal."
        onBack={() => router.back()}
      />

      <View style={s.body}>
        <ChipSelect options={options} selected={selected} onChange={setSelected} />
      </View>

      <OnboardingNav
        onNext={() =>
          router.push({
            pathname: "/(auth)/onboarding/focus-areas",
            params: { ...params, goalDetail: selected[0] ?? "" },
          })
        }
        nextDisabled={selected.length === 0}
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
    paddingTop: 20,
    paddingBottom: 20,
    minHeight: 0,
  },
});
