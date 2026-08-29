import { useMemo } from "react";
import {
  getOnboardingColors,
  useSystemResolvedScheme,
  type OnboardingColors,
} from "@/src/ui/tokens/colors";

/**
 * Build StyleSheets from the active app palette (system by default;
 * Profile Light/Dark overrides apply here too).
 * Pass a stable module-level factory.
 */
export function useOnboardingStyles<S>(
  factory: (C: OnboardingColors) => S,
): { C: OnboardingColors; styles: S; resolved: "light" | "dark" } {
  const resolved = useSystemResolvedScheme();
  const C = getOnboardingColors(resolved);
  const styles = useMemo(() => factory(C), [factory, C]);
  return { C, styles, resolved };
}
