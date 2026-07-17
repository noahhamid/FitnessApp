import { FONTS } from "@/src/ui/tokens";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#0A0A0A",
  accent: "#FF1F4D",
  text: "#FFFFFF",
  muted: "#A8A8A8",
};

// ─── Component ───────────────────────────────────────────────────────────────
type Props = { onNext: () => void };

export function WelcomeSlides({ onNext }: Props) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Loading Pulse Animation (The "Rep" pulse)
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  // Auto-advance
  useEffect(() => {
    const timer = setTimeout(() => onNext(), 3000);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070",
      }}
      style={s.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={s.overlay} />

      <Animated.View
        style={[
          s.animatedContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <SafeAreaView style={[s.safe, { paddingBottom: Math.max(insets.bottom, 40) }]}>
          <View style={s.content}>
            <View style={s.hero}>
              <Text style={s.title}>POTENTIAL{'\n'}PEAK</Text>
              <Text style={s.subtitle}>
                Precision training. Data-driven recovery.
              </Text>
            </View>

            <View style={s.features}>
              <Feature title="TRACK STRENGTH" />
              <Feature title="EAT SMART" />
              <Feature title="TRAIN FOCUSED" />
            </View>

            <View style={s.loadingContainer}>
              <Text style={s.loadingText}>INITIALIZING</Text>
              {/* The "Rep" Pulse Bar */}
              <View style={s.barTrack}>
                <Animated.View style={[s.barFill, { opacity: pulseAnim }]} />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </ImageBackground>
  );
}

function Feature({ title }: { title: string }) {
  return (
    <View style={s.featureRow}>
      <View style={s.accentBar} />
      <Text style={s.featureTitle}>{title}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 10, 10, 0.75)", // Slightly lighter for more image clarity
  },
  animatedContainer: { flex: 1 },
  safe: { flex: 1, justifyContent: "flex-end" },
  content: { paddingHorizontal: 32, gap: 52 },

  hero: { gap: 12 },
  title: {
    fontFamily: FONTS.black,
    fontSize: 56, // Slightly reduced for the new two-word balance
    lineHeight: 56,
    color: "#FF1F4D",
    letterSpacing: -1.2,
    textTransform: "uppercase",
  },
  subtitle: {
    fontFamily: FONTS.regular,
    color: T.muted,
    fontSize: 17,
    lineHeight: 26,
  },

  features: { gap: 22 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  accentBar: { width: 4, height: 36, backgroundColor: T.accent, borderRadius: 3 },
  featureTitle: {
    fontFamily: FONTS.bold,
    color: T.text,
    fontSize: 16.5,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  loadingContainer: { gap: 12 },
  loadingText: {
    fontFamily: FONTS.medium,
    color: T.text,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  barTrack: { width: 120, height: 2, backgroundColor: "rgba(255,255,255,0.1)" },
  barFill: { width: "100%", height: "100%", backgroundColor: T.accent },
});