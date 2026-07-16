// ── Design Tokens ─────────────────────────────────────────────────────────────
// Matches WorkoutPlanCard.tsx exactly, so the Diet tab feels like the same app
// as the Workout tab: dark glass, single gold accent, Space Grotesk + Inter.
// Worth moving this into a real shared src/theme.ts at some point so it isn't
// redeclared per file — same note as in your workout card's comment.
export const T = {
  bg: "#111318",
  glass: "rgba(255,255,255,0.08)",
  glassBorder: "rgba(255,255,255,0.14)",
  ringGlass: "rgba(10,11,14,0.42)",
  ringBorder: "rgba(255,199,0,0.65)",
  accent: "#FFC700",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.7)",

  display: "SpaceGrotesk_700Bold",
  bodyMed: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
};