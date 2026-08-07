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
import { topInset } from "@/src/lib/safe-area";

const SAFE_BAR_BLACK = "#000000";

type Props = {
  children: ReactNode;
};

function forceLightStatusIcons() {
  // Always white icons — top chrome is solid black in light and dark mode.
  RNStatusBar.setBarStyle("light-content", true);
  if (Platform.OS === "android") {
    RNStatusBar.setTranslucent(true);
    RNStatusBar.setBackgroundColor(SAFE_BAR_BLACK, true);
  }
}

/**
 * Root chrome: paints solid black behind the status-bar / notch band and the
 * home-indicator / nav-gesture band, while leaving screen layouts responsible
 * for their own content insets (SafeAreaView / useSafeAreaInsets).
 *
 * Absolute overlay bars (not layout padding) avoid double-counting top/bottom
 * insets that screens already apply.
 */
export function AppSafeAreaChrome({ children }: Props) {
  const insets = useSafeAreaInsets();
  const top = topInset(insets.top);
  const bottom = Math.max(insets.bottom, 0);

  useEffect(() => {
    forceLightStatusIcons();
    void import("expo-system-ui")
      .then((SystemUI) => SystemUI.setBackgroundColorAsync(SAFE_BAR_BLACK))
      .catch(() => undefined);

    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") forceLightStatusIcons();
    });
    return () => sub.remove();
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.body}>{children}</View>

      {/* Top: covers notch / Dynamic Island / status icons band */}
      <View
        pointerEvents="none"
        style={[styles.bar, styles.top, { height: top }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />

      {/* Bottom: covers home indicator / 3-button nav band */}
      <View
        pointerEvents="none"
        style={[styles.bar, styles.bottom, { height: bottom }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />

      {/* Strictly light icons over the black top bar (all themes). */}
      <StatusBar style="light" backgroundColor={SAFE_BAR_BLACK} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SAFE_BAR_BLACK,
  },
  body: {
    flex: 1,
  },
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: SAFE_BAR_BLACK,
    zIndex: 10000,
    elevation: 10000,
  },
  top: {
    top: 0,
  },
  bottom: {
    bottom: 0,
  },
});
