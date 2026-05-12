import { router } from "expo-router";

import { ReadyScreen, setOnboardingComplete, setSession } from "@/src/features/auth";

export default function OnboardingReadyRoute() {
  return (
    <ReadyScreen
      onNext={async () => {
        await setOnboardingComplete(true);
        await setSession(true);
        router.replace("/(app)/(tabs)");
      }}
    />
  );
}
