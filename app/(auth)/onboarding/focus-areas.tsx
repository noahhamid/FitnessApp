import { OnboardingHeader } from "@/src/features/auth/components/OnboardingHeader";
import { OnboardingNav } from "@/src/features/auth/components/OnboardingNav";
import {
  focusChipImage,
  resolveChipGender,
} from "@/src/features/auth/constants/chip-images";
import { ChipSelect, type ChipOption } from "@/src/ui/components/ChipSelect";
import { useOnboardingColors, useSystemResolvedScheme } from "@/src/ui/tokens";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BASE = [
  { id: "chest", label: "Chest" },
  { id: "back", label: "Back" },
  { id: "arms", label: "Arms" },
  { id: "abs", label: "Abs" },
  { id: "glutes", label: "Glutes" },
  { id: "legs", label: "Legs" },
  { id: "full_body", label: "Full Body", fullWidth: true },
] as const;

export default function OnboardingFocusAreasScreen() {
  const C = useOnboardingColors();
  const resolved = useSystemResolvedScheme();

  const params = useLocalSearchParams<{ gender?: string }>();
  const gender = resolveChipGender(params.gender);
  const [selected, setSelected] = useState<string[]>([]);

  const options = useMemo<ChipOption[]>(
    () =>
      BASE.map((opt) => ({
        ...opt,
        image: focusChipImage(opt.id, gender),
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
        headline={"WHERE TO\nFOCUS."}
        sub="Pick as many as you like — we'll add extra volume there."
        onBack={() => router.back()}
      />

      <View style={s.body}>
        <ChipSelect
          options={options}
          selected={selected}
          onChange={setSelected}
          multiple
          selectAllId="full_body"
          columns={2}
        />
      </View>

      <OnboardingNav
        onNext={() =>
          router.push({
            pathname: "/(auth)/onboarding/focus-transition",
            params: { ...params, focusAreas: selected.join(",") },
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
    paddingTop: 4,
    paddingBottom: 20,
    minHeight: 0,
  },
});
