export const COLORS = {
  accent: "#FF1F4D",
  bg: "#0A0A0A",
  bg2: "#111111",
  bg3: "#1A1A1A",
  card: "#141414",
  border: "#242424",
  text: "#FFFFFF",
  muted: "#A8A8A8",
  muted2: "#5A5A5A",
  red: "#FF1F4D",
  blue: "#4D9EFF",
  orange: "#FF8C42",
} as const;

export const C = {
  ...COLORS,
  accentDim: "#FF1F4D33",
} as const;

export const TAG_COLORS: Record<string, string> = {
  Compound: COLORS.accent,
  Isolation: COLORS.blue,
  Bodyweight: COLORS.orange,
  Machine: COLORS.muted,
  Cardio: COLORS.red,
};
