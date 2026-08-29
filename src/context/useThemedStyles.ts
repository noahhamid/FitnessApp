import { useMemo } from "react";
import { useOptionalTheme } from "./ThemeContext";
import { lightTheme, type AppTheme } from "@/src/theme";

/**
 * Convenience for components that build StyleSheet.create from theme tokens.
 * Pass a stable module-level factory: `function makeStyles(T: AppTheme) { ... }`.
 *
 * Falls back to lightTheme if rendered outside AppThemeProvider (expo-router
 * can mount a route during error recovery before RootLayout providers attach).
 */
export function useThemedStyles<S>(factory: (T: AppTheme) => S) {
  const ctx = useOptionalTheme();
  const T = ctx?.theme ?? lightTheme;
  const resolved = ctx?.resolved ?? "light";
  const styles = useMemo(() => factory(T), [factory, T]);
  return { T, styles, resolved } as const;
}
