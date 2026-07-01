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

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg0: "#121212",
  bg2: "#1E1E1E",
  bg3: "#252525",
  gold: "#FFC700",
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#5A5A5A",
};

export interface WorkoutHeaderProps {
  startTime: number;
  name: string;
  onNameChange: (v: string) => void;
  onFinish: () => void;
  finishDisabled?: boolean;
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
        Animated.timing(dotAnim, {
          toValue: 0.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [dotAnim]);

  // Finish button press animation
  const handleFinishPressIn = () =>
    Animated.spring(pulseAnim, {
      toValue: 0.93,
      useNativeDriver: true,
    }).start();
  const handleFinishPressOut = () =>
    Animated.spring(pulseAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();

  // Format elapsed
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const sec = elapsed % 60;
  const fmt =
    h > 0
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
      {/* ── ROW 1: back | timer | FINISH ── */}
      <View style={s.topRow}>
        {/* Back button — borderless circle */}
        <TouchableOpacity
          onPress={onBack}
          style={s.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={18} color={T.sub} />
        </TouchableOpacity>

        {/* Timer capsule — borderless dark pill */}
        <View style={s.timerCapsule}>
          <Animated.View style={[s.liveDot, { opacity: dotAnim }]} />
          <Text style={s.timerText}>{fmt}</Text>
        </View>

        {/* FINISH — solid gold CTA */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            onPress={onFinish}
            onPressIn={handleFinishPressIn}
            onPressOut={handleFinishPressOut}
            disabled={finishDisabled}
            style={[s.finishBtn, finishDisabled && { opacity: 0.45 }]}
            activeOpacity={1}
          >
            <Text style={s.finishText}>FINISH</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* ── ROW 2: workout name ── */}
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

      {/* ── ROW 3: metrics bar ── */}
      <View style={s.metricsRow}>
        <View style={s.metricCell}>
          <Text style={[s.metricValue, s.metricGold]}>{volDisplay}</Text>
          <Text style={s.metricLabel}>VOLUME</Text>
        </View>

        <View style={s.metricDivider} />

        <View style={s.metricCell}>
          <Text style={s.metricValue}>
            {completedSets}/{totalSets}
          </Text>
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

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    backgroundColor: T.bg0, // #121212 — page-level bg, not a card
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 12,
    // No border, no shadow — the metrics bar below acts as the visual anchor
  },

  // Row 1
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
    alignItems: "center",
    justifyContent: "center",
    // No border
  },
  timerCapsule: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: T.bg3,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    // No border
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: T.gold, // Gold live indicator
  },
  timerText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 16,
    color: T.text,
    letterSpacing: 1.8,
  },

  // FINISH button — solid gold, dark text
  finishBtn: {
    backgroundColor: T.gold,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: T.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  finishText: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 15,
    color: T.bg0, // Dark on gold — max contrast
    letterSpacing: 1.5,
  },

  // Row 2 — name
  nameRow: { flexShrink: 1 },
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
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
    // No border
  },
  editBadgeText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 9,
    color: T.muted,
    letterSpacing: 1.5,
  },
  nameInput: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 30,
    color: T.text,
    borderBottomWidth: 2,
    borderBottomColor: T.gold, // Gold underline on active edit
    paddingBottom: 4,
    paddingTop: 0,
  },

  // Row 3 — metrics bar
  metricsRow: {
    flexDirection: "row",
    backgroundColor: T.bg2,
    borderRadius: 14,
    overflow: "hidden",
    // No border
  },
  metricCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    gap: 2,
  },
  metricDivider: {
    width: 1,
    backgroundColor: T.bg3,
    marginVertical: 8,
  },
  metricValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 20,
    color: T.text,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  metricGold: { color: T.gold }, // Volume gets the gold highlight
  metricLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 9,
    color: T.muted,
    letterSpacing: 0.8,
  },
});
