import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const T = {
  bg0: "#0A0A0C",
  bg1: "#111114",
  bg2: "#18181D",
  bg3: "#222228",
  lime: "#C8F135",
  blue: "#3B82F6",
  text: "#F2F2F5",
  sub: "#7A7A8C",
  muted: "#4A4A58",
  border: "#FFFFFF0F",
  borderMid: "#FFFFFF18",
};

export interface WorkoutHeaderProps {
  startTime: number;
  name: string;
  onNameChange: (v: string) => void;
  onFinish: () => void;
  finishDisabled?: boolean;
  /** Back = same as finish (shows confirm dialog). */
  onBack: () => void;
  totalVolume: number;
  completedSets: number;
  totalSets: number;
  exerciseCount: number;
}

export default function WorkoutHeader({
  startTime,
  name,
  onNameChange,
  onFinish,
  finishDisabled,
  onBack,
  totalVolume,
  completedSets,
  totalSets,
  exerciseCount,
}: WorkoutHeaderProps) {
  const [elapsed, setElapsed] = useState(0);
  const [editingName, setEditingName] = useState(false);

  const dotAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Live timer
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  // Pulsing live dot
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 0.25, duration: 750, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [dotAnim]);

  const handleFinishPressIn = () =>
    Animated.spring(pulseAnim, { toValue: 0.93, useNativeDriver: true }).start();
  const handleFinishPressOut = () =>
    Animated.spring(pulseAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();

  // Format elapsed time
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const sec = elapsed % 60;
  const fmt = h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;

  // Volume display
  const volDisplay =
    totalVolume >= 1000
      ? `${(totalVolume / 1000).toFixed(1)}t`
      : totalVolume > 0
        ? `${Math.round(totalVolume)}kg`
        : "0";

  return (
    <View style={s.container}>
      {/* ── ROW 1: back ← | timer | FINISH ── */}
      <View style={s.topRow}>
        {/* Left: back/cancel button */}
        <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={18} color={T.text} />
        </TouchableOpacity>

        {/* Center: animated timer capsule */}
        <View style={s.timerCapsule}>
          <Animated.View style={[s.liveDot, { opacity: dotAnim }]} />
          <Text style={s.timerText}>{fmt}</Text>
        </View>

        {/* Right: FINISH capsule */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            onPress={onFinish}
            onPressIn={handleFinishPressIn}
            onPressOut={handleFinishPressOut}
            disabled={finishDisabled}
            style={[s.finishBtn, finishDisabled && { opacity: 0.55 }]}
            activeOpacity={1}
          >
            <Text style={s.finishText}>FINISH</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* ── ROW 2: workout name + EDIT badge ── */}
      <View style={s.nameRow}>
        {editingName ? (
          <TextInput
            value={name}
            onChangeText={onNameChange}
            onBlur={() => setEditingName(false)}
            autoFocus
            style={s.nameInput}
            placeholderTextColor={T.muted}
            placeholder="Workout name"
          />
        ) : (
          <TouchableOpacity
            onPress={() => setEditingName(true)}
            style={s.nameTouchable}
            activeOpacity={0.7}
          >
            <Text style={s.nameText} numberOfLines={1}>
              {name.toUpperCase()}
            </Text>
            <View style={s.editBadge}>
              <Ionicons name="pencil-outline" size={9} color={T.muted} />
              <Text style={s.editBadgeText}>EDIT</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* ── ROW 3: VOLUME | SETS | EXERCISES metrics ── */}
      <View style={s.metricsRow}>
        <View style={s.metricCell}>
          <Text style={[s.metricValue, { color: T.lime }]}>{volDisplay}</Text>
          <Text style={s.metricLabel}>VOLUME</Text>
        </View>
        <View style={s.metricDivider} />
        <View style={s.metricCell}>
          <Text style={s.metricValue}>{completedSets}/{totalSets}</Text>
          <Text style={s.metricLabel}>SETS</Text>
        </View>
        <View style={s.metricDivider} />
        <View style={s.metricCell}>
          <Text style={s.metricValue}>{exerciseCount}</Text>
          <Text style={s.metricLabel}>EXERCISES</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: T.bg1,
    borderBottomWidth: 1,
    borderBottomColor: T.borderMid,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // ── Row 1 ────────────────────────────────────────────────────────────────────
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.bg3,
    borderWidth: 1,
    borderColor: T.borderMid,
    alignItems: "center",
    justifyContent: "center",
  },
  timerCapsule: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: T.bg2,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: T.borderMid,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: T.lime,
  },
  timerText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 16,
    color: T.text,
    letterSpacing: 1.8,
  },
  finishBtn: {
    backgroundColor: T.lime,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: T.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  finishText: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 15,
    color: T.bg0,
    letterSpacing: 1.5,
  },

  // ── Row 2 (name) ─────────────────────────────────────────────────────────────
  nameRow: {
    flexShrink: 1,
  },
  nameTouchable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  nameText: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 30,
    color: T.text,
    letterSpacing: 0.5,
    lineHeight: 32,
    flexShrink: 1,
  },
  editBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: T.bg3,
    borderWidth: 1,
    borderColor: T.borderMid,
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  editBadgeText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    color: T.muted,
    letterSpacing: 1.5,
  },
  nameInput: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 30,
    color: T.text,
    borderBottomWidth: 2,
    borderBottomColor: T.lime,
    paddingBottom: 4,
    paddingTop: 0,
  },

  // ── Row 3 (metrics) ──────────────────────────────────────────────────────────
  metricsRow: {
    flexDirection: "row",
    backgroundColor: T.bg2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border,
    overflow: "hidden",
  },
  metricCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    gap: 2,
  },
  metricDivider: {
    width: 1,
    backgroundColor: T.border,
    marginVertical: 8,
  },
  metricValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 20,
    color: T.text,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  metricLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    color: T.muted,
    letterSpacing: 0.8,
  },
});
