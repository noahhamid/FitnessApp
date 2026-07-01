import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ── Design Tokens — "Muscle Monster" Theme ─────────────────────────────────
const T = {
  bg: "#121212", // Deep matte charcoal — sheet/screen surface
  card: "#1E1E1E", // Card surface
  pill: "#282828", // Secondary control pill background
  track: "#2A2A2A", // Progress track background
  gold: "#FFC700", // Primary accent
  green: "#30D158", // Done state
  red: "#FF4444", // Urgency state
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#5A5A5A",
};

type Props = {
  seconds?: number;
  nextUpLabel?: string; // e.g. "Next up: Set 2 · Bench Press"
  onComplete?: () => void;
  onSkip?: () => void;
};

const STEP = 30; // Micro-adjustment increment (seconds)

export function RestTimer({
  seconds = 90,
  nextUpLabel,
  onComplete,
  onSkip,
}: Props) {
  const [duration, setDuration] = useState(seconds);
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isRunning, setIsRunning] = useState(true);
  const [isDone, setIsDone] = useState(false);

  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Subtle pulse on the giant countdown while running
  useEffect(() => {
    if (isRunning && !isDone) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRunning, isDone]);

  // Countdown
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            setIsDone(true);
            onComplete?.();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Progress track animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: duration > 0 ? timeLeft / duration : 0,
      duration: 350,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [timeLeft, duration]);

  const togglePause = () => setIsRunning((r) => !r);

  const adjustTime = (delta: number) => {
    if (isDone) return;
    setTimeLeft((t) => Math.max(0, t + delta));
    setDuration((d) => Math.max(1, d + t_overflowGuard(delta)));
  };

  // Keep the "total" reference growing with +30 so the bar reads sensibly,
  // but never shrink it below what's already elapsed on -30.
  function t_overflowGuard(delta: number) {
    return delta > 0 ? delta : 0;
  }

  const handleSkip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsDone(true);
    setTimeLeft(0);
    onSkip?.();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Gold while comfortable, shifts to red as the clock runs low; green when done
  const progressColor = progressAnim.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [T.red, T.gold, T.gold],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const trackFillColor = isDone ? T.green : progressColor;

  return (
    <View style={s.screen}>
      <Animated.View
        style={[s.container, { transform: [{ scale: pulseAnim }] }]}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.labelRow}>
            <View style={[s.dot, isDone && s.dotDone]} />
            <Text style={[s.label, isDone && s.labelDone]}>
              {isDone ? "REST COMPLETE" : "RESTING"}
            </Text>
          </View>
          {!!nextUpLabel && <Text style={s.nextUp}>{nextUpLabel}</Text>}
        </View>

        {/* Giant countdown */}
        <Pressable onPress={togglePause} disabled={isDone} hitSlop={12}>
          <View style={s.timeRow}>
            <Text style={[s.time, isDone && s.timeDone]}>
              {formatTime(timeLeft)}
            </Text>
          </View>
          <Text style={s.tapHint}>
            {isDone ? " " : isRunning ? "TAP TO PAUSE" : "TAP TO RESUME"}
          </Text>
        </Pressable>

        {/* Progress track */}
        <View style={s.trackOuter}>
          <Animated.View
            style={[
              s.trackFill,
              { width: progressWidth, backgroundColor: trackFillColor },
            ]}
          />
        </View>

        {/* Tactical micro-adjustments */}
        <View style={s.adjustRow}>
          <Pressable
            style={({ pressed }) => [s.pill, pressed && s.pillPressed]}
            onPress={() => adjustTime(-STEP)}
            disabled={isDone}
          >
            <Text style={s.pillText}>−{STEP}s</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [s.pill, pressed && s.pillPressed]}
            onPress={() => adjustTime(STEP)}
            disabled={isDone}
          >
            <Text style={[s.pillText, s.pillTextGold]}>+{STEP}s</Text>
          </Pressable>
        </View>

        {/* Clean action anchor */}
        <Pressable
          style={({ pressed }) => [s.skipButton, pressed && s.skipPressed]}
          onPress={handleSkip}
          disabled={isDone}
        >
          <Text style={s.skipText}>{isDone ? "NEXT SET →" : "SKIP TIMER"}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: {
    backgroundColor: T.bg,
    padding: 16,
  },

  container: {
    borderRadius: 24,
    backgroundColor: T.card,
    paddingVertical: 28,
    paddingHorizontal: 24,
    gap: 20,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.gold,
  },
  dotDone: { backgroundColor: T.green },
  label: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.gold,
    letterSpacing: 2.5,
  },
  labelDone: { color: T.green },
  nextUp: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.sub,
    maxWidth: 160,
    textAlign: "right",
  },

  // Giant countdown
  timeRow: {
    alignItems: "center",
    justifyContent: "center",
  },
  time: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 96,
    lineHeight: 100,
    letterSpacing: -2,
    color: T.gold,
    textAlign: "center",
  },
  timeDone: { color: T.green },
  tapHint: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
    letterSpacing: 1.5,
    textAlign: "center",
    marginTop: 4,
  },

  // Progress track
  trackOuter: {
    height: 8,
    borderRadius: 4,
    backgroundColor: T.track,
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    borderRadius: 4,
  },

  // Micro-adjustment pills
  adjustRow: {
    flexDirection: "row",
    gap: 12,
  },
  pill: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: T.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  pillPressed: {
    opacity: 0.7,
  },
  pillText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 18,
    letterSpacing: 1,
    color: T.text,
  },
  pillTextGold: {
    color: T.gold,
  },

  // Skip / action anchor
  skipButton: {
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: T.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  skipPressed: {
    opacity: 0.85,
  },
  skipText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 16,
    letterSpacing: 2,
    color: "#121212",
  },
});
