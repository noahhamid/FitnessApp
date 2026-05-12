/**
 * Barrel export for legacy `@/src/theme` imports.
 * Prefer `@/src/ui/tokens` and feature `services` for new code.
 */
export { COLORS, C, TAG_COLORS } from "./ui/tokens/colors";
export { FONTS } from "./ui/tokens/typography";
export { spacing } from "./ui/tokens/spacing";
export { SW, SH } from "./lib/dimensions";
export * from "./lib/seed";
export * from "./features/workout/services/workout.service";
export * from "./features/nutrition/services/nutrition.service";
