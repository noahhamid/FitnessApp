import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  bg0: "#121212",
  bg2: "#1E1E1E", // Card surface
  bg3: "#252525", // Input surface
  gold: "#FFC700", // Primary accent
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#5A5A5A",
};

type Set = { id: number; weight: string; reps: string; completed: boolean };
type Props = { exerciseName?: string; defaultSets?: number };

export function SetLogger({
  exerciseName = "Exercise",
  defaultSets = 3,
}: Props) {
  const [sets, setSets] = useState<Set[]>(
    Array.from({ length: defaultSets }, (_, i) => ({
      id: i + 1,
      weight: "",
      reps: "",
      completed: false,
    })),
  );

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
        <Text style={[s.colLabel, { width: 32 }]}>SET</Text>
        <Text style={[s.colLabel, s.colCenter]}>KG</Text>
        <Text style={[s.colLabel, s.colCenter]}>REPS</Text>
        <Text style={[s.colLabel, { width: 40, textAlign: "center" }]}>
          DONE
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Set rows */}
      {sets.map((set, index) => (
        <View key={set.id} style={[s.setRow, set.completed && s.setRowDone]}>
          {/* Set number badge */}
          <View style={[s.setNumBadge, set.completed && s.setNumBadgeDone]}>
            <Text style={[s.setNum, set.completed && s.setNumDone]}>
              {index + 1}
            </Text>
          </View>

          {/* Weight input */}
          <TextInput
            style={[s.input, set.completed && s.inputDone]}
            value={set.weight}
            onChangeText={(v) => updateSet(set.id, "weight", v)}
            keyboardType="decimal-pad"
            placeholder="—"
            placeholderTextColor={T.muted}
            editable={!set.completed}
            maxLength={6}
          />

          {/* Reps input */}
          <TextInput
            style={[s.input, set.completed && s.inputDone]}
            value={set.reps}
            onChangeText={(v) => updateSet(set.id, "reps", v)}
            keyboardType="number-pad"
            placeholder="—"
            placeholderTextColor={T.muted}
            editable={!set.completed}
            maxLength={3}
          />

          {/* Complete toggle — gold checkmark */}
          <Pressable
            onPress={() => toggleComplete(set.id)}
            style={[s.checkBtn, set.completed && s.checkBtnDone]}
            hitSlop={8}
          >
            {set.completed && <Text style={s.checkMark}>✓</Text>}
          </Pressable>

          {/* Remove */}
          <Pressable
            onPress={() => removeSet(set.id)}
            style={s.removeBtn}
            hitSlop={8}
          >
            <Text style={s.removeTxt}>×</Text>
          </Pressable>
        </View>
      ))}

      {/* Add set — dashed gold outline */}
      <Pressable style={s.addBtn} onPress={addSet}>
        <Text style={s.addBtnText}>+ ADD SET</Text>
      </Pressable>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    borderRadius: 20,
    backgroundColor: T.bg2, // #1E1E1E — no border
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
    backgroundColor: T.bg3, // Empty = dark gray
  },
  pillDone: { backgroundColor: T.gold }, // Filled = gold

  // Column labels
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
    color: T.muted,
    letterSpacing: 1.5,
    textAlign: "center",
  },
  colCenter: { textAlign: "center" },

  // Set rows
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  setRowDone: {
    backgroundColor: T.gold + "12", // Very subtle gold tint on completion
  },

  // Set number badge
  setNumBadge: {
    width: 28,
    height: 28,
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

  // Inputs — borderless, dark surface
  input: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: T.bg3, // #252525, no border
    color: T.text,
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 18,
    textAlign: "center",
  },
  inputDone: { opacity: 0.4 },

  // Check button → solid gold when done
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: T.bg3, // Unfilled = dark gray, no border ring
    alignItems: "center",
    justifyContent: "center",
  },
  checkBtnDone: {
    backgroundColor: T.gold, // Filled = gold
  },
  checkMark: {
    color: T.bg0, // Dark tick on gold — high contrast
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 17,
  },

  // Remove button
  removeBtn: { width: 24, alignItems: "center", justifyContent: "center" },
  removeTxt: { color: T.muted, fontSize: 20, lineHeight: 22 },

  // Add set — dashed gold border
  addBtn: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: T.gold + "40", // ~25% opacity gold
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
