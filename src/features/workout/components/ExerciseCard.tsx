import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";
import {
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
  orange: "#FF8A00",
  text: "#F2F2F5",
  sub: "#7A7A8C",
  muted: "#4A4A58",
  border: "#FFFFFF0F",
  borderMid: "#FFFFFF18",
};

export type ExerciseSetData = {
  id: number;
  weight: string;
  reps: string;
  done: boolean;
};

export function createInitialExerciseSets(): ExerciseSetData[] {
  return [
    { id: 1, weight: "", reps: "", done: false },
    { id: 2, weight: "", reps: "", done: false },
    { id: 3, weight: "", reps: "", done: false },
  ];
}

type Exercise = {
  id: string;
  name: string;
  muscle: string;
  tag: string;
  uid: string;
};

type Props = {
  exercise: Exercise;
  sets: ExerciseSetData[];
  onSetsChange: (sets: ExerciseSetData[]) => void;
  onRemove: () => void;
  onTimerOpen: () => void;
};

type SetRowProps = {
  setNum: number;
  set: ExerciseSetData;
  onChange: (updated: ExerciseSetData) => void;
  onDelete: () => void;
  onTimerOpen: () => void;
};

function getExerciseIcon(tag: string): keyof typeof Ionicons.glyphMap {
  switch (tag) {
    case "Compound":
      return "barbell-outline";
    case "Isolation":
      return "git-pull-request-outline";
    case "Bodyweight":
      return "body-outline";
    case "Machine":
      return "settings-outline";
    case "Cardio":
      return "heart-outline";
    default:
      return "fitness-outline";
  }
}

// ── Set row ───────────────────────────────────────────────────────────────────
function SetRow({ setNum, set, onChange, onDelete, onTimerOpen }: SetRowProps) {
  const handleToggleDone = useCallback(() => {
    const next = !set.done;
    onChange({ ...set, done: next });
    if (next) onTimerOpen();
  }, [set, onChange, onTimerOpen]);

  return (
    <View style={[ss.setRow, set.done && ss.setRowDone]}>
      {/* Set number */}
      <View style={[ss.setBadge, set.done && ss.setBadgeDone]}>
        <Text style={[ss.setBadgeText, set.done && ss.setBadgeTextDone]}>
          {setNum}
        </Text>
      </View>

      {/* Weight */}
      <View style={[ss.inputWrap, set.done && ss.inputWrapDone]}>
        <TextInput
          value={set.weight}
          onChangeText={(v) => onChange({ ...set, weight: v })}
          keyboardType="decimal-pad"
          placeholder="—"
          placeholderTextColor={T.muted}
          style={ss.input}
          selectTextOnFocus
        />
        <Text style={ss.inputUnit}>kg</Text>
      </View>

      <Text style={ss.cross}>×</Text>

      {/* Reps */}
      <View style={[ss.inputWrap, set.done && ss.inputWrapDone]}>
        <TextInput
          value={set.reps}
          onChangeText={(v) => onChange({ ...set, reps: v })}
          keyboardType="number-pad"
          placeholder="—"
          placeholderTextColor={T.muted}
          style={ss.input}
          selectTextOnFocus
        />
        <Text style={ss.inputUnit}>reps</Text>
      </View>

      {/* Done toggle */}
      <TouchableOpacity
        onPress={handleToggleDone}
        style={[ss.doneBtn, set.done && ss.doneBtnActive]}
        activeOpacity={0.7}
      >
        <Ionicons
          name={set.done ? "checkmark" : "ellipse-outline"}
          size={18}
          color={set.done ? T.bg0 : T.muted}
        />
      </TouchableOpacity>

      {/* Delete */}
      <TouchableOpacity
        onPress={onDelete}
        style={ss.deleteBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={14} color={T.muted} />
      </TouchableOpacity>
    </View>
  );
}

// ── Exercise Card ─────────────────────────────────────────────────────────────
export default function ExerciseCard({
  exercise,
  sets,
  onSetsChange,
  onRemove,
  onTimerOpen,
}: Props) {
  const addSet = useCallback(
    () =>
      onSetsChange([
        ...sets,
        { id: Date.now(), weight: "", reps: "", done: false },
      ]),
    [sets, onSetsChange],
  );
  const updateSet = useCallback(
    (id: number, updated: ExerciseSetData) =>
      onSetsChange(sets.map((s) => (s.id === id ? updated : s))),
    [sets, onSetsChange],
  );
  const removeSet = useCallback(
    (id: number) => onSetsChange(sets.filter((s) => s.id !== id)),
    [sets, onSetsChange],
  );

  const doneCount = sets.filter((s) => s.done).length;
  const allDone = doneCount === sets.length && sets.length > 0;
  const progressPct = sets.length > 0 ? doneCount / sets.length : 0;

  const totalVol = sets
    .filter((s) => s.done && s.weight && s.reps)
    .reduce(
      (acc, s) =>
        acc + parseFloat(s.weight || "0") * parseInt(s.reps || "0", 10),
      0,
    );

  const volDisplay =
    totalVol > 0
      ? totalVol % 1 === 0
        ? `${totalVol.toLocaleString()} kg`
        : `${totalVol.toFixed(1)} kg`
      : null;

  return (
    <View style={[ss.card, allDone && ss.cardDone]}>
      {/* Progress bar */}
      <View style={ss.progressTrack}>
        <View
          style={[ss.progressFill, { width: `${progressPct * 100}%` as any }]}
        />
      </View>

      {/* Header */}
      <View style={ss.cardHeader}>
        <View style={[ss.iconWrap, allDone && ss.iconWrapDone]}>
          <Ionicons
            name={getExerciseIcon(exercise.tag)}
            size={20}
            color={allDone ? T.lime : T.lime + "80"}
          />
        </View>

        <View style={ss.titleCol}>
          <Text style={ss.exerciseName} numberOfLines={1}>
            {exercise.name}
          </Text>
          <View style={ss.metaRow}>
            <Text style={ss.muscleName}>{exercise.muscle}</Text>
            <View style={ss.dot} />
            <Text style={[ss.setCount, doneCount > 0 && ss.setCountActive]}>
              {doneCount}/{sets.length} sets
            </Text>
          </View>
        </View>

        {volDisplay && (
          <View style={ss.volPill}>
            <Text style={ss.volText}>{volDisplay}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={onRemove}
          style={ss.removeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={16} color={T.muted} />
        </TouchableOpacity>
      </View>

      {/* Column headers */}
      <View style={ss.colHeaders}>
        <Text style={[ss.colHeader, { width: 32 }]}>#</Text>
        <Text style={[ss.colHeader, { flex: 1 }]}>WEIGHT</Text>
        <View style={{ width: 22 }} />
        <Text style={[ss.colHeader, { flex: 1 }]}>REPS</Text>
        <View style={{ width: 72 }} />
      </View>

      {/* Sets */}
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

      {/* Add set */}
      <TouchableOpacity
        onPress={addSet}
        style={ss.addSetBtn}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={14} color={T.muted} />
        <Text style={ss.addSetText}>ADD SET</Text>
      </TouchableOpacity>
    </View>
  );
}

const ss = StyleSheet.create({
  card: {
    backgroundColor: T.bg2,
    borderWidth: 1,
    borderColor: T.borderMid,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardDone: {
    borderColor: T.lime + "55",
  },
  progressTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: T.lime + "18",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  progressFill: {
    height: "100%",
    backgroundColor: T.lime,
    borderRadius: 99,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    marginBottom: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: T.lime + "15",
    borderWidth: 1,
    borderColor: T.lime + "25",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapDone: {
    backgroundColor: T.lime + "28",
    borderColor: T.lime + "55",
  },
  titleCol: { flex: 1, gap: 3 },
  exerciseName: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 18,
    color: T.text,
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  muscleName: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 99,
    backgroundColor: T.muted,
  },
  setCount: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: T.muted,
  },
  setCountActive: { color: T.lime },
  volPill: {
    backgroundColor: T.lime + "18",
    borderWidth: 1,
    borderColor: T.lime + "35",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  volText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.lime,
    letterSpacing: 0.3,
  },
  removeBtn: { padding: 6 },

  colHeaders: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 2,
    marginBottom: 6,
    gap: 8,
  },
  colHeader: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: T.muted,
    letterSpacing: 1,
  },

  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 7,
  },
  setRowDone: { opacity: 0.7 },
  setBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: T.bg3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  setBadgeDone: {
    backgroundColor: T.lime + "18",
    borderColor: T.lime + "30",
  },
  setBadgeText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.muted,
  },
  setBadgeTextDone: { color: T.lime },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg3,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 11,
    paddingHorizontal: 10,
    height: 42,
  },
  inputWrapDone: { borderColor: T.lime + "30" },
  input: {
    flex: 1,
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 18,
    color: T.text,
    padding: 0,
  },
  inputUnit: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
    marginLeft: 2,
  },
  cross: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: T.muted,
    width: 14,
    textAlign: "center",
  },
  doneBtn: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: T.bg3,
    borderWidth: 1,
    borderColor: T.borderMid,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnActive: {
    backgroundColor: T.lime,
    borderColor: T.lime,
    shadowColor: T.lime,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 4,
  },
  deleteBtn: { padding: 6 },
  addSetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: T.border,
    borderStyle: "dashed",
    borderRadius: 11,
    paddingVertical: 11,
  },
  addSetText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.muted,
    letterSpacing: 1.5,
  },
});
