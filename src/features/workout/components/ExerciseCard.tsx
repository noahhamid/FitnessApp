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
  blue: "#3B82F6",
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
  previous?: string;
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
    case "Compound": return "barbell-outline";
    case "Isolation": return "git-pull-request-outline";
    case "Bodyweight": return "body-outline";
    case "Machine": return "settings-outline";
    case "Cardio": return "heart-outline";
    default: return "fitness-outline";
  }
}

// ── Set Row ───────────────────────────────────────────────────────────────────
function SetRow({ setNum, set, onChange, onDelete, onTimerOpen }: SetRowProps) {
  const handleToggleDone = useCallback(() => {
    const next = !set.done;
    onChange({ ...set, done: next });
    if (next) onTimerOpen();
  }, [set, onChange, onTimerOpen]);

  const prevLabel = set.previous ?? "—";

  return (
    <View style={[ss.setRow, set.done && ss.setRowDone]}>
      {/* Column 1: Set number badge */}
      <View style={[ss.setBadge, set.done && ss.setBadgeDone]}>
        <Text style={[ss.setBadgeText, set.done && ss.setBadgeTextDone]}>
          {setNum}
        </Text>
      </View>

      {/* Column 2: Previous history */}
      <Text style={ss.prevText} numberOfLines={1}>
        {prevLabel}
      </Text>

      {/* Column 3: KG input */}
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
      </View>

      {/* Column 4: Reps input */}
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
      </View>

      {/* Column 5: Circular checkmark toggle */}
      <TouchableOpacity
        onPress={handleToggleDone}
        style={[ss.doneBtn, set.done && ss.doneBtnActive]}
        activeOpacity={0.7}
        hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
      >
        <Ionicons
          name="checkmark"
          size={16}
          color={set.done ? T.bg0 : T.muted}
        />
      </TouchableOpacity>

      {/* Delete set (subtle) */}
      <TouchableOpacity
        onPress={onDelete}
        style={ss.deleteBtn}
        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
      >
        <Ionicons name="close" size={12} color={T.muted + "70"} />
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

  const muscleTag =
    `${exercise.muscle.toUpperCase()} · ${exercise.tag.toUpperCase()}`;

  return (
    <View style={[ss.card, allDone && ss.cardDone]}>
      {/* Top progress stripe */}
      <View style={ss.progressTrack}>
        <View style={[ss.progressFill, { width: `${progressPct * 100}%` as any }]} />
      </View>

      {/* ── Card header ── */}
      <View style={ss.cardHeader}>
        {/* Icon badge */}
        <View style={[ss.iconWrap, allDone && ss.iconWrapDone]}>
          <Ionicons
            name={getExerciseIcon(exercise.tag)}
            size={18}
            color={T.lime}
          />
        </View>

        {/* Name + muscle·tag */}
        <View style={ss.titleCol}>
          <Text style={ss.exerciseName} numberOfLines={1}>
            {exercise.name}
          </Text>
          <Text style={ss.muscleTag}>{muscleTag}</Text>
        </View>

        {/* Set count + volume + trash */}
        <View style={ss.headerRight}>
          {volDisplay && (
            <View style={ss.volPill}>
              <Text style={ss.volText}>{volDisplay}</Text>
            </View>
          )}
          <Text style={[ss.setCountText, doneCount > 0 && ss.setCountActive]}>
            {doneCount}/{sets.length} SETS
          </Text>
          <TouchableOpacity
            onPress={onRemove}
            style={ss.removeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={14} color={T.muted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Column headers: SET | PREVIOUS | KG | REPS | ✓ ── */}
      <View style={ss.colHeaders}>
        <Text style={[ss.colHeader, ss.colSet]}>SET</Text>
        <Text style={[ss.colHeader, ss.colPrev]}>PREVIOUS</Text>
        <Text style={[ss.colHeader, ss.colInput]}>KG</Text>
        <Text style={[ss.colHeader, ss.colInput]}>REPS</Text>
        {/* Spacer for checkmark column */}
        <View style={ss.colCheck} />
      </View>

      {/* ── Set rows ── */}
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

      {/* ── Add set link ── */}
      <TouchableOpacity onPress={addSet} style={ss.addSetBtn} activeOpacity={0.7}>
        <Text style={ss.addSetText}>+ Add set</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const COL_SET = 26;
const COL_PREV = 58;
const COL_CHECK = 34;
const COL_DELETE = 22;

const ss = StyleSheet.create({
  card: {
    backgroundColor: T.bg2,
    borderWidth: 1,
    borderColor: T.borderMid,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 4,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardDone: {
    borderColor: T.lime + "55",
  },

  // Progress stripe at top
  progressTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: T.lime + "18",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  progressFill: {
    height: "100%",
    backgroundColor: T.lime,
    borderRadius: 99,
  },

  // ── Card header ──────────────────────────────────────────────────────────────
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    marginBottom: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.lime + "15",
    borderWidth: 1,
    borderColor: T.lime + "25",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapDone: {
    backgroundColor: T.lime + "30",
    borderColor: T.lime + "60",
  },
  titleCol: {
    flex: 1,
    gap: 3,
  },
  exerciseName: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: T.text,
    letterSpacing: -0.1,
  },
  muscleTag: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: T.muted,
    letterSpacing: 0.5,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  volPill: {
    backgroundColor: T.lime + "14",
    borderWidth: 1,
    borderColor: T.lime + "30",
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  volText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    color: T.lime,
    letterSpacing: 0.2,
  },
  setCountText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    color: T.muted,
    letterSpacing: 0.5,
  },
  setCountActive: { color: T.lime },
  removeBtn: {
    padding: 2,
  },

  // ── Column headers ───────────────────────────────────────────────────────────
  colHeaders: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  colHeader: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    color: T.muted,
    letterSpacing: 0.8,
    textAlign: "center",
  },
  colSet: { width: COL_SET },
  colPrev: { width: COL_PREV, textAlign: "center" },
  colInput: { flex: 1 },
  colCheck: { width: COL_CHECK },

  // ── Set rows ─────────────────────────────────────────────────────────────────
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 7,
  },
  setRowDone: { opacity: 0.6 },

  // Set number badge (small circle)
  setBadge: {
    width: COL_SET,
    height: COL_SET,
    borderRadius: 13,
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
    color: T.blue,
  },
  setBadgeTextDone: { color: T.lime },

  // Previous history text
  prevText: {
    width: COL_PREV,
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
    textAlign: "center",
  },

  // Input wrappers (KG / REPS)
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg3,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 36,
  },
  inputWrapDone: { borderColor: T.lime + "30" },
  input: {
    flex: 1,
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 16,
    color: T.text,
    padding: 0,
    textAlign: "center",
  },

  // ── Circular checkmark toggle ─────────────────────────────────────────────────
  doneBtn: {
    width: COL_CHECK,
    height: COL_CHECK,
    borderRadius: COL_CHECK / 2,   // fully circular
    backgroundColor: T.bg3,
    borderWidth: 1.5,
    borderColor: T.muted + "55",
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnActive: {
    backgroundColor: T.lime,
    borderColor: T.lime,
    shadowColor: T.lime,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },

  // Delete set button
  deleteBtn: {
    width: COL_DELETE,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Add set link ──────────────────────────────────────────────────────────────
  addSetBtn: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 2,
  },
  addSetText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: T.muted,
  },
});
