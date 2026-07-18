import { router } from "expo-router";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONTS } from "@/src/ui/tokens";

const C = {
  bg: "#121212",
  accent: "#FFC700",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.65)",
};

export function WelcomeSlides() {
  return (
    <View style={s.root}>
      <ImageBackground
        source={require("../../../../assets/images/welcome-hero.jpg")}
        style={s.bg}
        resizeMode="cover"
      >
        {/* Gradient scrim: transparent at top, solid bg color at bottom
            so the button/text block sits on a fully readable surface. */}
        <LinearGradient
          colors={["transparent", "rgba(18,18,18,0.4)", C.bg]}
          locations={[0, 0.55, 1]}
          style={s.scrim}
        />

        <SafeAreaView style={s.content}>
          <View style={{ flex: 1 }} />

          <View style={s.textBlock}>
            <Text style={s.welcomeTo}>Welcome to</Text>
            <Text style={s.brand}>Muscle Monster</Text>
            <Text style={s.sub}>
              Personalized fitness made simple and effective.
            </Text>
          </View>

          <Pressable
            style={s.primaryBtn}
            onPress={() => router.push("/(auth)/sign-up")}
          >
            <Text style={s.primaryBtnText}>Get Started</Text>
            <View style={s.arrowCircle}>
              <Text style={s.arrowText}>→</Text>
            </View>
          </Pressable>

          <Pressable
            style={s.secondaryBtn}
            onPress={() => router.push("/(auth)/sign-in")}
          >
            <Text style={s.secondaryBtnText}>I already have an account</Text>
          </Pressable>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  bg: { flex: 1 },
  scrim: { ...StyleSheet.absoluteFillObject },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: "flex-end" },
  textBlock: { marginBottom: 24 },
  welcomeTo: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: C.muted,
    marginBottom: 2,
  },
  brand: {
    fontFamily: FONTS.black,
    fontSize: 34,
    color: C.accent,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  sub: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: C.muted,
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: C.accent,
    borderRadius: 30,
    paddingVertical: 8,
    paddingLeft: 24,
    paddingRight: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  primaryBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: "#121212",
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: { color: C.accent, fontSize: 18, fontFamily: FONTS.bold },
  secondaryBtn: { paddingVertical: 16, alignItems: "center", marginBottom: 8 },
  secondaryBtnText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: C.muted,
  },
});
