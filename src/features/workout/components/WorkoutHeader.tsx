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

// ── Design Tokens — "Muscle Monster" ────────────────────────────────────────
const T = {
  bg0: "#121212", // Deep matte charcoal — header surface
  bg2: "#1E1E1E", // Muted dark gray — secondary surface
  bg3: "#252525", // Elevated chip surface
  track: "#242424", // Progress bar track (deep gray, near-invisible)
  gold: "#FFC700", // Primary accent — timer, progress fill, FINISH
  text: "#FFFFFF", // Workout title
  sub: "#A0A0A0", // Subtext, secondary buttons
  muted: "#5A5A5A", // Tertiary / disabled
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
  const progressAnim = useRef(new Animated.Value(0)).current;

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

  // Fluid progress fill — animates whenever completed sets change
  const progressRatio = totalSets > 0 ? completedSets / totalSets : 0;
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressRatio,
      duration: 450,
      useNativeDriver: false, // width interpolation — cannot use native driver
    }).start();
  }, [progressRatio, progressAnim]);

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
        : "0kg";

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={s.container}>
      {/* ── ROW 0: minimalist action anchors ── */}
      <View style={s.actionRow}>
        <TouchableOpacity
          onPress={onBack}
          style={s.cancelBtn}
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={15} color={T.sub} />
          <Text style={s.cancelText}>END</Text>
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            onPress={onFinish}
            onPressIn={handleFinishPressIn}
            onPressOut={handleFinishPressOut}
            disabled={finishDisabled}
            style={[s.finishBtn, finishDisabled && { opacity: 0.4 }]}
            activeOpacity={1}
          >
            <Text style={s.finishText}>FINISH</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* ── ROW 1: title (left) · live timer (right) ── */}
      <View style={s.titleRow}>
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
              {name}
            </Text>
          </TouchableOpacity>
        )}

        <View style={s.timerWrap}>
          <Animated.View style={[s.liveDot, { opacity: dotAnim }]} />
          <Text style={s.timerText}>{fmt}</Text>
        </View>
      </View>

      {/* ── ROW 2: fluid session progress tracker ── */}
      <View style={s.progressTrack}>
        <Animated.View style={[s.progressFill, { width: progressWidth }]} />
      </View>

      {/* ── ROW 3: quiet supporting stats ── */}
      <View style={s.statsRow}>
        <Text style={s.statsText}>
          {completedSets}/{totalSets} SETS
        </Text>
        <Text style={s.statsDivider}>·</Text>
        <Text style={s.statsText}>{exerciseCount} EXERCISES</Text>
        <Text style={s.statsDivider}>·</Text>
        <Text style={[s.statsText, s.statsGold]}>{volDisplay}</Text>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    backgroundColor: T.bg0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 10,
    // Invisible borders — header melts into the scroll view beneath it
  },

  // Row 0 — action anchors
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 4,
    paddingRight: 6,
    // Flat, no background — pure utility trigger
  },
  cancelText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
    letterSpacing: 1.2,
  },
  finishBtn: {
    backgroundColor: T.gold,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
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
    fontSize: 14,
    color: T.bg0, // Dark on gold — max contrast
    letterSpacing: 1.5,
  },

  // Row 1 — title + timer
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  nameTouchable: {
    flexShrink: 1,
  },
  nameText: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 28,
    color: T.text,
    letterSpacing: 0.3,
    lineHeight: 30,
  },
  nameInput: {
    flexShrink: 1,
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 28,
    color: T.text,
    borderBottomWidth: 2,
    borderBottomColor: T.gold,
    paddingBottom: 2,
    paddingTop: 0,
  },
  timerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingBottom: 3,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: T.gold,
  },
  timerText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 20,
    color: T.gold, // Striking gold running clock
    letterSpacing: 1,
  },

  // Row 2 — progress tracker
  progressTrack: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: T.track,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: T.gold,
    borderRadius: 1.5,
  },

  // Row 3 — quiet stats
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statsText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10.5,
    color: T.sub,
    letterSpacing: 0.6,
  },
  statsGold: {
    color: T.gold,
  },
  statsDivider: {
    fontSize: 10.5,
    color: T.muted,
  },
});
