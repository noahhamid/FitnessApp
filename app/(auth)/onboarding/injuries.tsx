import { OnboardingHeader } from "@/src/features/auth/components/OnboardingHeader";
import { OnboardingNav } from "@/src/features/auth/components/OnboardingNav";
import {
  injuryChipImage,
  resolveChipGender,
} from "@/src/features/auth/constants/chip-images";
import { ChipSelect, type ChipOption } from "@/src/ui/components/ChipSelect";
import { useOnboardingColors, useSystemResolvedScheme } from "@/src/ui/tokens";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BASE = [
  { id: "knees", label: "Knees" },
  { id: "back", label: "Back" },
  { id: "shoulders", label: "Shoulders" },
  { id: "wrists", label: "Wrists" },
  { id: "none", label: "None", fullWidth: true },
] as const;

export default function OnboardingInjuriesScreen() {
  const C = useOnboardingColors();
  const resolved = useSystemResolvedScheme();

  const params = useLocalSearchParams<{ gender?: string }>();
  const gender = resolveChipGender(params.gender);
  const [selected, setSelected] = useState<string[]>([]);

  const options = useMemo<ChipOption[]>(
    () =>
      BASE.map((opt) => ({
        ...opt,
        image: injuryChipImage(opt.id, gender),
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
        headline={"ANY PAST OR\nCURRENT INJURIES?"}
        sub="We'll avoid movements that stress these."
        onBack={() => router.back()}
      />

      <View style={s.body}>
        <ChipSelect
          options={options}
          selected={selected}
          onChange={setSelected}
          multiple
          exclusiveId="none"
          columns={2}
          imagePlacement="background"
          imageFit="cover"
        />
      </View>

      <OnboardingNav
        onNext={() =>
          router.push({
            pathname: "/(auth)/onboarding/injuries-transition",
            params: { ...params, injuries: selected.join(",") },
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
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 20,
    minHeight: 0,
  },
});
