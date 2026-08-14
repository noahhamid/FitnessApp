import { useTheme } from "@/src/context/ThemeContext";
import { useEffect, type ReactNode } from "react";
import {
  AppState,
  StyleSheet,
  View,
  Platform,
  StatusBar as RNStatusBar,
} from "react-native";
import { StatusBar } from "expo-status-bar";

type Props = {
  children: ReactNode;
};

/**
 * Root shell: syncs system status / nav chrome with the active theme.
 *
 * Deliberately does NOT paint absolute cover bars over the inset regions —
 * those used to sit above SafeAreaView padding (and could be taller than it
 * via StatusBar.currentHeight), which clipped headers and bottom CTAs and
 * read as the app being "cut off" at the status and navigation bars.
 *
 * Screens keep owning their own insets via SafeAreaView / useSafeAreaInsets.
 */
export function AppSafeAreaChrome({ children }: Props) {
  const { resolved, theme } = useTheme();
  const isDark = resolved === "dark";
  const barStyle = isDark ? "light-content" : "dark-content";
  const chromeBg = theme.bg;
  const systemNavBg = theme.accent;

  useEffect(() => {
    RNStatusBar.setBarStyle(barStyle, true);
    if (Platform.OS === "android") {
      RNStatusBar.setTranslucent(true);
      RNStatusBar.setBackgroundColor(chromeBg, true);
    }

    void import("expo-system-ui")
      .then((SystemUI) => SystemUI.setBackgroundColorAsync(systemNavBg))
      .catch(() => undefined);

    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") {
        RNStatusBar.setBarStyle(barStyle, true);
        if (Platform.OS === "android") {
          RNStatusBar.setBackgroundColor(chromeBg, true);
        }
        void import("expo-system-ui")
          .then((SystemUI) => SystemUI.setBackgroundColorAsync(systemNavBg))
          .catch(() => undefined);
      }
    });
    return () => sub.remove();
  }, [barStyle, chromeBg, systemNavBg]);

  return (
    <View style={[styles.root, { backgroundColor: chromeBg }]}>
      <View style={styles.body}>{children}</View>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={chromeBg} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
});
