// ─────────────────────────────────────────────────────────────────────────
// T — design tokens
// Palette stays exactly as designed: warm paper background, ink text,
// a single deep-pine accent.
//
// Type pairing: Bricolage Grotesque (display) + Plus Jakarta Sans (body).
// Bricolage carries the personality — it has slight ink-trap notches at
// larger sizes that read as considered rather than a generic geometric
// sans. Plus Jakarta stays underneath for anything meant to be read
// quickly (labels, meta, numbers).
//
// Requires: npx expo install @expo-google-fonts/bricolage-grotesque expo-font
// then load in your root layout, e.g.:
//
//   import {
//     useFonts,
//     BricolageGrotesque_500Medium,
//     BricolageGrotesque_600SemiBold,
//     BricolageGrotesque_700Bold,
//     BricolageGrotesque_800ExtraBold,
//   } from "@expo-google-fonts/bricolage-grotesque";
//
//   const [fontsLoaded] = useFonts({
//     BricolageGrotesque_500Medium,
//     BricolageGrotesque_600SemiBold,
//     BricolageGrotesque_700Bold,
//     BricolageGrotesque_800ExtraBold,
//   });
// ─────────────────────────────────────────────────────────────────────────
export const T = {
  bg: "#F7F7F5",
  glass: "#FFFFFF",
  glassBorder: "#EBEBEB",
  border: "#EBEBEB",
  white: "#0A0A0A", // primary text — kept name for drop-in compatibility
  faint: "#ADADA8",
  secondary: "#0A0A0A", // reused as the "meal logged" dot fill
  accent: "#1C3F2E",
  accentTint: "#F4F7F5",
  bgElevated: "#FFFFFF", // alias, same as glass — kept for drop-in compatibility
  accentSoft: "#F4F7F5", // alias, same as accentTint
  muted: "#ADADA8", // alias of faint

  // ── Display face — Bricolage Grotesque
  displayBold: "BricolageGrotesque_700Bold",
  displaySemi: "BricolageGrotesque_600SemiBold",
  display: "BricolageGrotesque_500Medium",
  displayMed: "BricolageGrotesque_500Medium", // alias of display
  displayExtraBold: "BricolageGrotesque_800ExtraBold", // reserved for hero headlines only

  ringGlass: "#F4F7F5", // alias of accentSoft
  ringBorder: "#EBEBEB", // alias of border
  onImage: "#FFFFFF",
  text: "#0A0A0A", // alias of white
  badge: "#E5484D", // muted alert-red, reserved for notification dots only
  onImageGlass: "rgba(0,0,0,0.32)",
  onImageBorder: "rgba(255,255,255,0.22)",
  onImageMuted: "#D8D8D3",

  // ── Body face — Plus Jakarta Sans (unchanged)
  body: "PlusJakartaSans-Regular",
  bodyMed: "PlusJakartaSans-Medium",
  bodySemi: "PlusJakartaSans-SemiBold",
  bodyBold: "PlusJakartaSans-Bold",

  accentPressed: "#132D21",
  accentLine: "rgba(28,63,46,0.14)",

  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },

  radius: {
    sm: 10,
    md: 16,
    lg: 20,
    xl: 26,
    pill: 999,
  },

  shadow: {
    card: {
      shadowColor: "#0A0A0A",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 10,
      elevation: 1,
    },
    lifted: {
      shadowColor: "#1C3F2E",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.16,
      shadowRadius: 14,
      elevation: 4,
    },
  },

  motion: {
    glide: { useNativeDriver: true, speed: 16, bounciness: 6 },
    settle: { useNativeDriver: true, speed: 20, bounciness: 4 },
    quick: { useNativeDriver: true, duration: 140 },
  },

  // ── Dark / immersive surface — reserved for the one full-screen mode
  // that intentionally goes dark for glare/legibility during a workout
  // (ActiveWorkoutScreen). No other screen should use these; everything
  // else stays on the light paper surface above.
  darkBg: "#0E0E10",
  darkPanel: "#17181B",
  darkPanelBorder: "rgba(255,255,255,0.08)",
  darkGlass: "rgba(255,255,255,0.05)",
  darkGlassBorder: "rgba(255,255,255,0.10)",
  onDark: "#FFFFFF",
  onDarkMuted: "#9DA3AA",

  // Same accent hue as T.accent, lifted in lightness — the pine green at
  // its normal, near-black-adjacent lightness is invisible on a dark
  // background, so this is not a second accent color, just a legible
  // tint of the same one for this one context.
  accentOnDark: "#7FD9AE",
  accentOnDarkSoft: "#B9EBD2",
  accentOnDarkText: "#0A1F15", // ink text sitting on the bright accent (e.g. CTA label)
};