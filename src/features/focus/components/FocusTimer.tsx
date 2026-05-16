import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

// Fixed: import directly from tokens, NOT from @/src/theme
import { COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";

// ── Types ─────────────────────────────────────────────────────────────────────

type Mode = {
  id: string;
  label: string;
  seconds: number;
};

type Props = {
  onSessionComplete?: () => void;
};

// ── Modes ─────────────────────────────────────────────────────────────────────

const MODES: Mode[] = [
  { id: "focus", label: "FOCUS", seconds: 25 * 60 },
  { id: "short", label: "SHORT", seconds: 5 * 60 },
  { id: "long", label: "LONG", seconds: 15 * 60 },
];

// ── SVG Ring constants ────────────────────────────────────────────────────────

const RING_SIZE = 220;
const RING_STROKE = 10;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_R;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Mode pill ─────────────────────────────────────────────────────────────────

type ModePillProps = {
  mode: Mode;
  active: boolean;
  onPress: () => void;
};

function ModePill({ mode, active, onPress }: ModePillProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[s.modePill, active && s.modePillActive]}
    >
      <Text style={[s.modePillText, active && s.modePillTextActive]}>
        {mode.label}
      </Text>
    </TouchableOpacity>
  );
}

// ── Control button ────────────────────────────────────────────────────────────

type ControlBtnProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  primary?: boolean;
  size?: number;
};

function ControlBtn({
  iconName,
  onPress,
  primary = false,
  size = 22,
}: ControlBtnProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.92, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={[s.controlBtn, primary && s.controlBtnPrimary]}
      >
        <Ionicons
          name={iconName}
          size={primary ? size + 6 : size}
          color={primary ? COLORS.bg : COLORS.text}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function FocusTimer({ onSessionComplete }: Props) {
  const [modeIdx, setModeIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(MODES[0].seconds);
  const [completed, setCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const totalSeconds = MODES[modeIdx].seconds;
  const progress = remaining / totalSeconds;
  const dashOffset = RING_CIRC * progress;

  // Pulse animation when running
  useEffect(() => {
    if (running) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    return () => pulseLoop.current?.stop();
  }, [running]);

  // Countdown tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setCompleted((c) => c + 1);
            onSessionComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [running]);

  const handleStartPause = useCallback(() => {
    if (remaining === 0) return;
    setRunning((r) => !r);
  }, [remaining]);

  const handleReset = useCallback(() => {
    setRunning(false);
    setRemaining(MODES[modeIdx].seconds);
  }, [modeIdx]);

  const handleModeChange = useCallback((idx: number) => {
    setRunning(false);
    setModeIdx(idx);
    setRemaining(MODES[idx].seconds);
  }, []);

  const isComplete = remaining === 0;
  const ringColor = isComplete
    ? COLORS.accent
    : running
      ? COLORS.accent
      : COLORS.muted;

  return (
    <View style={s.wrap}>
      {/* Mode selector */}
      <View style={s.modeRow}>
        {MODES.map((m, i) => (
          <ModePill
            key={m.id}
            mode={m}
            active={modeIdx === i}
            onPress={() => handleModeChange(i)}
          />
        ))}
      </View>

      {/* Ring + time */}
      <View style={s.ringWrap}>
        {/* Outer glow effect when running */}
        {running && (
          <Animated.View
            style={[s.ringGlow, { transform: [{ scale: pulseAnim }] }]}
          />
        )}

        <Svg
          width={RING_SIZE}
          height={RING_SIZE}
          style={{ transform: [{ rotate: "-90deg" }] }}
        >
          {/* Track */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_R}
            fill="none"
            stroke={COLORS.border}
            strokeWidth={RING_STROKE}
          />
          {/* Progress */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_R}
            fill="none"
            stroke={ringColor}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={`${RING_CIRC}`}
            strokeDashoffset={`${dashOffset}`}
          />
        </Svg>

        {/* Centre content */}
        <View style={s.ringCenter}>
          {running && (
            <View style={s.liveDotRow}>
              <View style={s.liveDot} />
              <Text style={s.liveLabel}>LIVE</Text>
            </View>
          )}

          <Text style={[s.timeText, isComplete && { color: COLORS.accent }]}>
            {isComplete ? "DONE!" : formatTime(remaining)}
          </Text>

          <Text style={s.modeLabel}>{MODES[modeIdx].label} SESSION</Text>

          {completed > 0 && (
            <View style={s.completedPill}>
              <Ionicons
                name="checkmark-circle"
                size={11}
                color={COLORS.accent}
              />
              <Text style={s.completedText}>{completed} done</Text>
            </View>
          )}
        </View>
      </View>

      {/* Controls */}
      <View style={s.controls}>
        <ControlBtn iconName="refresh" onPress={handleReset} />
        <ControlBtn
          iconName={running ? "pause" : isComplete ? "checkmark" : "play"}
          onPress={handleStartPause}
          primary
          size={28}
        />
        <ControlBtn iconName="stats-chart-outline" onPress={() => {}} />
      </View>

      {/* Progress hint */}
      <Text style={s.hint}>
        {running
          ? `${Math.round((1 - progress) * 100)}% complete — stay locked in`
          : isComplete
            ? "Session complete. Take a break!"
            : "Press play to start your focus session"}
      </Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: 8,
    gap: 24,
  },

  // Mode selector
  modeRow: {
    flexDirection: "row",
    backgroundColor: COLORS.bg3,
    borderRadius: 12,
    padding: 3,
    gap: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modePill: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 9,
  },
  modePillActive: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modePillText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 1.2,
  },
  modePillTextActive: { color: COLORS.accent },

  // Ring
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ringGlow: {
    position: "absolute",
    width: RING_SIZE + 20,
    height: RING_SIZE + 20,
    borderRadius: (RING_SIZE + 20) / 2,
    backgroundColor: `${COLORS.accent}08`,
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
    gap: 4,
  },
  liveDotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  liveLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.accent,
    letterSpacing: 2,
  },
  timeText: {
    fontFamily: FONTS.black,
    fontSize: 52,
    color: COLORS.text,
    letterSpacing: 2,
    lineHeight: 56,
  },
  modeLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.muted,
    letterSpacing: 2,
    marginTop: 2,
  },
  completedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${COLORS.accent}18`,
    borderWidth: 1,
    borderColor: `${COLORS.accent}30`,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  completedText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.accent,
  },

  // Controls
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  controlBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.bg3,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  controlBtnPrimary: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  // Hint
  hint: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
    textAlign: "center",
    letterSpacing: 0.2,
    paddingHorizontal: 24,
  },
});
