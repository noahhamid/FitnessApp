import { OnboardingHeader } from "@/src/features/auth/components/OnboardingHeader";
import { OnboardingNav } from "@/src/features/auth/components/OnboardingNav";
import {
  experienceChipImage,
  resolveChipGender,
} from "@/src/features/auth/constants/chip-images";
import { ChipSelect, type ChipOption } from "@/src/ui/components/ChipSelect";
import { useOnboardingColors, useSystemResolvedScheme } from "@/src/ui/tokens";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BASE = [
  { id: "novice", label: "Novice" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
] as const;

export default function OnboardingExperienceScreen() {
  const C = useOnboardingColors();
  const resolved = useSystemResolvedScheme();

  const params = useLocalSearchParams<{ gender?: string }>();
  const gender = resolveChipGender(params.gender);
  const [selected, setSelected] = useState<string[]>([]);

  const options = useMemo<ChipOption[]>(
    () =>
      BASE.map((opt) => ({
        ...opt,
        image: experienceChipImage(opt.id, gender),
      })),
    [gender],
  );

  return (
    <SafeAreaView
      style={[s.safe, { backgroundColor: C.bg }]}
      edges={["top", "bottom"]}
    >
      <StatusBar barStyle={resolved === "dark" ? "light-content" : "dark-content"} backgroundColor={C.bg} />

      <OnboardingHeader
        headline={"YOUR FITNESS\nLEVEL."}
        sub="We'll match intensity and progression to where you are."
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
        onNext={() =>
          router.push({
            pathname: "/(auth)/onboarding/equipment",
            params: { ...params, experience: selected[0] },
          })
        }
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
