import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Svg, { Path } from "react-native-svg";

// ── Design Tokens — "Muscle Monster" Theme ─────────────────────────────────
const T = {
  bg0: "#121212",
  bg2: "#1E1E1E", // Card / row surface
  bg3: "#282828", // Input field surface
  gold: "#FFC700", // Primary accent
  crimson: "#B3261E", // Destructive swipe action
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#5A5A5A",
};

type Set = {
  id: number;
  weight: string;
  reps: string;
  previous?: string; // e.g. "60kg × 8" from last session
  completed: boolean;
};
type Props = {
  exerciseName?: string;
  defaultSets?: number;
  previousValues?: string[]; // optional history strings per set index
};

type FocusTarget = { id: number; field: "weight" | "reps" } | null;

function TrashIcon({ color = "#FFFFFF" }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-7 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SetLogger({
  exerciseName = "Exercise",
  defaultSets = 3,
  previousValues = [],
}: Props) {
  const [sets, setSets] = useState<Set[]>(
    Array.from({ length: defaultSets }, (_, i) => ({
      id: i + 1,
      weight: "",
      reps: "",
      previous: previousValues[i],
      completed: false,
    })),
  );
  const [focused, setFocused] = useState<FocusTarget>(null);

  const updateSet = (id: number, field: "weight" | "reps", value: string) =>
    setSets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );

  const toggleComplete = (id: number) =>
    setSets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)),
    );

  const addSet = () =>
    setSets((prev) => [
      ...prev,
      { id: prev.length + 1, weight: "", reps: "", completed: false },
    ]);

  const removeSet = (id: number) => {
    if (sets.length <= 1) return;
    setSets((prev) => prev.filter((s) => s.id !== id));
  };

  const completedCount = sets.filter((s) => s.completed).length;

  const renderRightActions = (
    id: number,
    progress: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 1],
      extrapolate: "clamp",
    });
    return (
      <Pressable style={s.deleteAction} onPress={() => removeSet(id)}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <TrashIcon color={T.text} />
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.exerciseName}>{exerciseName}</Text>
          <Text style={s.subtitle}>
            {completedCount}/{sets.length} sets complete
          </Text>
        </View>

        {/* Progress pills */}
        <View style={s.progressPills}>
          {sets.map((set) => (
            <View key={set.id} style={[s.pill, set.completed && s.pillDone]} />
          ))}
        </View>
      </View>

      {/* Column labels */}
      <View style={s.colRow}>
        <Text style={[s.colLabel, { width: 28, textAlign: "left" }]}>SET</Text>
        <Text style={[s.colLabel, s.colPrevious]}>PREVIOUS</Text>
        <Text style={[s.colLabel, s.colCenter]}>KG</Text>
        <Text style={[s.colLabel, s.colCenter]}>REPS</Text>
        <Text style={[s.colLabel, { width: 36, textAlign: "center" }]}>✓</Text>
      </View>

      {/* Set rows */}
      {sets.map((set, index) => {
        const weightFocused =
          focused?.id === set.id && focused.field === "weight";
        const repsFocused = focused?.id === set.id && focused.field === "reps";

        return (
          <Swipeable
            key={set.id}
            renderRightActions={(progress) =>
              renderRightActions(set.id, progress)
            }
            overshootRight={false}
            rightThreshold={32}
          >
            <View style={[s.setRow, set.completed && s.setRowDone]}>
              {/* Set number badge */}
              <View style={[s.setNumBadge, set.completed && s.setNumBadgeDone]}>
                <Text style={[s.setNum, set.completed && s.setNumDone]}>
                  {index + 1}
                </Text>
              </View>

              {/* Previous session value */}
              <Text style={s.previousText} numberOfLines={1}>
                {set.previous ?? "—"}
              </Text>

              {/* Weight input */}
              <TextInput
                style={[
                  s.input,
                  weightFocused && s.inputFocused,
                  set.completed && s.inputDone,
                ]}
                value={set.weight}
                onChangeText={(v) => updateSet(set.id, "weight", v)}
                onFocus={() => setFocused({ id: set.id, field: "weight" })}
                onBlur={() => setFocused(null)}
                keyboardType="decimal-pad"
                placeholder="—"
                placeholderTextColor={T.muted}
                editable={!set.completed}
                maxLength={6}
                selectionColor={T.gold}
              />

              {/* Reps input */}
              <TextInput
                style={[
                  s.input,
                  repsFocused && s.inputFocused,
                  set.completed && s.inputDone,
                ]}
                value={set.reps}
                onChangeText={(v) => updateSet(set.id, "reps", v)}
                onFocus={() => setFocused({ id: set.id, field: "reps" })}
                onBlur={() => setFocused(null)}
                keyboardType="number-pad"
                placeholder="—"
                placeholderTextColor={T.muted}
                editable={!set.completed}
                maxLength={3}
                selectionColor={T.gold}
              />

              {/* Complete toggle — the hero action */}
              <Pressable
                onPress={() => toggleComplete(set.id)}
                style={[s.checkBtn, set.completed && s.checkBtnDone]}
                hitSlop={8}
              >
                {set.completed && <Text style={s.checkMark}>✓</Text>}
              </Pressable>
            </View>
          </Swipeable>
        );
      })}

      {/* Add set — dashed gold outline */}
      <Pressable style={s.addBtn} onPress={addSet}>
        <Text style={s.addBtnText}>+ ADD SET</Text>
      </Pressable>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    borderRadius: 20,
    backgroundColor: T.bg2,
    padding: 20,
    gap: 12,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  exerciseName: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 20,
    color: T.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.sub,
    marginTop: 2,
  },

  // Progress pills
  progressPills: { flexDirection: "row", gap: 5, alignItems: "center" },
  pill: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.bg3,
  },
  pillDone: { backgroundColor: T.gold },

  // Column labels — tiny, muted, capitalized
  colRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 2,
  },
  colLabel: {
    flex: 1,
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 10,
    color: T.sub,
    letterSpacing: 1.5,
    textAlign: "center",
  },
  colPrevious: { flex: 1.3, textAlign: "left" },
  colCenter: { textAlign: "center" },

  // Set rows
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: T.bg2,
  },
  setRowDone: {
    backgroundColor: T.gold + "12", // Subtle gold tint on completion
  },

  // Set number badge
  setNumBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: T.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  setNumBadgeDone: { backgroundColor: T.gold + "25" },
  setNum: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.muted,
  },
  setNumDone: { color: T.gold },

  // Previous history value
  previousText: {
    flex: 1.3,
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.sub,
    textAlign: "left",
  },

  // Inputs — borderless dark blocks, gold ring on focus
  input: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: T.bg3, // #282828
    color: T.text,
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 18,
    textAlign: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  inputFocused: {
    borderColor: T.gold,
    backgroundColor: T.bg3,
  },
  inputDone: { opacity: 0.4 },

  // Check button — the hero action
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  checkBtnDone: {
    backgroundColor: T.gold,
  },
  checkMark: {
    color: T.bg0, // Dark tick on gold — high contrast
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 17,
  },

  // Swipe-to-delete action
  deleteAction: {
    width: 64,
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: T.crimson,
    alignItems: "center",
    justifyContent: "center",
  },

  // Add set — dashed gold border
  addBtn: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: T.gold + "40",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  addBtnText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.gold,
    letterSpacing: 1.5,
    opacity: 0.85,
  },
});
