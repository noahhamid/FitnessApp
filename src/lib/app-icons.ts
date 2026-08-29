import type { ImageSourcePropType } from "react-native";

/**
 * Custom glossy app icons (PNG, transparent).
 * Files live in assets/images/icons/.
 *
 * Nav / checklist red+white set uses short names (home.png, train.png, …).
 * Older numbered macros/stats icons remain for nutrition + pulse.
 */
export const AppIcons = {
  // —— Bottom nav + scan FAB (new red/white set) ——
  home: require("../../assets/images/icons/home.png"),
  train: require("../../assets/images/icons/train.png"),
  meals: require("../../assets/images/icons/meals.png"),
  progress: require("../../assets/images/icons/progress.png"),
  profile: require("../../assets/images/icons/profile.png"),
  scan: require("../../assets/images/icons/scan.png"),

  // —— Checklist ——
  breakfast: require("../../assets/images/icons/breakfast.png"),

  // —— Dashboard / nutrition (previous set) ——
  clock: require("../../assets/images/icons/06_session_time_clock_512px_transparent.png"),
  streak: require("../../assets/images/icons/07_streak_flame_orange_512px_transparent.png"),
  water: require("../../assets/images/icons/08_macro_water_blue_512px_transparent.png"),
  carbs: require("../../assets/images/icons/09_macro_carbs_amber_512px_transparent.png"),
  protein: require("../../assets/images/icons/10_macro_protein_rose_512px_transparent.png"),
  fat: require("../../assets/images/icons/11_macro_fat_purple_512px_transparent.png"),
  calories: require("../../assets/images/icons/12_calories_energy_orangered_512px_transparent.png"),
  check: require("../../assets/images/icons/14_checklist_check_green_512px_transparent.png"),
  cardio: require("../../assets/images/icons/15_heart_rate_cardio_crimson_512px_transparent.png"),
  sleep: require("../../assets/images/icons/16_sleep_recovery_violet_512px_transparent.png"),
} as const satisfies Record<string, ImageSourcePropType>;

export type AppIconName = keyof typeof AppIcons;
