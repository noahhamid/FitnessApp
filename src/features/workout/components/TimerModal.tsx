import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
  Platform,
} from "react-native";

// ── Design Tokens — "Muscle Monster" Theme ─────────────────────────────────
const T = {
  bg0: "#121212",
  bg2: "#1E1E1E", // Sheet surface
  bg3: "#282828", // Preset / secondary pill surface
  gold: "#FFC700", // Primary accent
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#5A5A5A",
};

// Preset grid — value in seconds, label as shown to the user
const PRESETS = [
  { seconds: 30, label: "30s" },
  { seconds: 60, label: "60s" },
  { seconds: 90, label: "90s" },
  { seconds: 120, label: "2m" },
  { seconds: 180, label: "3m" },
] as const;

const SEC_STEP = 5;
const MAX_MINUTES = 15;

type Props = {
  visible: boolean;
  onClose: () => void;
  initialSeconds?: number;
  onSave?: (seconds: number) => void;
};

export default function TimerModal({
  visible,
  onClose,
  initialSeconds = 90,
  onSave,
}: Props) {
  const [minutes, setMinutes] = useState(Math.floor(initialSeconds / 60));
  const [seconds, setSeconds] = useState(initialSeconds % 60);

  const sheetAnim = useRef(new Animated.Value(0)).current;

  // Sheet open/close
  useEffect(() => {
    if (visible) {
      setMinutes(Math.floor(initialSeconds / 60));
      setSeconds(initialSeconds % 60);
      Animated.spring(sheetAnim, {
        toValue: 1,
        damping: 22,
        stiffness: 260,
        useNativeDriver: true,
      }).start();
    } else {
      sheetAnim.setValue(0);
    }
  }, [visible]);

  const total = minutes * 60 + seconds;

  const clampMinutes = (m: number) => Math.max(0, Math.min(MAX_MINUTES, m));
  const clampSeconds = (s: number) => ((s % 60) + 60) % 60;

  const adjustMinutes = (delta: number) =>
    setMinutes((m) => clampMinutes(m + delta));

  const adjustSeconds = (delta: number) => {
    setSeconds((s) => {
      const next = s + delta;
      if (next >= 60) {
        setMinutes((m) => clampMinutes(m + 1));
        return next - 60;
      }
      if (next < 0) {
        if (minutes > 0) {
          setMinutes((m) => clampMinutes(m - 1));
          return 60 + next;
        }
        return 0;
      }
      return next;
    });
  };

  const applyPreset = (sec: number) => {
    setMinutes(Math.floor(sec / 60));
    setSeconds(sec % 60);
  };

  const handleSave = () => {
    onSave?.(total);
    onClose();
  };

  const sheetTranslate = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
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
        {/* Handle */}
        <View style={s.handleRow}>
          <View style={s.handle} />
        </View>

        {/* Title */}
        <View style={s.titleRow}>
          <Text style={s.titleLabel}>SET REST TIME</Text>
          <Pressable onPress={onClose} hitSlop={12} style={s.closeX}>
            <Text style={s.closeXText}>✕</Text>
          </Pressable>
        </View>

        {/* Premium time dial */}
        <View style={s.dialRow}>
          {/* Minutes dial */}
          <View style={s.dialCol}>
            <Pressable
              onPress={() => adjustMinutes(1)}
              hitSlop={10}
              style={s.stepBtn}
            >
              <Text style={s.stepArrow}>▲</Text>
            </Pressable>
            <Text style={s.dialValue}>{String(minutes).padStart(2, "0")}</Text>
            <Pressable
              onPress={() => adjustMinutes(-1)}
              hitSlop={10}
              style={s.stepBtn}
            >
              <Text style={s.stepArrow}>▼</Text>
            </Pressable>
            <Text style={s.unitLabel}>MINUTES</Text>
          </View>

          <Text style={s.dialColon}>:</Text>

          {/* Seconds dial */}
          <View style={s.dialCol}>
            <Pressable
              onPress={() => adjustSeconds(SEC_STEP)}
              hitSlop={10}
              style={s.stepBtn}
            >
              <Text style={s.stepArrow}>▲</Text>
            </Pressable>
            <Text style={s.dialValue}>{String(seconds).padStart(2, "0")}</Text>
            <Pressable
              onPress={() => adjustSeconds(-SEC_STEP)}
              hitSlop={10}
              style={s.stepBtn}
            >
              <Text style={s.stepArrow}>▼</Text>
            </Pressable>
            <Text style={s.unitLabel}>SECONDS</Text>
          </View>
        </View>

        {/* Quick-tap preset grid */}
        <View style={s.presetRow}>
          {PRESETS.map((p) => (
            <TouchableOpacity
              key={p.seconds}
              onPress={() => applyPreset(p.seconds)}
              style={[s.preset, total === p.seconds && s.presetActive]}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  s.presetText,
                  total === p.seconds && s.presetTextActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Confirm action — full width, solid gold, commanding */}
        <TouchableOpacity
          onPress={handleSave}
          style={[s.saveBtn, total === 0 && s.saveBtnDisabled]}
          activeOpacity={0.85}
          disabled={total === 0}
        >
          <Text style={s.saveBtnText}>SET TIMER</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────
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
    marginBottom: 8,
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

  // Time dial — mechanical, stopwatch-inspired
  dialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    marginVertical: 24,
  },
  dialCol: {
    alignItems: "center",
    gap: 4,
  },
  stepBtn: {
    width: 44,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  stepArrow: {
    color: T.muted,
    fontSize: 13,
  },
  dialValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 64,
    lineHeight: 68,
    color: T.text,
    letterSpacing: -1,
    minWidth: 88,
    textAlign: "center",
  },
  dialColon: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 48,
    color: T.muted,
    marginTop: -20,
  },
  unitLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 10,
    color: T.sub,
    letterSpacing: 2,
    marginTop: 2,
  },

  // Preset chips — borderless, gold when active
  presetRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  preset: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: T.bg3, // #282828
    alignItems: "center",
  },
  presetActive: {
    backgroundColor: T.gold,
  },
  presetText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 14,
    color: T.sub,
    letterSpacing: 0.5,
  },
  presetTextActive: {
    color: T.bg0, // Dark text on gold
  },

  // Confirm — full-width solid gold block
  saveBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: T.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 17,
    color: T.bg0, // Dark, thick typography on gold
    letterSpacing: 2,
  },
});
