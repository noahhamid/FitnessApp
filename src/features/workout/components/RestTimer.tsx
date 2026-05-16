import { COLORS, FONTS } from "@/src/theme";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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

  // Pulse animation when running
  useEffect(() => {
    if (isRunning && !isDone) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
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

  // Countdown logic
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

  // Progress bar animation
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
      // Reset
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

  const progressColor = progressAnim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: ["#FF4444", "#FF9500", "#30D158", "#30D158"],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[s.container, { transform: [{ scale: pulseAnim }] }]}
      >
        {/* Header row */}
        <View style={s.header}>
          <View style={s.labelRow}>
            <View style={[s.dot, isDone && s.dotDone]} />
            <Text style={s.label}>REST</Text>
          </View>
          <Text style={s.hint}>
            {isDone
              ? "TAP TO RESET"
              : isRunning
                ? "TAP TO PAUSE"
                : "TAP TO START"}
          </Text>
        </View>

        {/* Time display */}
        <View style={s.timeRow}>
          <Text style={[s.time, isDone && s.timeDone]}>
            {formatTime(timeLeft)}
          </Text>
          <Text style={s.totalTime}>/ {formatTime(seconds)}</Text>
        </View>

        {/* Progress bar */}
        <View style={s.trackOuter}>
          <Animated.View
            style={[
              s.trackFill,
              {
                width: progressWidth,
                backgroundColor: isDone ? "#30D158" : progressColor,
              },
            ]}
          />
        </View>

        {/* Skip row */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            {isDone ? "✓ Rest complete" : `${timeLeft}s remaining`}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  container: {
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    gap: 14,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
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
    backgroundColor: COLORS.accent,
  },
  dotDone: {
    backgroundColor: "#30D158",
  },
  label: {
    color: COLORS.accent,
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 2,
  },
  hint: {
    color: COLORS.muted,
    fontFamily: FONTS.medium,
    fontSize: 10,
    letterSpacing: 1,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  time: {
    color: COLORS.text ?? "#FFFFFF",
    fontFamily: FONTS.bold,
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -1,
  },
  timeDone: {
    color: "#30D158",
  },
  totalTime: {
    color: COLORS.muted,
    fontFamily: FONTS.medium,
    fontSize: 16,
    marginBottom: 4,
  },
  trackOuter: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    borderRadius: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    color: COLORS.muted,
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
});
