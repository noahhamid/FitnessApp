import { router } from "expo-router";
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { C, FONTS } from "@/src/ui/tokens";

export function WelcomeSlides() {
  return (
    <ImageBackground
      source={require("../../../../assets/images/welcome-gym.jpg")}
      style={s.root}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <LinearGradient
        colors={[
          "rgba(17,19,24,0.72)",
          "rgba(17,19,24,0.84)",
          C.bg,
        ]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={s.content} edges={["top", "bottom"]}>
        <View style={s.topSpacer} />

        <View style={s.logoContainer}>
          <View style={s.imageWrapper}>
            <Image
              source={require("../../../../assets/images/potentialpeak_logo.jpg")}
              style={s.logo}
              resizeMode="cover"
            />
          </View>
          <Text style={s.brand}>
            Potential<Text style={s.redtext}>Peak</Text>
          </Text>
          <Text style={s.sub}>Push. Grow. Repeat.</Text>
        </View>

        <View style={s.actions}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [s.primaryBtn, pressed && s.pressed]}
            onPress={() => router.push("/(auth)/onboarding")}
          >
            <Text style={s.primaryBtnText}>BUILD MY PLAN</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [s.linkBtn, pressed && s.pressed]}
            onPress={() => router.push("/(auth)/sign-in")}
          >
            <Text style={s.linkText}>I already have an account</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  topSpacer: {
    height: 40,
  },
  logoContainer: {
    alignItems: "center",
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: C.accent,
    marginBottom: 24,
    backgroundColor: C.bg,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  brand: {
    fontFamily: FONTS.blackItalic,
    fontSize: 46,
    letterSpacing: -1,
    color: C.text,
  },
  redtext: {
    color: C.accent,
    fontFamily: FONTS.blackItalic,
  },
  sub: {
    fontFamily: FONTS.regular,
    marginTop: 4,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: C.muted,
  },
  actions: {
    gap: 6,
    paddingBottom: 8,
  },
  primaryBtn: {
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 100,
    backgroundColor: C.accent,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontFamily: FONTS.blackItalic,
    fontSize: 15,
    letterSpacing: 1,
    color: C.text,
  },
  linkBtn: {
    alignItems: "center",
    paddingVertical: 15,
  },
  linkText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: C.muted,
  },
  pressed: {
    opacity: 0.84,
  },
});
