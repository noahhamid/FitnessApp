import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";

/** Brand red — matches app.config splash + potentialpeak_logo.jpg plate. */
const BRAND_RED = "#C91923";
const LOGO = require("../../assets/images/potentialpeak_logo.jpg");

/** Minimum time the logo stays visible before the outro can start. */
const MIN_HOLD_MS = 1000;
const OUTRO_MS = 520;

type Props = {
  /** True when fonts + auth + theme (and any other critical gates) are ready. */
  ready: boolean;
  children: ReactNode;
};

/**
 * Branded boot splash: PotentialPeak logo on red, held ~1s, then animated out
 * into welcome / the signed-in app.
 */
export function AnimatedSplashScreen({ ready, children }: Props) {
  const [exited, setExited] = useState(false);
  const [holdDone, setHoldDone] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const markOpacity = useRef(new Animated.Value(0)).current;
  const markScale = useRef(new Animated.Value(0.92)).current;
  const markTranslateY = useRef(new Animated.Value(10)).current;
  const nativeHidden = useRef(false);
  const exitStarted = useRef(false);

  useEffect(() => {
    if (nativeHidden.current) return;
    nativeHidden.current = true;
    const id = requestAnimationFrame(() => {
      void SplashScreen.hideAsync();
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Entrance, then hold at least MIN_HOLD_MS from mount.
  useEffect(() => {
    const holdTimer = setTimeout(() => setHoldDone(true), MIN_HOLD_MS);

    Animated.parallel([
      Animated.timing(markOpacity, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(markScale, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(markTranslateY, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    return () => clearTimeout(holdTimer);
  }, [markOpacity, markScale, markTranslateY]);

  // Outro once the app is ready and the minimum hold has elapsed.
  useEffect(() => {
    if (!ready || !holdDone || exitStarted.current || exited) return;
    exitStarted.current = true;

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: OUTRO_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(markOpacity, {
        toValue: 0,
        duration: OUTRO_MS * 0.85,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(markScale, {
        toValue: 1.12,
        duration: OUTRO_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(markTranslateY, {
        toValue: -18,
        duration: OUTRO_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setExited(true);
    });
  }, [
    ready,
    holdDone,
    exited,
    overlayOpacity,
    markOpacity,
    markScale,
    markTranslateY,
  ]);

  return (
    <View style={styles.root}>
      {children}
      {!exited ? (
        <Animated.View
          pointerEvents="auto"
          style={[styles.overlay, { opacity: overlayOpacity }]}
        >
          <Animated.View
            style={{
              opacity: markOpacity,
              transform: [
                { translateY: markTranslateY },
                { scale: markScale },
              ],
            }}
          >
            <Image source={LOGO} style={styles.mark} resizeMode="contain" />
          </Animated.View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_RED,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BRAND_RED,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    ...(Platform.OS === "android" ? { elevation: 999 } : null),
  },
  mark: {
    width: 200,
    height: 200,
    borderRadius: 40,
  },
});
