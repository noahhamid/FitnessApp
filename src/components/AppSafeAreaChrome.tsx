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
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
};

/**
 * Root shell: syncs system status / nav chrome with the active theme.
 *
 * An absolute status cover paints behind the camera cutout and system icons
 * (network, battery) so screen washes cannot bleed into that region. It does
 * not take layout space — screens still pad via SafeAreaView / topInset.
 */
export function AppSafeAreaChrome({ children }: Props) {
  const { resolved, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = resolved === "dark";
  const barStyle = isDark ? "light-content" : "dark-content";
  const chromeBg = theme.bg;
  const systemNavBg = theme.bg;
  // Use the measured inset only — StatusBar.currentHeight can be taller than
  // the real cutout on edge-to-edge Android and would cover the header.
  const statusH = insets.top;

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
      {/* Absolute — paints behind the camera / network icons without eating
          layout (screens still pad via SafeAreaView / topInset). */}
      <View
        pointerEvents="none"
        style={[
          styles.statusCover,
          {
            height: statusH,
            backgroundColor: chromeBg,
            borderBottomColor: theme.border,
          },
        ]}
      />
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
  statusCover: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
