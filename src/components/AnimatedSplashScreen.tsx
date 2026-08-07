import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  View,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { darkTheme } from "@/src/theme";

const NEAR_BLACK = "#0A0A0A";
/** Ivory accent matching darkTheme.accent — splash sits before theme resolve. */
const ACCENT = darkTheme.accent;
const SETTLE = darkTheme.motion.settle;

const MARK = require("../../assets/images/icon.png");

type Props = {
  /** True when fonts + auth + theme (and any other critical gates) are ready. */
  ready: boolean;
  children: ReactNode;
};

/**
 * Branded in-app splash shown the moment the native splash hides.
 * Fades out when `ready` — no artificial minimum display time.
 */
export function AnimatedSplashScreen({ ready, children }: Props) {
  const [exited, setExited] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const markOpacity = useRef(new Animated.Value(0)).current;
  const markScale = useRef(new Animated.Value(0.88)).current;
  const breath = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.35)).current;
  const dotA = useRef(new Animated.Value(0.35)).current;
  const dotB = useRef(new Animated.Value(0.35)).current;
  const dotC = useRef(new Animated.Value(0.35)).current;
  const nativeHidden = useRef(false);
  const exitStarted = useRef(false);

  // Hide OS splash as soon as this branded layer is on screen.
  useEffect(() => {
    if (nativeHidden.current) return;
    nativeHidden.current = true;
    void SplashScreen.hideAsync();
  }, []);

  // Entrance + breathing loop.
  useEffect(() => {
    Animated.parallel([
      Animated.timing(markOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(markScale, {
        toValue: 1,
        ...SETTLE,
      }),
    ]).start();

    const breathLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(breath, {
            toValue: 1.045,
            duration: 1100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 0.7,
            duration: 1100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(breath, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 0.35,
            duration: 1100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    breathLoop.start();

    const pulseDot = (v: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, {
            toValue: 1,
            duration: 380,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0.3,
            duration: 380,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );

    const d1 = pulseDot(dotA, 0);
    const d2 = pulseDot(dotB, 140);
    const d3 = pulseDot(dotC, 280);
    d1.start();
    d2.start();
    d3.start();

    return () => {
      breathLoop.stop();
      d1.stop();
      d2.stop();
      d3.stop();
    };
  }, [breath, glow, markOpacity, markScale, dotA, dotB, dotC]);

  // Exit as soon as the app is actually ready — no fake hold.
  useEffect(() => {
    if (!ready || exitStarted.current || exited) return;
    exitStarted.current = true;
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setExited(true);
    });
  }, [ready, exited, overlayOpacity]);

  return (
    <View style={styles.root}>
      {children}
      {!exited ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.overlay, { opacity: overlayOpacity }]}
        >
          <Animated.View
            style={[
              styles.glow,
              {
                opacity: glow,
                transform: [{ scale: breath }],
              },
            ]}
          />
          <Animated.View
            style={{
              opacity: markOpacity,
              transform: [{ scale: markScale }, { scale: breath }],
            }}
          >
            <Image source={MARK} style={styles.mark} resizeMode="contain" />
          </Animated.View>
          <View style={styles.dots}>
            {[dotA, dotB, dotC].map((v, i) => (
              <Animated.View
                key={i}
                style={[styles.dot, { opacity: v, transform: [{ scale: v }] }]}
              />
            ))}
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: NEAR_BLACK,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: NEAR_BLACK,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(242, 239, 233, 0.12)",
  },
  mark: {
    width: 128,
    height: 128,
  },
  dots: {
    position: "absolute",
    bottom: "22%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT,
  },
});
