// ── Design Tokens ─────────────────────────────────────────────────────────────
// Same values as nutrition/theme.ts and WorkoutPlanCard — this is now the
// same story as before: worth hoisting into one real shared theme.ts once
// you've got 2-3 features using it, rather than keeping a copy per feature.
export const T = {
  bg: "#111318",
  glass: "rgba(255,255,255,0.08)",
  glassBorder: "rgba(255,255,255,0.14)",
  ringGlass: "rgba(10,11,14,0.42)",
  ringBorder: "rgba(255,199,0,0.65)",
  accent: "#FFC700",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.7)",
  faint: "rgba(255,255,255,0.45)",

  display: "SpaceGrotesk_700Bold",
  bodyMed: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
};