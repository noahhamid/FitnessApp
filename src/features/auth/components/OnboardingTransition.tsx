import { C, FONTS } from "@/src/ui/tokens";
import { useEffect, useRef, type ComponentType } from "react";
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AUTO_ADVANCE_MS = 1000;

type TransitionIcon = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

type Props = {
  headline: string;
  icon: TransitionIcon;
  onContinue: () => void;
  /** Override auto-advance delay (ms). Defaults to 1s. */
  durationMs?: number;
};

/**
 * Full-bleed presentation screen for onboarding beats that aren't questions.
 * Auto-advances after a short beat — headline + icon only.
 */
export function OnboardingTransition({
  headline,
  icon: Icon,
  onContinue,
  durationMs = AUTO_ADVANCE_MS,
}: Props) {
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(16)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const onContinueRef = useRef(onContinue);
  onContinueRef.current = onContinue;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: 1,
        duration: durationMs,
        useNativeDriver: false,
      }),
    ]).start();

    const timer = setTimeout(() => {
      onContinueRef.current();
    }, durationMs);

    return () => clearTimeout(timer);
    // Intentionally once on mount — callers often pass an inline onContinue.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={s.content}>
        <View style={{ flex: 1 }} />

        <Animated.View
          style={[s.center, { opacity: fade, transform: [{ translateY: rise }] }]}
        >
          <View style={s.iconWrap}>
            <Icon size={42} color={C.accent} strokeWidth={2.2} />
          </View>
          <Text style={s.headline}>{headline}</Text>
        </Animated.View>

        <View style={{ flex: 1 }} />

        <View style={s.progressTrack}>
          <Animated.View style={[s.progressFill, { width: barWidth }]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { flex: 1, paddingHorizontal: 24, paddingBottom: 24 },
  center: {
    alignItems: "center",
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(229, 57, 53, 0.12)",
    marginBottom: 22,
  },
  headline: {
    fontFamily: FONTS.black,
    fontSize: 34,
    lineHeight: 37,
    color: C.text,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: C.bg3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: C.accent,
  },
});
