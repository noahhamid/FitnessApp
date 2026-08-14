import { OnboardingHeader } from "@/src/features/auth/components/OnboardingHeader";
import { OnboardingNav } from "@/src/features/auth/components/OnboardingNav";
import { bodyIssueChipImage } from "@/src/features/auth/constants/chip-images";
import { ChipSelect, type ChipOption } from "@/src/ui/components/ChipSelect";
import { useOnboardingColors, useSystemResolvedScheme } from "@/src/ui/tokens";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BASE = [
  { id: "sitting", label: "Prolonged sitting" },
  { id: "sleep", label: "Poor sleep quality" },
  { id: "diet", label: "Dietary issues" },
  { id: "none", label: "None — I'm healthy" },
] as const;

export default function OnboardingBodyIssuesScreen() {
  const C = useOnboardingColors();
  const resolved = useSystemResolvedScheme();

  const params = useLocalSearchParams<{ gender?: string }>();
  const [selected, setSelected] = useState<string[]>([]);

  const options = useMemo<ChipOption[]>(
    () =>
      BASE.map((opt) => ({
        ...opt,
        image: bodyIssueChipImage(opt.id),
      })),
    [],
  );

  return (
    <SafeAreaView
      style={[s.safe, { backgroundColor: C.bg }]}
      edges={["top", "bottom"]}
    >
      <StatusBar barStyle={resolved === "dark" ? "light-content" : "dark-content"} backgroundColor={C.bg} />

      <OnboardingHeader
        headline={"ANY OF THESE\nSOUND FAMILIAR?"}
        sub="We'll factor this into your coaching."
        onBack={() => router.back()}
      />

      <View style={s.body}>
        <ChipSelect
          options={options}
          selected={selected}
          onChange={setSelected}
          multiple
          exclusiveId="none"
        />
      </View>

      <OnboardingNav
        onNext={() =>
          router.push({
            pathname: "/(auth)/onboarding/issues-transition",
            params: { ...params, bodyIssues: selected.join(",") },
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
