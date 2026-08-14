import { OnboardingTransition } from "@/src/features/auth/components/OnboardingTransition";
import { router, useLocalSearchParams } from "expo-router";
import { HeartPulse } from "lucide-react-native";

export default function IssuesTransitionScreen() {
  const params = useLocalSearchParams<{ bodyIssues?: string }>();
  const issues = (params.bodyIssues ?? "").split(",").filter(Boolean);
  const hasIssues = issues.length > 0 && !issues.includes("none");

  return (
    <OnboardingTransition
      headline={
        hasIssues ? "WE'VE GOT\nYOU COVERED." : "ALREADY AHEAD\nOF THE GAME."
      }
      sub={
        hasIssues
          ? "We'll factor those body concerns into how your workouts are built."
          : "No body concerns flagged — training stays unconstrained."
      }
      icon={HeartPulse}
      onContinue={() =>
        router.push({ pathname: "/(auth)/onboarding/injuries", params })
      }
    />
  );
}
