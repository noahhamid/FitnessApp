/**
 * Barrel export for legacy `@/src/theme` imports.
 * Prefer importing directly from `@/src/ui/tokens` in new code.
 *
 * Fixed: removed workout.service and nutrition.service exports.
 * Theme should only export visual tokens. Services belong in their
 * own feature imports: `@/src/features/workout` etc.
 */
export { SH, SW } from "./lib/dimensions";
export * from "./lib/seed";
export { C, COLORS, TAG_COLORS } from "./ui/tokens/colors";
export { spacing } from "./ui/tokens/spacing";
export { FONTS } from "./ui/tokens/typography";

