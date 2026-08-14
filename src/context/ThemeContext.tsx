import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import {
  darkTheme,
  lightTheme,
  type AppTheme,
} from "@/src/theme";
import { storage } from "@/src/utils/storage";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedScheme = "light" | "dark";

const STORAGE_KEY = "app.themeMode";

type ThemeContextValue = {
  /** User preference: explicit light/dark, or follow OS. */
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  /** Concrete scheme after resolving "system" against useColorScheme(). */
  resolved: ResolvedScheme;
  /** Active palette object (lightTheme or darkTheme). */
  theme: AppTheme;
  /** False until the persisted preference has been read once. */
  hydrated: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveScheme(
  mode: ThemeMode,
  systemScheme: ReturnType<typeof useColorScheme>,
): ResolvedScheme {
  if (mode === "light" || mode === "dark") return mode;
  // null / undefined / anything else → light (same fallback RN docs imply)
  return systemScheme === "dark" ? "dark" : "light";
}

/**
 * App appearance follows the phone’s system light/dark setting by default
 * (`mode: "system"`) — including onboarding and auth. Once the user picks
 * Light or Dark in Profile, that choice applies app-wide.
 */
export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  // Always start on system so first paint matches the OS before storage loads.
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const stored = await storage.getString(STORAGE_KEY);
        if (
          !cancelled &&
          (stored === "light" || stored === "dark" || stored === "system")
        ) {
          setModeState(stored);
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void storage.setString(STORAGE_KEY, next);
  }, []);

  // useColorScheme() subscribes to Appearance changes and re-renders this
  // provider when the OS scheme flips — no extra listener required.
  const resolved = resolveScheme(mode, systemScheme);
  const theme = resolved === "dark" ? darkTheme : lightTheme;

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, setMode, resolved, theme, hydrated }),
    [mode, setMode, resolved, theme, hydrated],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * App design-theme hook (lightTheme / darkTheme).
 * Not the same as React Navigation's `useTheme` — import from this module.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within AppThemeProvider");
  }
  return ctx;
}
