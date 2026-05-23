import { ReadyScreen } from "@/src/features/auth";
import { useAuthStore } from "@/src/features/auth/hooks/useAuth";
import {
  upsertUserGoal,
  type GoalId,
} from "@/src/features/auth/services/goals.service";
import { router, useLocalSearchParams } from "expo-router";

export default function OnboardingReadyRoute() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const setOnboarded = useAuthStore((s) => s.setOnboarded);

  return (
    <ReadyScreen
      onNext={async () => {
        if (goalId) await upsertUserGoal(goalId as GoalId);
        setOnboarded(true);
        router.replace("/(app)/(tabs)");
      }}
    />
  );
}
