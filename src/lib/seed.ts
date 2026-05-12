import { COLORS } from "@/src/ui/tokens/colors";

export const NAV_ITEMS = [
  { id: "home", icon: "⊞", label: "Home" },
  { id: "workout", icon: "🏋️", label: "Workout" },
  { id: "nutrition", icon: "🍎", label: "Nutrition" },
  { id: "focus", icon: "⚡", label: "Focus" },
  { id: "progress", icon: "📈", label: "Progress" },
  { id: "profile", icon: "👤", label: "Profile" },
] as const;

export const WEEKLY_DATA = [
  { cal: 420, workout: true },
  { cal: 380, workout: true },
  { cal: 510, workout: true },
  { cal: 290, workout: true },
  { cal: 0, workout: false },
  { cal: 0, workout: false },
  { cal: 0, workout: false },
];

export const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export const WEIGHT_DATA = [
  { w: 84.2 },
  { w: 83.8 },
  { w: 83.5 },
  { w: 83.1 },
  { w: 82.9 },
  { w: 82.6 },
  { w: 82.4 },
  { w: 82.1 },
];

export const STEPS_SPARK = [6200, 8400, 7100, 9800, 5500, 8200, 7600];
export const SLEEP_SPARK = [6.5, 7.2, 6.8, 7.5, 6.2, 7.8, 7.1];

/** @deprecated import COLORS from @/src/ui/tokens — kept for hooks/use-theme-color compatibility */
export const Colors = {
  light: { text: COLORS.text, background: COLORS.bg, tint: COLORS.accent },
  dark: { text: COLORS.text, background: COLORS.bg, tint: COLORS.accent },
};
