import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Fixed: import directly from tokens, NOT from @/src/theme
import { COLORS } from "@/src/ui/tokens/colors";
import { FONTS } from "@/src/ui/tokens/typography";

// ── Types ─────────────────────────────────────────────────────────────────────

type SetData = {
  id: number;
  weight: string;
  reps: string;
  done: boolean;
};

type Exercise = {
  id: string;
  name: string;
  muscle: string;
  tag: string;
  uid: string;
};

type Props = {
  exercise: Exercise;
  onRemove: () => void;
  onTimerOpen: () => void;
};

type SetRowProps = {
  setNum: number;
  set: SetData;
  onChange: (updated: SetData) => void;
  onDelete: () => void;
  onTimerOpen: () => void;
};

// ── Set Row ───────────────────────────────────────────────────────────────────

function SetRow({ setNum, set, onChange, onDelete, onTimerOpen }: SetRowProps) {
  const handleToggleDone = useCallback(() => {
    const next = !set.done;
    onChange({ ...set, done: next });
    if (next) onTimerOpen();
  }, [set, onChange, onTimerOpen]);

  return (
    <View style={[s.setRow, set.done && s.setRowDone]}>
      {/* Set number badge */}
      <View style={[s.setBadge, set.done && s.setBadgeDone]}>
        <Text style={[s.setBadgeText, set.done && s.setBadgeTextDone]}>
          {setNum}
        </Text>
      </View>

      {/* Weight input */}
      <View style={[s.setInputWrap, set.done && s.setInputWrapDone]}>
        <TextInput
          value={set.weight}
          onChangeText={(v) => onChange({ ...set, weight: v })}
          keyboardType="decimal-pad"
          placeholder="—"
          placeholderTextColor={COLORS.muted}
          style={s.setInput}
          selectTextOnFocus
        />
        <Text style={s.setInputUnit}>kg</Text>
      </View>

      {/* Fixed: was "×" text node — now proper Text with FONTS token */}
      <Text style={s.setX}>×</Text>

      {/* Reps input */}
      <View style={[s.setInputWrap, set.done && s.setInputWrapDone]}>
        <TextInput
          value={set.reps}
          onChangeText={(v) => onChange({ ...set, reps: v })}
          keyboardType="number-pad"
          placeholder="—"
          placeholderTextColor={COLORS.muted}
          style={s.setInput}
          selectTextOnFocus
        />
        <Text style={s.setInputUnit}>reps</Text>
      </View>

      {/* Done toggle — Fixed: was "✓" / "○" text — now Ionicons */}
      <TouchableOpacity
        onPress={handleToggleDone}
        style={[s.setDoneBtn, set.done && s.setDoneBtnActive]}
        activeOpacity={0.7}
      >
        <Ionicons
          name={set.done ? "checkmark" : "ellipse-outline"}
          size={18}
          color={set.done ? COLORS.bg : COLORS.muted}
        />
      </TouchableOpacity>

      {/* Delete — Fixed: was "✕" text — now Ionicons */}
      <TouchableOpacity
        onPress={onDelete}
        style={s.setDeleteBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={14} color={COLORS.muted} />
      </TouchableOpacity>
    </View>
  );
}

// ── Tag → icon (replaces per-exercise emoji field) ────────────────────────────

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

// ── Exercise Card ─────────────────────────────────────────────────────────────

export default function ExerciseCard({
  exercise,
  onRemove,
  onTimerOpen,
}: Props) {
  const [sets, setSets] = useState<SetData[]>([
    { id: 1, weight: "", reps: "", done: false },
    { id: 2, weight: "", reps: "", done: false },
    { id: 3, weight: "", reps: "", done: false },
  ]);

  const addSet = useCallback(
    () =>
      setSets((prev) => [
        ...prev,
        { id: Date.now(), weight: "", reps: "", done: false },
      ]),
    [],
  );

  const updateSet = useCallback(
    (id: number, updated: SetData) =>
      setSets((prev) => prev.map((s) => (s.id === id ? updated : s))),
    [],
  );

  const removeSet = useCallback(
    (id: number) => setSets((prev) => prev.filter((s) => s.id !== id)),
    [],
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
    <View style={[s.exerciseCard, allDone && s.exerciseCardDone]}>
      {/* Progress bar */}
      <View style={s.progressTrack}>
        <View style={[s.progressFill, { width: `${progressPct * 100}%` }]} />
      </View>

      {/* Header */}
      <View style={s.exerciseCardHeader}>
        <View style={[s.exerciseIconWrap, allDone && s.exerciseIconWrapDone]}>
          {/* Fixed: was exercise.icon emoji — now Ionicons mapped from tag */}
          <Ionicons
            name={getExerciseIcon(exercise.tag)}
            size={20}
            color={allDone ? COLORS.accent : `${COLORS.accent}99`}
          />
        </View>

        <View style={s.exerciseTitleCol}>
          <Text style={s.exerciseName} numberOfLines={1}>
            {exercise.name}
          </Text>
          <View style={s.exerciseMetaRow}>
            <Text style={s.exerciseMuscle}>{exercise.muscle}</Text>
            <View style={s.dot} />
            <Text
              style={[s.exerciseSets, doneCount > 0 && s.exerciseSetsActive]}
            >
              {doneCount}/{sets.length} sets
            </Text>
          </View>
        </View>

        {volDisplay && (
          <View style={s.volPill}>
            <Text style={s.exerciseVol}>{volDisplay}</Text>
          </View>
        )}

        {/* Fixed: was "✕" text — now Ionicons, hitSlop fixed to object */}
        <TouchableOpacity
          onPress={onRemove}
          style={s.exerciseRemove}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={16} color={COLORS.muted} />
        </TouchableOpacity>
      </View>

      {/* Column headers */}
      <View style={s.setHeaderRow}>
        <Text style={[s.setHeaderText, { width: 28 }]}>#</Text>
        <Text style={[s.setHeaderText, { flex: 1 }]}>WEIGHT</Text>
        <View style={{ width: 22 }} />
        <Text style={[s.setHeaderText, { flex: 1 }]}>REPS</Text>
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

      {/* Add set — Fixed: was ＋ emoji text — now Ionicons */}
      <TouchableOpacity
        onPress={addSet}
        style={s.addSetBtn}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={14} color={COLORS.muted} />
        <Text style={s.addSetText}>ADD SET</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  exerciseCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    overflow: "hidden",
  },
  exerciseCardDone: {
    borderColor: `${COLORS.accent}55`,
  },
  progressTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: `${COLORS.accent}18`,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.accent,
    borderRadius: 99,
  },
  exerciseCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    marginBottom: 14,
  },
  exerciseIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: `${COLORS.accent}15`,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: `${COLORS.accent}25`,
  },
  exerciseIconWrapDone: {
    backgroundColor: `${COLORS.accent}28`,
    borderColor: `${COLORS.accent}55`,
  },
  exerciseTitleCol: { flex: 1, gap: 3 },
  exerciseName: {
    fontFamily: FONTS.bold,
    fontSize: 19,
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  exerciseMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  exerciseMuscle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 99,
    backgroundColor: COLORS.muted,
  },
  exerciseSets: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.muted,
  },
  exerciseSetsActive: { color: COLORS.accent },
  volPill: {
    backgroundColor: `${COLORS.accent}18`,
    borderWidth: 1,
    borderColor: `${COLORS.accent}35`,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  exerciseVol: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.accent,
    letterSpacing: 0.3,
  },
  exerciseRemove: { padding: 6 },
  setHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 2,
    marginBottom: 6,
    gap: 8,
  },
  setHeaderText: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: COLORS.muted,
    letterSpacing: 1,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 7,
    paddingVertical: 1,
  },
  setRowDone: { opacity: 0.72 },
  setBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.bg3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  setBadgeDone: {
    backgroundColor: `${COLORS.accent}18`,
    borderColor: `${COLORS.accent}30`,
  },
  setBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.muted,
  },
  setBadgeTextDone: { color: COLORS.accent },
  setInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bg3,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    paddingHorizontal: 10,
    height: 40,
  },
  setInputWrapDone: { borderColor: `${COLORS.accent}30` },
  setInput: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: COLORS.text,
    padding: 0,
  },
  setInputUnit: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.muted,
    marginLeft: 2,
  },
  setX: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.muted,
    width: 14,
    textAlign: "center",
  },
  setDoneBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: COLORS.bg3,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  setDoneBtnActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 4,
  },
  setDeleteBtn: { padding: 6 },
  addSetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    borderRadius: 11,
    paddingVertical: 11,
  },
  addSetText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.muted,
    letterSpacing: 1.5,
  },
});
