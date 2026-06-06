import { COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Set = {
  id: number;
  weight: string;
  reps: string;
  completed: boolean;
};

type Props = {
  exerciseName?: string;
  defaultSets?: number;
};

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

  const updateSet = (id: number, field: "weight" | "reps", value: string) => {
    setSets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const toggleComplete = (id: number) => {
    setSets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)),
    );
  };

  const addSet = () => {
    setSets((prev) => [
      ...prev,
      { id: prev.length + 1, weight: "", reps: "", completed: false },
    ]);
  };

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
          {/* Set number */}
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
            placeholderTextColor={COLORS.muted}
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
            placeholderTextColor={COLORS.muted}
            editable={!set.completed}
            maxLength={3}
          />

          {/* Complete toggle */}
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

      {/* Add set button */}
      <Pressable style={s.addBtn} onPress={addSet}>
        <Text style={s.addBtnText}>+ ADD SET</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  exerciseName: {
    color: COLORS.text ?? "#FFFFFF",
    fontFamily: FONTS.bold,
    fontSize: 17,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: COLORS.muted,
    fontFamily: FONTS.medium,
    fontSize: 12,
    marginTop: 2,
  },
  progressPills: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  pill: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  pillDone: {
    backgroundColor: COLORS.accent,
  },
  colRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 2,
  },
  colLabel: {
    flex: 1,
    color: COLORS.muted,
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 1.5,
    textAlign: "center",
  },
  colCenter: {
    textAlign: "center",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  setRowDone: {
    backgroundColor: `${COLORS.accent}10`,
  },
  setNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  setNumBadgeDone: {
    backgroundColor: `${COLORS.accent}30`,
  },
  setNum: {
    color: COLORS.muted,
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  setNumDone: {
    color: COLORS.accent,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.bg3 ?? "#1C1C1E",
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text ?? "#FFFFFF",
    fontFamily: FONTS.bold,
    fontSize: 16,
    textAlign: "center",
  },
  inputDone: {
    opacity: 0.5,
  },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkBtnDone: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  checkMark: {
    color: "#000",
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  removeBtn: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  removeTxt: {
    color: COLORS.muted,
    fontSize: 20,
    lineHeight: 22,
  },
  addBtn: {
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  addBtnText: {
    color: COLORS.muted,
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 1.5,
  },
});
