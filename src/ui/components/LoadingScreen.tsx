import { useEffect } from "react";
import {
  Image,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";

/** Matches expo-splash-screen `imageWidth` in app.config.ts. */
export const SPLASH_LOGO_SIZE = 128;
const BRAND_RED = "#C91923";
const LOGO = require("../../../assets/images/splash-icon.png");

/**
 * Full-bleed plate identical to the native splash (status bar through nav bar).
 * Only used after we know the user is signed in.
 */
export function LoadingScreen(_props?: { message?: string }) {
  useEffect(() => {
    void SplashScreen.hideAsync();
    StatusBar.setBarStyle("light-content", true);
    if (Platform.OS === "android") {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor(BRAND_RED, true);
    }
    void import("expo-system-ui")
      .then((SystemUI) => SystemUI.setBackgroundColorAsync(BRAND_RED))
      .catch(() => undefined);
  }, []);

  return (
    <Modal
      visible
      transparent={false}
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      hardwareAccelerated
    >
      <View style={s.root}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BRAND_RED}
          translucent
        />
        <Image source={LOGO} style={s.logo} resizeMode="contain" />
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_RED,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: SPLASH_LOGO_SIZE,
    height: SPLASH_LOGO_SIZE,
  },
});
