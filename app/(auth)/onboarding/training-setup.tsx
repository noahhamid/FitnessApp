import { Redirect, useLocalSearchParams } from "expo-router";

/** Legacy route — training is now split across experience / equipment / schedule. */
export default function TrainingSetupRedirect() {
  const params = useLocalSearchParams();
  return (
    <Redirect
      href={{ pathname: "/(auth)/onboarding/experience", params }}
    />
  );
}
