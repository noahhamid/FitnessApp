import { ProfileMetricsForm } from "@/src/features/auth";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingProfileRoute() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ProfileMetricsForm
        goalId={goalId}
        onBack={() => router.back()}
        onNext={({ weightKg, heightCm, age, gender }) =>
          router.push({
            pathname: "/(auth)/onboarding/training-setup",
            params: {
              weightKg: String(weightKg),
              heightCm: String(heightCm),
              age: String(age),
              gender,
              goalId,
            },
          })
        }
      />
    </SafeAreaView>
  );
}
