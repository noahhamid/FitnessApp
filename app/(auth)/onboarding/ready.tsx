import { ReadyScreen } from "@/src/features/auth";
import { useAuthStore } from "@/src/features/auth/hooks/useAuth";
import {
  upsertUserGoal,
  type GoalId,
} from "@/src/features/auth/services/goals.service";
import { saveUserProfile } from "@/src/features/profile/services/profile.service";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingReadyRoute() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const setOnboarded = useAuthStore((s) => s.setOnboarded);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ReadyScreen
        onNext={async () => {
          if (goalId) {
            await upsertUserGoal(goalId as GoalId);
            try {
              await saveUserProfile({ goalId });
            } catch {
              // Non-blocking to keep onboarding completion resilient.
            }
          }
          setOnboarded(true);
          router.replace("/(app)/(tabs)");
        }}
      />
    </SafeAreaView>
  );
}
