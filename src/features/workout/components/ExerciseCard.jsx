import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { COLORS } from "@/src/theme";

const C = COLORS;

function SetRow({ setNum, set, onChange, onDelete, onTimerOpen }) {
  return (
    <View style={s.setRow}>
      <View style={[s.setBadge, set.done && s.setBadgeDone]}>
        <Text style={[s.setBadgeText, set.done && s.setBadgeTextDone]}>{setNum}</Text>
      </View>

      <View style={s.setInputWrap}>
        <TextInput
          value={set.weight}
          onChangeText={(v) => onChange({ ...set, weight: v })}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={C.muted2}
          style={s.setInput}
        />
        <Text style={s.setInputUnit}>kg</Text>
      </View>

      <Text style={s.setX}>×</Text>

      <View style={s.setInputWrap}>
        <TextInput
          value={set.reps}
          onChangeText={(v) => onChange({ ...set, reps: v })}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={C.muted2}
          style={s.setInput}
        />
        <Text style={s.setInputUnit}>reps</Text>
      </View>

      <TouchableOpacity
        onPress={() => {
          onChange({ ...set, done: !set.done });
          if (!set.done) onTimerOpen();
        }}
        style={[s.setDoneBtn, set.done && s.setDoneBtnActive]}
      >
        <Text style={[s.setDoneBtnText, set.done && { color: C.bg }]}>
          {set.done ? "✓" : "○"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onDelete} style={s.setDeleteBtn}>
        <Text style={s.setDeleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ExerciseCard({ exercise, onRemove, onTimerOpen }) {
  const [sets, setSets] = useState([
    { id: 1, weight: "", reps: "", done: false },
    { id: 2, weight: "", reps: "", done: false },
    { id: 3, weight: "", reps: "", done: false },
  ]);

  const addSet = () =>
    setSets((prev) => [...prev, { id: Date.now(), weight: "", reps: "", done: false }]);

  const updateSet = (id, updated) => setSets((prev) => prev.map((s) => (s.id === id ? updated : s)));

  const removeSet = (id) => setSets((prev) => prev.filter((s) => s.id !== id));

  const doneCount = sets.filter((s) => s.done).length;
  const totalVol = sets
    .filter((s) => s.done && s.weight && s.reps)
    .reduce((acc, s) => acc + parseFloat(s.weight || 0) * parseInt(s.reps || 0), 0);

  return (
    <View style={s.exerciseCard}>
      <View style={s.exerciseCardHeader}>
        <View style={s.exerciseIconWrap}>
          <Text style={{ fontSize: 20 }}>{exercise.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.exerciseName}>{exercise.name}</Text>
          <Text style={s.exerciseMuscle}>
            {exercise.muscle} · {doneCount}/{sets.length} sets
          </Text>
        </View>
        {totalVol > 0 && <Text style={s.exerciseVol}>{totalVol.toLocaleString()} kg</Text>}
        <TouchableOpacity onPress={onRemove} style={s.exerciseRemove}>
          <Text style={s.exerciseRemoveText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={s.setHeaderRow}>
        <Text style={[s.setHeaderText, { width: 28 }]}>SET</Text>
        <Text style={[s.setHeaderText, { flex: 1 }]}>WEIGHT</Text>
        <View style={{ width: 16 }} />
        <Text style={[s.setHeaderText, { flex: 1 }]}>REPS</Text>
        <View style={{ width: 68 }} />
      </View>

      {sets.map((set, i) => (
        <SetRow
          key={set.id}
          setNum={i + 1}
          set={set}
          onChange={(updated) => updateSet(set.id, updated)}
          onDelete={() => removeSet(set.id)}
          onTimerOpen={onTimerOpen}
        />
      ))}

      <TouchableOpacity onPress={addSet} style={s.addSetBtn}>
        <Text style={s.addSetText}>+ ADD SET</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  exerciseCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  exerciseCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  exerciseIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${C.accent}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseName: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 18,
    color: C.text,
  },
  exerciseMuscle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: C.muted,
    marginTop: 1,
  },
  exerciseVol: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 14,
    color: C.accent,
  },
  exerciseRemove: {
    padding: 6,
  },
  exerciseRemoveText: {
    fontSize: 14,
    color: C.muted,
  },
  setHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 2,
    marginBottom: 8,
    gap: 8,
  },
  setHeaderText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 10,
    color: C.muted,
    letterSpacing: 0.8,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  setBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: C.bg3,
    alignItems: "center",
    justifyContent: "center",
  },
  setBadgeDone: {
    backgroundColor: `${C.accent}22`,
  },
  setBadgeText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: C.muted,
  },
  setBadgeTextDone: {
    color: C.accent,
  },
  setInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.bg3,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
  },
  setInput: {
    flex: 1,
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 17,
    color: C.text,
    padding: 0,
  },
  setInputUnit: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: C.muted,
  },
  setX: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: C.muted,
    width: 14,
    textAlign: "center",
  },
  setDoneBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg3,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  setDoneBtnActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  setDoneBtnText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: C.muted,
  },
  setDeleteBtn: {
    padding: 6,
  },
  setDeleteText: {
    fontSize: 13,
    color: C.muted2,
  },
  addSetBtn: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  addSetText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: C.muted,
    letterSpacing: 1,
  },
});