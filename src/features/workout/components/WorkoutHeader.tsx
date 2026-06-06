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

const T = {
  bg0: "#0A0A0C",
  bg1: "#111114",
  bg2: "#18181D",
  bg3: "#222228",
  lime: "#C8F135",
  text: "#F2F2F5",
  sub: "#7A7A8C",
  muted: "#4A4A58",
  border: "#FFFFFF0F",
  borderMid: "#FFFFFF18",
};

interface WorkoutHeaderProps {
  startTime: number;
  name?: string;
  onFinish: () => void;
  /** Disabled while submitting finish (persisting session). */
  finishDisabled?: boolean;
}

export default function WorkoutHeader({
  startTime,
  name,
  onFinish,
  finishDisabled,
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
      {/* Lime accent bar at top — matches dashboard accent usage */}
      <View style={s.accentBar} />
      <View style={s.inner}>
        {/* Left: live indicator + name + timer */}
        <View style={s.left}>
          <View style={s.liveRow}>
            <Animated.View style={[s.liveDot, { opacity: dotAnim }]} />
            <Text style={s.liveLabel}>LIVE</Text>
          </View>
          <Text style={s.workoutName} numberOfLines={1}>
            {name?.toUpperCase() ?? "WORKOUT"}
          </Text>
          <View style={s.timerRow}>
            <Ionicons name="timer-outline" size={13} color={T.muted} />
            <Text style={s.timerText}>{fmt}</Text>
          </View>
        </View>

        {/* Right: finish button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            onPress={onFinish}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={finishDisabled}
            style={[s.finishBtn, finishDisabled && { opacity: 0.55 }]}
            activeOpacity={1}
          >
            <View style={s.finishHighlight} />
            <Text style={s.finishText}>FINISH</Text>
            <Text style={s.finishSub}>SESSION</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: T.bg2,
    borderBottomWidth: 1,
    borderBottomColor: T.borderMid,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  accentBar: {
    height: 3,
    backgroundColor: T.lime,
    opacity: 0.9,
  },
  inner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 52 : 24,
    paddingBottom: 14,
  },
  left: { flex: 1, marginRight: 16 },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: T.lime,
    marginRight: 6,
  },
  liveLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 10,
    color: T.lime,
    letterSpacing: 2.5,
  },
  workoutName: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 26,
    color: T.text,
    letterSpacing: 0.4,
    lineHeight: 28,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 5,
  },
  timerText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: T.muted,
    letterSpacing: 1,
  },
  finishBtn: {
    backgroundColor: T.lime,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 76,
    overflow: "hidden",
  },
  finishHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  finishText: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 17,
    color: T.bg0,
    letterSpacing: 1.5,
    lineHeight: 18,
  },
  finishSub: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    color: T.bg0,
    letterSpacing: 2,
    opacity: 0.7,
    lineHeight: 12,
  },
});
