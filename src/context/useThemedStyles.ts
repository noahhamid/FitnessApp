import { useMemo } from "react";
import { useTheme } from "./ThemeContext";
import type { AppTheme } from "@/src/theme";

/**
 * Convenience for components that build StyleSheet.create from theme tokens.
 * Pass a stable module-level factory: `function makeStyles(T: AppTheme) { ... }`.
 */
export function useThemedStyles<S>(factory: (T: AppTheme) => S) {
  const { theme: T, resolved } = useTheme();
  // Key off `resolved` (stable string), not the theme object reference —
  // guarantees styles rebuild when the user toggles light/dark/system.
  const styles = useMemo(() => factory(T), [resolved, factory, T]);
  return { T, styles, resolved } as const;
}
