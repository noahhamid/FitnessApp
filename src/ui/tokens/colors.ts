export const COLORS = {
  accent: '#D32F2F',
  bg: '#0A0A0A',
  bg2: '#111111',
  bg3: '#1A1A1A',
  card: '#141414',
  border: '#242424',
  text: '#F5F5F0',
  muted: '#5a5a5a',
  muted2: '#3a3a3a',
  red: '#FF4D4D',
  blue: '#4D9EFF',
  orange: '#D32F2F',
} as const;

export const C = {
  ...COLORS,
  accentDim: '#D32F2F',
} as const;

export const TAG_COLORS: Record<string, string> = {
  Compound: COLORS.accent,
  Isolation: COLORS.blue,
  Bodyweight: COLORS.orange,
  Machine: COLORS.muted,
  Cardio: COLORS.red,
};
