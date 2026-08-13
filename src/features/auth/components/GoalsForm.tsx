import { GoalTile } from "@/src/ui/components/GoalTile";
import { OnboardingHeader } from "@/src/features/auth/components/OnboardingHeader";
import { OnboardingNav } from "@/src/features/auth/components/OnboardingNav";
import { OnboardingSafeScreen } from "@/src/features/auth/components/OnboardingSafeScreen";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

const GOALS = [
  {
    id: "lose",
    image: require("@/assets/images/losefat.jpg"),
    title: "Lose Fat",
  },
  {
    id: "build",
    image: require("@/assets/images/buildmuscle.jpg"),
    title: "Build Muscle",
  },
  {
    id: "endure",
    image: require("@/assets/images/buildendurance.jpg"),
    title: "Build Endurance",
  },
  {
    id: "health",
    image: require("@/assets/images/stayhealthy.jpg"),
    title: "Stay Healthy",
  },
];

export function GoalsForm() {
  const params = useLocalSearchParams();
  const goalFromParams = Array.isArray(params.goalId)
    ? params.goalId[0]
    : params.goalId;
  const [selected, setSelected] = useState<string | null>(
    GOALS.some((g) => g.id === goalFromParams) ? goalFromParams! : null,
  );

  return (
    <OnboardingSafeScreen>
      <View style={s.safe}>
        <OnboardingHeader
          headline={"YOUR\nGOAL."}
          sub="What are you training for?"
          onBack={() => router.back()}
        />

        <View style={s.gridContainer} accessibilityRole="radiogroup">
          {[0, 1].map((row) => (
            <View key={row} style={s.gridRow}>
              {GOALS.slice(row * 2, row * 2 + 2).map((g) => (
                <GoalTile
                  key={g.id}
                  image={g.image}
                  title={g.title}
                  isSelected={selected === g.id}
                  onPress={() => setSelected(g.id)}
                  style={s.tile}
                />
              ))}
            </View>
          ))}
        </View>

        <OnboardingNav
          nextDisabled={!selected}
          onNext={() =>
            router.push({
              pathname: "/(auth)/onboarding/goal-detail",
              params: { ...params, goalId: selected! },
            })
          }
        />
      </View>
    </OnboardingSafeScreen>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    paddingBottom: 12,
    justifyContent: "space-between",
    position: "relative",
  },
  gridContainer: {
    flex: 1,
    zIndex: 1,
    paddingHorizontal: 12,
    paddingBottom: 30,
  },
  gridRow: {
    flex: 1,
    flexDirection: "row",
  },
  tile: {
    flex: 1,
  },
});
