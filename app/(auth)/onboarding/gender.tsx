import { GoalTile } from "@/src/ui/components/GoalTile";
import { OnboardingHeader } from "@/src/features/auth/components/OnboardingHeader";
import { OnboardingNav } from "@/src/features/auth/components/OnboardingNav";
import { useOnboardingColors, useSystemResolvedScheme } from "@/src/ui/tokens";
import { clearOnboardingDraft } from "@/src/features/auth/services/onboarding-draft.service";
import { isOnboardingRetake } from "@/src/features/auth/services/onboarding-payload.service";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type GenderOption = "male" | "female";

const GENDERS: {
  id: GenderOption;
  label: string;
  image: number;
}[] = [
  {
    id: "male",
    label: "MALE",
    image: require("@/assets/images/gendermale.jpg"),
  },
  {
    id: "female",
    label: "FEMALE",
    image: require("@/assets/images/genderfemale.jpg"),
  },
];

export default function OnboardingGenderScreen() {
  const C = useOnboardingColors();
  const resolved = useSystemResolvedScheme();

  const params = useLocalSearchParams();
  const isRetake = isOnboardingRetake(params);
  const genderParam = Array.isArray(params.gender)
    ? params.gender[0]
    : params.gender;
  const [selectedGender, setSelectedGender] = useState<GenderOption | null>(
    genderParam === "male" || genderParam === "female" ? genderParam : null,
  );

  const handleNext = () => {
    if (!selectedGender) return;
    router.push({
      pathname: "/(auth)/onboarding/goals",
      params: { ...params, gender: selectedGender },
    });
  };

  return (
    <SafeAreaView
      style={[s.safe, { backgroundColor: C.bg }]}
      edges={["top", "bottom"]}
    >
      <StatusBar barStyle={resolved === "dark" ? "light-content" : "dark-content"} backgroundColor={C.bg} />

      <OnboardingHeader
        headline={"YOUR\nGENDER."}
        sub="This helps us calibrate your baseline metrics."
        onBack={() => {
          if (isRetake) {
            void clearOnboardingDraft();
            router.replace("/(app)/(tabs)/profile");
            return;
          }
          router.back();
        }}
      />

      <View style={s.quadrantsContainer} accessibilityRole="radiogroup">
        <View style={s.gridRow}>
          {GENDERS.map((g) => (
            <GoalTile
              key={g.id}
              image={g.image}
              title={g.label}
              isSelected={selectedGender === g.id}
              onPress={() => setSelectedGender(g.id)}
              flipX={g.id === "male"}
              style={s.tile}
            />
          ))}
        </View>
      </View>

      <OnboardingNav nextDisabled={!selectedGender} onNext={handleNext} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    paddingBottom: 12,
    justifyContent: "space-between",
    position: "relative",
  },
  quadrantsContainer: {
    flex: 1,
    justifyContent: "center",
    zIndex: 1,
    paddingHorizontal: 12,
    paddingBottom: 30,
  },
  gridRow: {
    height: "50%",
    flexDirection: "row",
    
    transform: [{ translateY: -40 }],
  },
  tile: {
    flex: 1,
  },
});
