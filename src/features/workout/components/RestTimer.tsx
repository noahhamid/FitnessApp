import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg2: "#1E1E1E", // Card surface
  bg3: "#252525", // Track background
  gold: "#FFC700", // Primary accent
  green: "#30D158", // Done state
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#5A5A5A",
};

type Props = {
  seconds?: number;
  onComplete?: () => void;
};

export function RestTimer({ seconds = 90, onComplete }: Props) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Subtle pulse while running
  useEffect(() => {
    if (isRunning && !isDone) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.025,
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

  // Progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: timeLeft / seconds,
      duration: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);

  const handlePress = () => {
    if (isDone) {
      setTimeLeft(seconds);
      setIsDone(false);
      setIsRunning(false);
      progressAnim.setValue(1);
    } else {
      setIsRunning((r) => !r);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Gold → dims toward red as time runs out; green when done
  const progressColor = progressAnim.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: ["#FF4444", T.gold, T.gold],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const trackColor = isDone ? T.green : progressColor;

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[s.container, { transform: [{ scale: pulseAnim }] }]}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.labelRow}>
            <View style={[s.dot, isDone && s.dotDone]} />
            <Text style={[s.label, isDone && s.labelDone]}>
              {isDone ? "COMPLETE" : "REST"}
            </Text>
          </View>
          <Text style={s.hint}>
            {isDone
              ? "TAP TO RESET"
              : isRunning
                ? "TAP TO PAUSE"
                : "TAP TO START"}
          </Text>
        </View>

        {/* Time */}
        <View style={s.timeRow}>
          <Text style={[s.time, isDone && s.timeDone]}>
            {formatTime(timeLeft)}
          </Text>
          <Text style={s.totalTime}>/ {formatTime(seconds)}</Text>
        </View>

        {/* Progress track */}
        <View style={s.trackOuter}>
          <Animated.View
            style={[
              s.trackFill,
              { width: progressWidth, backgroundColor: trackColor },
            ]}
          />
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={[s.footerText, isDone && s.footerDone]}>
            {isDone ? "✓  Rest complete" : `${timeLeft}s remaining`}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    borderRadius: 20,
    backgroundColor: T.bg2, // #1E1E1E card
    padding: 20,
    gap: 14,
    // Removed: border, colorful shadow — clean flat card
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
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: T.gold, // Gold pulse dot
  },
  dotDone: { backgroundColor: T.green },
  label: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    color: T.gold,
    letterSpacing: 2,
  },
  labelDone: { color: T.green },
  hint: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
    letterSpacing: 1,
  },

  // Time display
  timeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  time: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 52, // Bigger — hero number
    lineHeight: 56,
    letterSpacing: -1,
    color: T.text,
  },
  timeDone: { color: T.green },
  totalTime: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    color: T.muted,
    marginBottom: 6,
  },

  // Progress bar — thicker for better visibility
  trackOuter: {
    height: 5,
    borderRadius: 3,
    backgroundColor: T.bg3,
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    borderRadius: 3,
  },

  // Footer
  footer: { flexDirection: "row", justifyContent: "space-between" },
  footerText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.muted,
  },
  footerDone: { color: T.green },
});
