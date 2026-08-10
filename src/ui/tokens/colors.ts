export const COLORS = {
  accent: '#E53935',
  accentDeep: '#C62828',
  bg: '#111318',
  bg2: '#222222',
  bg3: '#2A2A2A',
  card: '#202020',
  border: '#333333',
  text: '#F5F5F0',
  muted: '#8A8A8A',
  muted2: '#4A4A4A',
  red: '#FF5252',
  blue: '#4D9EFF',
  orange: '#E53935',
} as const;

export const C = {
  ...COLORS,
  accentDim: '#E53935',
} as const;

export const TAG_COLORS: Record<string, string> = {
  Compound: COLORS.accent,
  Isolation: COLORS.blue,
  Bodyweight: COLORS.orange,
  Machine: COLORS.muted,
  Cardio: COLORS.red,
};
