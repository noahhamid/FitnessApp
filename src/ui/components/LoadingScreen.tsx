import { Image, StyleSheet, View } from "react-native";

/** Brand red — matches AnimatedSplashScreen / app.config splash. */
const BRAND_RED = "#C91923";

/**
 * Static boot frame while fonts load — same look as the animated splash so
 * there is no spinner / “LOADING” flash before Welcome or the signed-in app.
 */
export function LoadingScreen(_props?: { message?: string }) {
  return (
    <View style={s.root}>
      <Image
        source={require("@/assets/images/potentialpeak_logo.jpg")}
        style={s.logo}
        resizeMode="contain"
      />
    </View>
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
    width: 200,
    height: 200,
    borderRadius: 40,
  },
});
