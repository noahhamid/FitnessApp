import { C } from "@/src/ui/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Image, StyleSheet, Text, View } from "react-native";

type Props = {
  message?: string;
};

/**
 * Shown while fonts and app state resolve. Deliberately styled with system font
 * weights instead of the FONTS tokens, because this renders before the custom
 * families have loaded.
 */
export function LoadingScreen({ message = "LOADING" }: Props) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fade]);

  return (
    <View style={s.root}>
      <Image
        source={require("@/assets/images/auth-hero.jpg")}
        style={s.bg}
        resizeMode="cover"
        blurRadius={8}
      />

      {/* Heavy shade: a flat scrim for overall darkness, then a vertical ramp
          so the centre stays readable and the edges sink into the background. */}
      <View style={s.scrim} />
      <LinearGradient
        colors={[
          "rgba(16, 16, 16, 0.96)",
          "rgba(16, 16, 16, 0.62)",
          "rgba(16, 16, 16, 0.98)",
        ]}
        locations={[0, 0.45, 1]}
        style={s.shade}
      />

      <Animated.View style={[s.content, { opacity: fade }]}>
        <Image
          source={require("@/assets/images/potentialpeak_logo_nobackground.jpg")}
          style={s.logo}
          resizeMode="contain"
        />
        <ActivityIndicator color={C.accent} size="small" style={s.spinner} />
        <Text style={s.message}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  bg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  scrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(16, 16, 16, 0.72)",
  },
  shade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 180,
  },
  spinner: {
    marginTop: 8,
  },
  message: {
    marginTop: 14,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
    color: "rgba(255, 255, 255, 0.55)",
  },
});
