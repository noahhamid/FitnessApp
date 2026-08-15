import { useColorScheme } from "react-native";
import {
  useOptionalTheme,
  type ResolvedScheme,
} from "@/src/context/ThemeContext";

export type OnboardingColors = {
  accent: string;
  accentDeep: string;
  accentDim: string;
  bg: string;
  bg2: string;
  bg3: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  muted2: string;
  red: string;
  blue: string;
  orange: string;
  /** Header band gradient midpoint (between bg and accentDeep). */
  headerMid: string;
  /** Secondary copy on the header band. */
  headerSub: string;
  /** Ink on accent-filled controls. */
  onAccent: string;
};

export const darkOnboardingColors: OnboardingColors = {
  accent: "#E53935",
  accentDeep: "#C62828",
  accentDim: "#E53935",
  bg: "#111318",
  bg2: "#222222",
  bg3: "#2A2A2A",
  card: "#202020",
  border: "#333333",
  text: "#F5F5F0",
  muted: "#8A8A8A",
  muted2: "#4A4A4A",
  red: "#FF5252",
  blue: "#4D9EFF",
  orange: "#E53935",
  headerMid: "#3A1818",
  headerSub: "rgba(255, 255, 255, 0.7)",
  onAccent: "#FFFFFF",
};

export const lightOnboardingColors: OnboardingColors = {
  accent: "#E53935",
  accentDeep: "#C62828",
  accentDim: "#E53935",
  bg: "#F7F7F5",
  bg2: "#EEEEEC",
  bg3: "#E8E8E4",
  card: "#FFFFFF",
  border: "#E0E0DC",
  text: "#0A0A0A",
  muted: "#6B6B66",
  muted2: "#ADADA8",
  red: "#E53935",
  blue: "#2B6CB0",
  orange: "#E53935",
  headerMid: "#F3C7C5",
  headerSub: "rgba(10, 10, 10, 0.55)",
  onAccent: "#FFFFFF",
};

/** @deprecated Prefer useOnboardingColors() — kept as the dark palette for static imports. */
export const COLORS = {
  accent: darkOnboardingColors.accent,
  accentDeep: darkOnboardingColors.accentDeep,
  bg: darkOnboardingColors.bg,
  bg2: darkOnboardingColors.bg2,
  bg3: darkOnboardingColors.bg3,
  card: darkOnboardingColors.card,
  border: darkOnboardingColors.border,
  text: darkOnboardingColors.text,
  muted: darkOnboardingColors.muted,
  muted2: darkOnboardingColors.muted2,
  red: darkOnboardingColors.red,
  blue: darkOnboardingColors.blue,
  orange: darkOnboardingColors.orange,
} as const;

/** @deprecated Prefer useOnboardingColors() — static dark fallback. */
export const C = {
  ...COLORS,
  accentDim: darkOnboardingColors.accentDim,
} as const;

export const TAG_COLORS: Record<string, string> = {
  Compound: darkOnboardingColors.accent,
  Isolation: darkOnboardingColors.blue,
  Bodyweight: darkOnboardingColors.orange,
  Machine: darkOnboardingColors.muted,
  Cardio: darkOnboardingColors.red,
};

export function getOnboardingColors(
  resolved: ResolvedScheme,
): OnboardingColors {
  return resolved === "dark" ? darkOnboardingColors : lightOnboardingColors;
}

/**
 * App-wide resolved scheme from ThemeContext.
 * Defaults to the phone OS (`mode: "system"`); Profile Light/Dark overrides it.
 * Falls back to RN Appearance if somehow rendered outside AppThemeProvider
 * (boot / Fast Refresh recovery) so auth layouts don't crash.
 */
export function useSystemResolvedScheme(): ResolvedScheme {
  const ctx = useOptionalTheme();
  const systemScheme = useColorScheme();
  if (ctx) return ctx.resolved;
  return systemScheme === "dark" ? "dark" : "light";
}

/** Onboarding / auth palette — same light/dark decision as the rest of the app. */
export function useOnboardingColors(): OnboardingColors {
  return getOnboardingColors(useSystemResolvedScheme());
}
