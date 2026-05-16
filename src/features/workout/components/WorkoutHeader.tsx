import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Fixed: import directly from tokens, not from @/src/theme
import { COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";

interface WorkoutHeaderProps {
  startTime: number;
  name?: string;
  onFinish: () => void;
}

export default function WorkoutHeader({
  startTime,
  name,
  onFinish,
}: WorkoutHeaderProps) {
  const [elapsed, setElapsed] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, {
          toValue: 0.2,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [dotAnim]);

  const handlePressIn = () =>
    Animated.spring(pulseAnim, {
      toValue: 0.94,
      useNativeDriver: true,
    }).start();

  const handlePressOut = () =>
    Animated.spring(pulseAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const sec = elapsed % 60;
  const fmt =
    h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
      : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;

  return (
    <View style={s.container}>
      <View style={s.accentBar} />
      <View style={s.inner}>
        {/* Left: workout info */}
        <View style={s.leftBlock}>
          <View style={s.liveRow}>
            <Animated.View style={[s.liveDot, { opacity: dotAnim }]} />
            <Text style={s.liveLabel}>LIVE</Text>
          </View>

          <Text style={s.workoutName} numberOfLines={1}>
            {name?.toUpperCase() ?? "WORKOUT"}
          </Text>

          {/* Fixed: was emoji ⏱ — now Ionicons */}
          <View style={s.timerRow}>
            <Ionicons name="timer-outline" size={13} color={COLORS.muted} />
            <Text style={s.timerText}>{fmt}</Text>
          </View>
        </View>

        {/* Right: finish button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            onPress={onFinish}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={s.finishBtn}
            activeOpacity={1}
          >
            <View style={s.finishBtnHighlight} />
            <Text style={s.finishBtnText}>FINISH</Text>
            <Text style={s.finishBtnSub}>SESSION</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bg2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  accentBar: {
    height: 3,
    backgroundColor: COLORS.accent,
    opacity: 0.9,
  },
  inner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 52 : 24,
    paddingBottom: 16,
  },
  leftBlock: {
    flex: 1,
    marginRight: 16,
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginRight: 6,
  },
  liveLabel: {
    // Fixed: FONTS.medium directly — no ?? fallback needed
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.accent,
    letterSpacing: 2.5,
  },
  workoutName: {
    fontFamily: FONTS.black,
    fontSize: 28,
    color: COLORS.text,
    letterSpacing: 0.5,
    lineHeight: 30,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 5,
  },
  timerText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.muted,
    letterSpacing: 1,
  },
  finishBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 76,
    overflow: "hidden",
    position: "relative",
  },
  finishBtnHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  finishBtnText: {
    fontFamily: FONTS.black,
    fontSize: 17,
    color: COLORS.bg,
    letterSpacing: 1.5,
    lineHeight: 18,
  },
  finishBtnSub: {
    fontFamily: FONTS.medium,
    fontSize: 9,
    color: COLORS.bg,
    letterSpacing: 2,
    opacity: 0.7,
    lineHeight: 12,
  },
});
