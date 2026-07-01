import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg0: "#121212",
  bg1: "#1E1E1E",
  bg2: "#282828",
  bg3: "#303030",
  border: "#FFFFFF0A",
  borderMid: "#FFFFFF14",
  gold: "#FFC700",
  goldDim: "#FFC70018",
  goldBorder: "#FFC70030",
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#555555",
};

// ─── Types ────────────────────────────────────────────────────────────────────
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
  isCustom?: boolean;
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

// ─── Set Row ──────────────────────────────────────────────────────────────────

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

      {/* Previous */}
      <Text style={ss.prevText} numberOfLines={1}>
        {set.previous ?? "—"}
      </Text>

      {/* KG input */}
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

      {/* Reps input */}
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

      {/* Checkmark */}
      <TouchableOpacity
        onPress={handleToggleDone}
        style={[ss.doneBtn, set.done && ss.doneBtnActive]}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
      >
        <Ionicons
          name="checkmark"
          size={16}
          color={set.done ? T.bg0 : T.muted}
        />
      </TouchableOpacity>

      {/* Delete */}
      <TouchableOpacity
        onPress={onDelete}
        style={ss.deleteBtn}
        hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={12} color={T.muted + "80"} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Muscle / Tag Pill ─────────────────────────────────────────────────────────
// Renders as a neutral pill for preset muscle groups, or a gold-tinted
// "Custom" pill with a sparkle glyph for user-created exercises.

function TagPill({ label, isCustom }: { label: string; isCustom: boolean }) {
  return (
    <View style={[ss.pill, isCustom && ss.pillCustom]}>
      {isCustom && (
        <Ionicons name="sparkles" size={9} color={T.gold} style={ss.pillIcon} />
      )}
      <Text style={[ss.pillText, isCustom && ss.pillTextCustom]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

// ─── Exercise Card ────────────────────────────────────────────────────────────

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

  // An exercise is treated as "custom" if explicitly flagged, or if either
  // the muscle group or tag was set to "Custom" by the quick-add flow.
  const isCustom =
    exercise.isCustom ||
    exercise.tag?.toLowerCase() === "custom" ||
    exercise.muscle?.toLowerCase() === "custom";

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
      {/* Top progress stripe */}
      <View style={ss.progressTrack}>
        <View
          style={[ss.progressFill, { width: `${progressPct * 100}%` as any }]}
        />
      </View>

      {/* ── Header ── */}
      <View style={ss.cardHeader}>
        <View style={ss.titleCol}>
          <Text style={ss.exerciseName} numberOfLines={1}>
            {exercise.name}
          </Text>
          <View style={ss.pillRow}>
            {isCustom ? (
              <TagPill label="Custom" isCustom />
            ) : (
              <>
                <TagPill label={exercise.muscle} isCustom={false} />
                <TagPill label={exercise.tag} isCustom={false} />
              </>
            )}
          </View>
        </View>

        <View style={ss.headerRight}>
          {volDisplay && <Text style={ss.volText}>{volDisplay}</Text>}
          <Text style={[ss.setCount, doneCount > 0 && ss.setCountActive]}>
            {doneCount}/{sets.length}
          </Text>
          <TouchableOpacity
            onPress={onRemove}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={14} color={T.muted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Column headers ── */}
      <View style={ss.colHeaders}>
        <Text style={[ss.colHeader, ss.colSet]}>SET</Text>
        <Text style={[ss.colHeader, ss.colPrev]}>PREV</Text>
        <Text style={[ss.colHeader, ss.colInput]}>KG</Text>
        <Text style={[ss.colHeader, ss.colInput]}>REPS</Text>
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

      {/* ── Add set ── */}
      <TouchableOpacity
        onPress={addSet}
        style={ss.addSetBtn}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={13} color={T.muted} />
        <Text style={ss.addSetText}>Add set</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const COL_SET = 28;
const COL_PREV = 52;
const COL_CHECK = 36;
const COL_DEL = 22;

const ss = StyleSheet.create({
  // Card
  card: {
    backgroundColor: T.bg1,
    borderWidth: 1,
    borderColor: T.borderMid,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 6,
    marginBottom: 10,
    overflow: "hidden",
  },
  cardDone: {
    borderColor: T.goldBorder,
  },

  // Progress stripe
  progressTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: T.bg3,
  },
  progressFill: {
    height: "100%",
    backgroundColor: T.gold,
  },

  // Header
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    marginBottom: 12,
  },
  titleCol: { flex: 1, gap: 6 },
  exerciseName: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: T.text,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  volText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.gold,
  },
  setCount: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    color: T.muted,
    letterSpacing: 0.3,
  },
  setCountActive: { color: T.gold },

  // Pills (muscle / tag badges)
  pillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg2,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillCustom: {
    backgroundColor: T.goldDim,
    borderColor: T.goldBorder,
  },
  pillIcon: {
    marginRight: 3,
  },
  pillText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    color: T.sub,
    letterSpacing: 0.6,
  },
  pillTextCustom: {
    color: T.gold,
  },

  // Column headers
  colHeaders: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
    paddingRight: COL_DEL,
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

  // Set rows
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  setRowDone: { opacity: 0.55 },

  // Set badge
  setBadge: {
    width: COL_SET,
    height: COL_SET,
    borderRadius: COL_SET / 2,
    backgroundColor: T.bg2,
    alignItems: "center",
    justifyContent: "center",
  },
  setBadgeDone: { backgroundColor: T.goldDim },
  setBadgeText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.sub,
  },
  setBadgeTextDone: { color: T.gold },

  // Previous
  prevText: {
    width: COL_PREV,
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
    textAlign: "center",
  },

  // Inputs
  inputWrap: {
    flex: 1,
    backgroundColor: T.bg2,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 10,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrapDone: { borderColor: T.goldBorder },
  input: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 18,
    color: T.text,
    padding: 0,
    textAlign: "center",
    width: "100%",
  },

  // Checkmark
  doneBtn: {
    width: COL_CHECK,
    height: COL_CHECK,
    borderRadius: COL_CHECK / 2,
    backgroundColor: T.bg2,
    borderWidth: 1.5,
    borderColor: T.borderMid,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnActive: {
    backgroundColor: T.gold,
    borderColor: T.gold,
  },

  // Delete
  deleteBtn: {
    width: COL_DEL,
    alignItems: "center",
    justifyContent: "center",
  },

  // Add set
  addSetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 12,
    marginTop: 2,
  },
  addSetText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: T.muted,
  },
});
