import { OnboardingSafeScreen } from "@/src/features/auth/components/OnboardingSafeScreen";
import { getOnboardingResumeHref } from "@/src/features/auth/services/onboarding-draft.service";
import { Redirect, type Href } from "expo-router";
import { useEffect, useState } from "react";

/** Resume gate: restore the saved quiz and open the first unanswered screen. */
export default function OnboardingResumeScreen() {
  const [href, setHref] = useState<Href | null>(null);

  useEffect(() => {
    let active = true;
    void getOnboardingResumeHref().then((next) => {
      if (active) setHref(next);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!href) return <OnboardingSafeScreen>{null}</OnboardingSafeScreen>;
  return <Redirect href={href} />;
}
