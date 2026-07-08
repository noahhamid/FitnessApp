import { Ionicons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
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

export function createInitialExerciseSets(
  count: number = 3,
  previousSets?: { weight: string; reps: string }[],
  target?: { weight: string; reps: string },
): ExerciseSetData[] {
  return Array.from({ length: count }, (_, i) => {
    const prev = previousSets?.[i];
    const seed = prev ?? target;
    return {
      id: Date.now() + i,
      weight: seed?.weight ?? "",
      reps: seed?.reps ?? "",
      done: false,
      previous: prev ? `${prev.weight}kg × ${prev.reps}` : undefined,
    };
  });
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

// ─── Stepper ───────────────────────────────────────────────────────────────────
function Stepper({
  value,
  onChange,
  step,
  decimals = 0,
  done,
}: {
  value: string;
  onChange: (v: string) => void;
  step: number;
  decimals?: number;
  done: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const repeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const numeric = parseFloat(value || "0") || 0;

  const nudge = useCallback(
    (dir: 1 | -1) => {
      const next = Math.max(0, numeric + step * dir);
      onChange(
        decimals > 0 ? next.toFixed(decimals) : String(Math.round(next)),
      );
    },
    [numeric, step, decimals, onChange],
  );

  const startRepeat = (dir: 1 | -1) => {
    nudge(dir);
    repeatRef.current = setInterval(() => nudge(dir), 140);
  };
  const stopRepeat = () => {
    if (repeatRef.current) clearInterval(repeatRef.current);
    repeatRef.current = null;
  };

  return (
    <View style={[ss.stepper, done && ss.stepperDone]}>
      <TouchableOpacity
        style={ss.stepBtn}
        onPressIn={() => startRepeat(-1)}
        onPressOut={stopRepeat}
        hitSlop={{ top: 10, bottom: 10, left: 6, right: 2 }}
      >
        <Ionicons name="remove" size={13} color={T.sub} />
      </TouchableOpacity>

      {editing ? (
        <TextInput
          value={value}
          onChangeText={onChange}
          onBlur={() => setEditing(false)}
          keyboardType="decimal-pad"
          style={ss.stepValueInput}
          autoFocus
          selectTextOnFocus
        />
      ) : (
        <TouchableOpacity
          onPress={() => setEditing(true)}
          style={ss.stepValueWrap}
          hitSlop={{ top: 6, bottom: 6, left: 0, right: 0 }}
        >
          <Text
            style={ss.stepValue}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {value || "—"}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={ss.stepBtn}
        onPressIn={() => startRepeat(1)}
        onPressOut={stopRepeat}
        hitSlop={{ top: 10, bottom: 10, left: 2, right: 6 }}
      >
        <Ionicons name="add" size={13} color={T.sub} />
      </TouchableOpacity>
    </View>
  );
}

type SetRowProps = {
  setNum: number;
  set: ExerciseSetData;
  onChange: (updated: ExerciseSetData) => void;
  onDelete: () => void;
  onTimerOpen: () => void;
};

function SetRow({ setNum, set, onChange, onDelete, onTimerOpen }: SetRowProps) {
  const handleToggleDone = useCallback(() => {
    const next = !set.done;
    onChange({ ...set, done: next });
    if (next) onTimerOpen();
  }, [set, onChange, onTimerOpen]);

  return (
    <View style={[ss.setRow, set.done && ss.setRowDone]}>
      <View style={[ss.setBadge, set.done && ss.setBadgeDone]}>
        <Text style={[ss.setBadgeText, set.done && ss.setBadgeTextDone]}>
          {setNum}
        </Text>
      </View>

      <Text
        style={ss.prevText}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {set.previous ?? "—"}
      </Text>

      <Stepper
        value={set.weight}
        onChange={(v) => onChange({ ...set, weight: v })}
        step={1.25}
        decimals={2}
        done={set.done}
      />

      <Stepper
        value={set.reps}
        onChange={(v) => onChange({ ...set, reps: v })}
        step={1}
        done={set.done}
      />

      <TouchableOpacity
        onPress={handleToggleDone}
        style={[ss.doneBtn, set.done && ss.doneBtnActive]}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
      >
        <Ionicons
          name="checkmark"
          size={15}
          color={set.done ? T.bg0 : T.muted}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onDelete}
        style={ss.deleteBtn}
        hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
      >
        <Ionicons name="close" size={11} color={T.muted + "80"} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Muscle / Tag Pill ─────────────────────────────────────────────────────────
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
  const addSet = useCallback(() => {
    const last = sets[sets.length - 1];
    onSetsChange([
      ...sets,
      {
        id: Date.now(),
        weight: last?.weight ?? "",
        reps: last?.reps ?? "",
        done: false,
      },
    ]);
  }, [sets, onSetsChange]);

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
      <View style={ss.progressTrack}>
        <View
          style={[ss.progressFill, { width: `${progressPct * 100}%` as any }]}
        />
      </View>

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

      <View style={ss.colHeaders}>
        <Text style={[ss.colHeader, ss.colSet]}>SET</Text>
        <Text style={[ss.colHeader, ss.colPrev]}>PREV</Text>
        <Text style={[ss.colHeader, ss.colInput]}>KG</Text>
        <Text style={[ss.colHeader, ss.colInput]}>REPS</Text>
        <View style={ss.colCheck} />
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
// Shrunk fixed columns so the steppers get real horizontal room for the number
const COL_SET = 24;
const COL_PREV = 40;
const COL_CHECK = 30;
const COL_DEL = 16;

const ss = StyleSheet.create({
  card: {
    backgroundColor: T.bg1,
    borderWidth: 1,
    borderColor: T.borderMid,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 6,
    marginBottom: 10,
    overflow: "hidden",
  },
  cardDone: { borderColor: T.goldBorder },

  progressTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: T.bg3,
  },
  progressFill: { height: "100%", backgroundColor: T.gold },

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
  headerRight: { alignItems: "flex-end", gap: 4 },
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

  pillRow: { flexDirection: "row", alignItems: "center", gap: 6 },
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
  pillCustom: { backgroundColor: T.goldDim, borderColor: T.goldBorder },
  pillIcon: { marginRight: 3 },
  pillText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    color: T.sub,
    letterSpacing: 0.6,
  },
  pillTextCustom: { color: T.gold },

  colHeaders: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  colInput: { flex: 1, textAlign: "center" },
  colCheck: { width: COL_CHECK },

  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  setRowDone: { opacity: 0.55 },

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
    fontSize: 12,
    color: T.sub,
  },
  setBadgeTextDone: { color: T.gold },

  prevText: {
    width: COL_PREV,
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: T.muted,
    textAlign: "center",
  },

  // Stepper — buttons shrunk so the number gets real room
  stepper: {
    flex: 1,
    minWidth: 78,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: T.bg2,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 10,
    height: 42,
    paddingHorizontal: 2,
  },
  stepperDone: { borderColor: T.goldBorder },
  stepBtn: {
    width: 22,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  stepValueWrap: {
    flex: 1,
    minWidth: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  stepValue: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 18,
    color: T.text,
    textAlign: "center",
  },
  stepValueInput: {
    flex: 1,
    minWidth: 30,
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 18,
    color: T.text,
    padding: 0,
    textAlign: "center",
  },

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
  doneBtnActive: { backgroundColor: T.gold, borderColor: T.gold },

  deleteBtn: { width: COL_DEL, alignItems: "center", justifyContent: "center" },

  addSetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 12,
    marginTop: 2,
  },
  addSetText: { fontFamily: "DMSans_500Medium", fontSize: 12, color: T.muted },
});
