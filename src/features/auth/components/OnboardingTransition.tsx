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
const AUTO_ADVANCE_WITH_SUB_MS = 2200;

type TransitionIcon = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

type Props = {
  headline: string;
  /** One short line that explains what the headline means. */
  sub?: string;
  icon: TransitionIcon;
  onContinue: () => void;
  /** Override auto-advance delay (ms). Defaults longer when `sub` is set. */
  durationMs?: number;
};

/**
 * Full-bleed presentation screen for onboarding beats that aren't questions.
 * Auto-advances after a short beat — italic headline + optional context + icon.
 */
export function OnboardingTransition({
  headline,
  sub,
  icon: Icon,
  onContinue,
  durationMs,
}: Props) {
  const resolvedDuration =
    durationMs ?? (sub ? AUTO_ADVANCE_WITH_SUB_MS : AUTO_ADVANCE_MS);
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(16)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const onContinueRef = useRef(onContinue);
  onContinueRef.current = onContinue;

  const line = headline.replace(/\s*\n\s*/g, " ").trim();

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
        duration: resolvedDuration,
        useNativeDriver: false,
      }),
    ]).start();

    const timer = setTimeout(() => {
      onContinueRef.current();
    }, resolvedDuration);

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
          <Text
            style={s.headline}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.55}
            allowFontScaling={false}
          >
            {line}
          </Text>
          {sub ? (
            <Text style={s.sub} numberOfLines={2}>
              {sub}
            </Text>
          ) : null}
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
    width: "100%",
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
    fontFamily: FONTS.blackItalic,
    fontSize: 34,
    color: C.text,
    letterSpacing: -0.5,
    textAlign: "center",
    width: "100%",
    textTransform: "uppercase",
  },
  sub: {
    marginTop: 14,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
    color: C.muted,
    textAlign: "center",
    maxWidth: 340,
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
