// ─────────────────────────────────────────────────────────────────────────
// T — design tokens
//
// Two parallel palettes (lightTheme / darkTheme) share the exact same key
// shape so components can read T.accent, T.bg, etc. from whichever is active.
// Runtime switching lives in AppThemeProvider (`useTheme()` from
// src/context/ThemeContext). Static `T` remains lightTheme so existing
// `import { T }` call sites stay unchanged until Stage 3 migrates them.
//
// Type pairing: Bricolage Grotesque (display) + Plus Jakarta Sans (body).
// Fonts are loaded once in app/_layout.tsx via useFonts.
// ─────────────────────────────────────────────────────────────────────────

const fonts = {
  // ── Display face — Bricolage Grotesque
  displayBold: "BricolageGrotesque_700Bold",
  displaySemi: "BricolageGrotesque_600SemiBold",
  display: "BricolageGrotesque_500Medium",
  displayMed: "BricolageGrotesque_500Medium", // alias of display
  displayExtraBold: "BricolageGrotesque_800ExtraBold", // reserved for hero headlines only

  // ── Body face — Plus Jakarta Sans
  body: "PlusJakartaSans-Regular",
  bodyMed: "PlusJakartaSans-Medium",
  bodySemi: "PlusJakartaSans-SemiBold",
  bodyBold: "PlusJakartaSans-Bold",
} as const;

const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

const radius = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 26,
  pill: 999,
} as const;

const shadow = {
  card: {
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  lifted: {
    // Neutral near-black, deliberately NOT the accent — a tinted lift reads as
    // a colored glow around cards and pills rather than elevation.
    shadowColor: "#0A0A0A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 4,
  },
} as const;

const motion = {
  glide: { useNativeDriver: true, speed: 16, bounciness: 6 },
  settle: { useNativeDriver: true, speed: 20, bounciness: 4 },
  quick: { useNativeDriver: true, duration: 140 },
} as const;

// Absolute immersive-dark values (formerly top-level on T). Kept on both
// themes under the legacy key names so ActiveWorkoutScreen's T.darkBg /
// T.accentOnDark usages keep working until that screen is migrated.
// Surface values mirror the onboarding tokens in src/ui/tokens/colors.ts so the
// signup flow and the app proper read as one product.
const immersiveDark = {
  darkBg: "#111318",
  darkPanel: "#202020",
  darkPanelBorder: "#333333",
  darkGlass: "rgba(255,255,255,0.06)",
  darkGlassBorder: "rgba(255,255,255,0.12)",
  onDark: "#F5F5F0",
  onDarkMuted: "#8A8A8A",
  accentOnDark: "#E53935",
  accentOnDarkSoft: "#FF6F6C",
  accentOnDarkText: "#FFFFFF", // text sitting on an accent-filled control
} as const;

export const lightTheme = {
  bg: "#F7F7F5",
  glass: "#FFFFFF",
  glassBorder: "#EBEBEB",
  border: "#EBEBEB",
  white: "#0A0A0A", // primary text — kept name for drop-in compatibility
  faint: "#ADADA8",
  secondary: "#0A0A0A", // reused as the "meal logged" dot fill
  accent: "#E53935",
  accentTint: "rgba(229,57,53,0.08)",
  bgElevated: "#FFFFFF", // alias, same as glass — kept for drop-in compatibility
  accentSoft: "rgba(229,57,53,0.08)", // alias, same as accentTint
  muted: "#ADADA8", // alias of faint

  ringGlass: "rgba(229,57,53,0.08)", // alias of accentSoft
  ringBorder: "rgba(229,57,53,0.35)",
  onImage: "#FFFFFF",
  text: "#0A0A0A", // alias of white
  badge: "#E5484D", // muted alert-red, reserved for notification dots only
  onImageGlass: "rgba(0,0,0,0.32)",
  onImageBorder: "rgba(255,255,255,0.22)",
  onImageMuted: "#D8D8D3",

  accentPressed: "#C62828",
  accentLine: "rgba(229,57,53,0.14)",
  // Ink sitting on an accent-filled control (CTA, chip, pill).
  onAccent: "#FFFFFF",

  ...fonts,
  space,
  radius,
  shadow,
  motion,
  ...immersiveDark,
} as const;

export const darkTheme = {
  // Mapped from immersive-dark tokens → primary slot names
  bg: immersiveDark.darkBg, // "#0E0E10"
  glass: immersiveDark.darkGlass, // "rgba(255,255,255,0.05)"
  glassBorder: immersiveDark.darkGlassBorder, // "rgba(255,255,255,0.10)"
  border: immersiveDark.darkPanelBorder, // "rgba(255,255,255,0.08)"
  white: immersiveDark.onDark, // primary text on dark
  faint: immersiveDark.onDarkMuted,
  secondary: immersiveDark.onDark, // meal-logged / secondary fill
  // Single red accent, same value the onboarding flow uses.
  accent: immersiveDark.accentOnDark,
  accentTint: "rgba(229,57,53,0.14)",
  // Solid elevated surface → darkPanel (glass is translucent)
  bgElevated: immersiveDark.darkPanel,
  accentSoft: "rgba(229,57,53,0.14)", // alias of accentTint
  muted: immersiveDark.onDarkMuted,

  ringGlass: "rgba(229,57,53,0.14)",
  ringBorder: "rgba(229,57,53,0.65)",
  onImage: "#FFFFFF", // still white over photo scrims
  text: immersiveDark.onDark,
  badge: "#E5484D", // same semantic alert red
  onImageGlass: "rgba(0,0,0,0.45)", // slightly heavier scrim on dark UI
  onImageBorder: "rgba(255,255,255,0.22)",
  onImageMuted: "#D8D8D3",

  accentPressed: "#C62828",
  accentLine: "rgba(229,57,53,0.22)",
  onAccent: "#FFFFFF",

  ...fonts,
  space,
  radius,
  shadow,
  motion,
  ...immersiveDark,
} as const;

/** Default export — light palette. Unchanged for existing `import { T }` call sites. */
export const T = lightTheme;

/**
 * Shared shape of both palettes. Color/font tokens are widened to `string` so
 * darkTheme's literals stay assignable — `typeof lightTheme` alone would pin
 * every token to the light palette's exact hex value.
 */
export type AppTheme = {
  readonly [K in keyof typeof lightTheme]: (typeof lightTheme)[K] extends string
    ? string
    : (typeof lightTheme)[K];
};
