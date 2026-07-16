import { router } from "expo-router";
import WeightScreen from "@/src/features/auth/components/WeightScreen";

export default function Weight() {
  return (
    <WeightScreen
      onContinue={(weightKg) => {
        // TODO: persist weightKg once backend wiring is ready
        // next screen in the flow goes here, e.g. router.push('/(onboarding)/goal')
      }}
    />
  );
}
