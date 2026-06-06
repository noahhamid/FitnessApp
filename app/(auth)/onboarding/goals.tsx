import { GoalsForm } from "@/src/features/auth";
import { saveUserProfile } from "@/src/features/profile/services/profile.service";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingGoalsRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <GoalsForm
        onNext={async (goalId) => {
          try {
            await saveUserProfile({ goalId });
          } catch {
            // Non-blocking: local onboarding state still advances.
          }
          router.push({
            pathname: "/(auth)/onboarding/profile",
            params: { goalId },
          });
        }}
      />
    </SafeAreaView>
  );
}
