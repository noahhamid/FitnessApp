import { Image, StyleSheet, View } from "react-native";

/** Same mark as the native splash so font/auth wait is one continuous plate. */
const BRAND_RED = "#C91923";
const LOGO = require("../../../assets/images/splash-icon.png");

export function LoadingScreen(_props?: { message?: string }) {
  return (
    <View style={s.root}>
      <Image source={LOGO} style={s.logo} resizeMode="contain" />
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
    width: "60%",
    aspectRatio: 1,
  },
});
