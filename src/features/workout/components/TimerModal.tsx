import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  Platform,
} from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg0: "#121212",
  bg2: "#1E1E1E", // Sheet surface
  bg3: "#252525", // Preset / secondary button surface
  gold: "#FFC700", // Primary accent
  red: "#FF453A", // Low-time urgency
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#5A5A5A",
  track: "#2A2A2A", // SVG ring track
};

const PRESETS = [60, 90, 120, 180] as const;

type Props = {
  visible: boolean;
  onClose: () => void;
  defaultSeconds?: number;
  onComplete?: () => void;
};

export default function TimerModal({
  visible,
  onClose,
  defaultSeconds = 90,
  onComplete,
}: Props) {
  const [total, setTotal] = useState(defaultSeconds);
  const [remain, setRemain] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sheetAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const doneAnim = useRef(new Animated.Value(0)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  // Sheet open/close
  useEffect(() => {
    if (visible) {
      setRemain(total);
      setRunning(false);
      doneAnim.setValue(0);
      Animated.spring(sheetAnim, {
        toValue: 1,
        damping: 22,
        stiffness: 260,
        useNativeDriver: true,
      }).start();
    } else {
      sheetAnim.setValue(0);
      clearInterval(intervalRef.current!);
    }
  }, [visible]);

  // Pulse while running
  useEffect(() => {
    if (running) {
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
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
      );
      pulseLoopRef.current.start();
    } else {
      pulseLoopRef.current?.stop();
      Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true }).start();
    }
  }, [running]);

  // Countdown
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemain((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            // Done flash sequence
            Animated.sequence([
              Animated.timing(doneAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(doneAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(doneAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(doneAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(doneAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start();
            onComplete?.();
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [running]);

  const isDone = remain === 0;
  const pct = remain / total;

  // SVG ring
  const SIZE = 220;
  const R = 96;
  const STROKE = 9;
  const circ = 2 * Math.PI * R;
  const dashOffset = circ * (1 - pct);

  // Gold → red as time runs low
  const ringColor = isDone ? T.gold : pct > 0.3 ? T.gold : T.red;

  const mins = String(Math.floor(remain / 60)).padStart(2, "0");
  const secs = String(remain % 60).padStart(2, "0");

  const handlePreset = (sec: number) => {
    setTotal(sec);
    setRemain(sec);
    setRunning(false);
    doneAnim.setValue(0);
  };

  const handleReset = () => {
    setRemain(total);
    setRunning(false);
    doneAnim.setValue(0);
  };

  const sheetTranslate = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  const doneOpacity = doneAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.1], // Subtle gold flash — not blinding
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={s.overlay} onPress={onClose}>
        <Animated.View
          style={[
            s.backdrop,
            {
              opacity: sheetAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ]}
        />
      </Pressable>

      <Animated.View
        style={[s.sheet, { transform: [{ translateY: sheetTranslate }] }]}
      >
        {/* Gold done flash overlay */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            s.doneFlash,
            { opacity: doneOpacity },
          ]}
        />

        {/* Handle */}
        <View style={s.handleRow}>
          <View style={s.handle} />
        </View>

        {/* Title */}
        <View style={s.titleRow}>
          <Text style={s.titleLabel}>REST TIMER</Text>
          <Pressable onPress={onClose} hitSlop={12} style={s.closeX}>
            <Text style={s.closeXText}>✕</Text>
          </Pressable>
        </View>

        {/* Ring */}
        <Animated.View
          style={[s.ringWrapper, { transform: [{ scale: pulseAnim }] }]}
        >
          <Svg
            width={SIZE}
            height={SIZE}
            style={{ transform: [{ rotate: "-90deg" }] }}
          >
            <Defs>
              <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor={ringColor} stopOpacity="1" />
                <Stop offset="100%" stopColor={ringColor} stopOpacity="0.6" />
              </LinearGradient>
            </Defs>

            {/* Track */}
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke={T.track}
              strokeWidth={STROKE}
            />
            {/* Progress arc */}
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${circ}`}
              strokeDashoffset={`${dashOffset}`}
            />
          </Svg>

          {/* Center content */}
          <View style={[s.ringCenter, { width: SIZE, height: SIZE }]}>
            <Text style={[s.timeValue, isDone && s.timeValueDone]}>
              {mins}:{secs}
            </Text>
            <Text style={s.timeSub}>
              {isDone ? "✓  DONE" : running ? "REMAINING" : "PAUSED"}
            </Text>
            {!isDone && (
              <Text style={s.pctLabel}>{Math.round(pct * 100)}%</Text>
            )}
          </View>
        </Animated.View>

        {/* Preset chips */}
        <View style={s.presetRow}>
          {PRESETS.map((sec) => (
            <TouchableOpacity
              key={sec}
              onPress={() => handlePreset(sec)}
              style={[s.preset, total === sec && s.presetActive]}
              activeOpacity={0.75}
            >
              <Text style={[s.presetText, total === sec && s.presetTextActive]}>
                {sec < 60 ? `${sec}s` : `${sec / 60}m`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Controls */}
        <View style={s.controls}>
          <TouchableOpacity
            onPress={handleReset}
            style={s.btnSecondary}
            activeOpacity={0.75}
          >
            <Text style={s.btnSecondaryText}>↺ RESET</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => !isDone && setRunning((r) => !r)}
            style={[s.btnPrimary, running && s.btnPause, isDone && s.btnDone]}
            activeOpacity={0.8}
          >
            <Text style={s.btnPrimaryText}>
              {isDone ? "✓  COMPLETE" : running ? "⏸  PAUSE" : "▶  START"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.72)",
  },

  // Sheet
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: T.bg2,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 44 : 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20,
  },

  // Gold flash on complete
  doneFlash: {
    backgroundColor: T.gold,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  // Handle
  handleRow: { alignItems: "center", paddingTop: 12, paddingBottom: 8 },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.bg3,
  },

  // Title
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    position: "relative",
  },
  titleLabel: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 18,
    color: T.text,
    letterSpacing: 3,
    textAlign: "center",
  },
  closeX: { position: "absolute", right: 0, padding: 4 },
  closeXText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: T.muted,
  },

  // Ring
  ringWrapper: { alignItems: "center", marginVertical: 20 },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  timeValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 58,
    color: T.text,
    letterSpacing: -1,
    lineHeight: 62,
  },
  timeValueDone: { color: T.gold }, // Gold on completion
  timeSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
    letterSpacing: 2,
  },
  pctLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.muted,
    marginTop: 4,
    letterSpacing: 1,
  },

  // Preset chips
  presetRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  preset: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: T.bg3,
    alignItems: "center",
    // No border on inactive
  },
  presetActive: {
    backgroundColor: T.gold, // Solid gold fill when active
  },
  presetText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: T.muted,
    letterSpacing: 0.5,
  },
  presetTextActive: {
    color: T.bg0, // Dark text on gold
  },

  // Control buttons
  controls: { flexDirection: "row", gap: 10 },
  btnSecondary: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: T.bg3,
    alignItems: "center",
    // No border
  },
  btnSecondaryText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: T.sub,
    letterSpacing: 1,
  },
  btnPrimary: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: T.gold, // Gold START
    alignItems: "center",
  },
  btnPause: {
    backgroundColor: T.bg3, // Neutral gray when paused — not orange
  },
  btnDone: {
    backgroundColor: T.gold,
    opacity: 0.85,
  },
  btnPrimaryText: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 16,
    color: T.bg0, // Dark on gold
    letterSpacing: 1.5,
  },
});
