// ── Design Tokens ─────────────────────────────────────────────────────────────
// Same base palette as NutritionScreen.tsx, extended with macro colors so
// carbs/protein/fat read as distinct at a glance without leaving the dark/gold system.

export const T = {
  bg0: "#121212",
  bg2: "#1E1E1E",
  bg3: "#252525",
  gold: "#FFC700",
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#5A5A5A",

  // macro-coded accents
  carbs: "#5FA8D3",
  protein: "#FFC700", // reuse gold — protein is the "hero" macro for a fitness app
  fat: "#E2603F",
  water: "#5FA8D3",
};

// ── Paper palette ──────────────────────────────────────────────────────────────
// Exact colors from the meal-tab HTML mockup. Used ONLY by MealHeader + DaySelector
// for now. This is a lighter palette than T above — if you want the rest of the
// Meal screen to match it too, say the word and I'll extend it further.
export const P = {
  paper: "#FAF7F0",
  ink: "#232420",
  inkSoft: "#6B6A63",
  line: "#DCD7C9",
  avocado: "#33482E",
  avocadoLight: "#4E6A45",
  coral: "#E2603F",
  card: "#FFFFFF",
  gold: "#D6A13B",
  blueberry: "#3F6E82",
  creamTag: "#F1ECDF",
  waterIconBg: "#EAF2F5",
};