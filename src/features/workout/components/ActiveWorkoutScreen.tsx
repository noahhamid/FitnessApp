import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  TextInput,
  ScrollView,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from "react-native-svg";
import {
  X,
  Pause,
  Play,
  SkipForward,
  Check,
  Minus,
  Plus,
  Flag,
  ChevronLeft,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { WorkoutPlan, type Exercise } from "../data/workouts";
import { T } from "@/src/theme";
import { ExerciseLibrarySection } from "./ExerciseLibrarySection";
import { ExerciseDetailCard } from "./ExerciseDetailCard";
import { useAddToLiveSession } from "../hooks/useAddToLiveSession";
import {
  useDeleteWorkoutSession,
  useUpdateSessionExercise,
} from "../hooks/useWorkoutSession";
import { topInset } from "@/src/lib/safe-area";
import { imageForMuscleGroup } from "@/src/lib/workout-plan-adapter";
import type { LibraryExercise } from "../hooks/useExerciseLibrary";

type Phase = "exercise" | "rest" | "done";
/** list = home base; focus = logging one exercise (manual tap or auto-play). */
type ScreenMode = "list" | "focus";
type PlayMode = "manual" | "auto";

export interface SetLog {
  exerciseName: string;
  reps?: number;
  weight?: number;
  durationSec?: number;
  completed: boolean;
}

type Props = {
  plan: WorkoutPlan;
  onClose: () => void;
  onFinish: (logs: SetLog[]) => void;
  lastPerformance?: Record<string, { weight?: number; reps?: number }>;
  /** Null while background session create is still in flight. */
  sessionId: string | null;
  /** True until POST /api/workouts resolves (or fails). */
  sessionCreating?: boolean;
  /** Set when background create fails — shows retry banner. */
  sessionCreateError?: string | null;
  onRetryCreateSession?: () => void;
  exercises?: Exercise[];
  onExercisesChange?: (exercises: Exercise[]) => void;
  onAppendExercise?: (exercise: Exercise) => void;
  /**
   * "auto" = skip the list and drop straight into auto-sequential play
   * from the first exercise (fresh start from the plan/detail screen —
   * the person already tapped "Start", a second tap into the list would
   * be a redundant double-start).
   * "list" = show the exercise list first (resuming an in-progress
   * session — the person may want to see what's done before deciding
   * what to do next). Defaults to "list".
   */
  initialMode?: "list" | "auto";
};

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const haptic = (style: Haptics.ImpactFeedbackStyle) => {
  Haptics.impactAsync(style).catch(() => {});
};

/** Resume hydration: target set counts come from Exercise.sets; progress from loggedSets. */
function initialSetsDoneFromExercises(
  exercises: Exercise[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const ex of exercises) {
    const logged = ex.loggedSets;
    if (!logged?.length) continue;
    const completed = logged.filter((s) => s.completed !== false).length;
    if (completed > 0) {
      out[ex.id] = Math.min(completed, ex.sets);
    }
  }
  return out;
}

function initialLogsFromExercises(exercises: Exercise[]): SetLog[] {
  const logs: SetLog[] = [];
  for (const ex of exercises) {
    for (const s of ex.loggedSets ?? []) {
      logs.push({
        exerciseName: ex.name,
        reps: s.reps,
        weight: s.weight,
        durationSec: s.durationSec,
        completed: s.completed !== false,
      });
    }
  }
  return logs;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CountdownRing = ({
  left,
  total,
  size = 128,
}: {
  left: number;
  total: number;
  size?: number;
}) => {
  const sw = 8;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const prog = useRef(new Animated.Value(total > 0 ? left / total : 0)).current;

  useEffect(() => {
    Animated.timing(prog, {
      toValue: total > 0 ? left / total : 0,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [left]);

  const offset = prog.interpolate({
    inputRange: [0, 1],
    outputRange: [circ, 0],
  });

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
        <Defs>
          <SvgGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={T.accentOnDark} />
            <Stop offset="100%" stopColor={T.accentOnDarkSoft} />
          </SvgGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={sw}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth={sw}
          fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={s.ringTime}>{fmt(left)}</Text>
    </View>
  );
};

function LibraryModalBody({
  onClose,
  sessionExerciseNames,
  onAdd,
  addingName,
  addError,
}: {
  onClose: () => void;
  sessionExerciseNames: Set<string>;
  onAdd: (ex: LibraryExercise) => void;
  addingName: string | null;
  addError: string | null;
}) {
  const insets = useSafeAreaInsets();
  const safeTop = topInset(insets.top);
  const [viewing, setViewing] = useState<LibraryExercise | null>(null);

  if (viewing) {
    const alreadyIn = sessionExerciseNames.has(viewing.name);
    return (
      <ExerciseDetailCard
        exercise={viewing}
        imageUrl={imageForMuscleGroup(viewing.muscleGroup)}
        addedToToday={alreadyIn}
        allowRemove={false}
        showStart={false}
        addLabel="Add to this workout"
        addPending={!!addingName}
        onBack={() => setViewing(null)}
        onStart={() => {}}
        onAddToToday={() => onAdd(viewing)}
        onRemoveFromToday={() => {}}
      />
    );
  }

  return (
    <View style={[s.libraryModal, { paddingTop: safeTop + 8 }]}>
      <View style={s.libraryModalHeader}>
        <Text style={s.libraryModalTitle}>Add to workout</Text>
        <Pressable
          onPress={onClose}
          hitSlop={8}
          style={s.libraryCloseBtn}
          accessibilityRole="button"
          accessibilityLabel="Close library"
        >
          <X size={18} color={T.white} strokeWidth={2.2} />
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ExerciseLibrarySection onView={(ex) => setViewing(ex)} />
        {addingName && (
          <Text style={s.addingHint}>Adding {addingName}…</Text>
        )}
        {addError && <Text style={s.addErrorText}>{addError}</Text>}
      </ScrollView>
    </View>
  );
}

const Stepper = ({
  label,
  value,
  onChange,
  step = 1,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  unit?: string;
}) => (
  <View style={s.stepperWrap}>
    <Text style={s.stepperLabel}>{label}</Text>
    <View style={s.stepperRow}>
      <TouchableOpacity
        style={s.stepperBtn}
        onPress={() => onChange(Math.max(0, value - step))}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Minus size={14} color={T.onDark} strokeWidth={2.4} />
      </TouchableOpacity>
      <View style={s.stepperValueWrap}>
        <TextInput
          style={s.stepperInput}
          value={String(value)}
          keyboardType="numeric"
          onChangeText={(t) => {
            const n = parseInt(t.replace(/[^0-9]/g, ""), 10);
            onChange(isNaN(n) ? 0 : n);
          }}
          selectTextOnFocus
        />
        {unit && <Text style={s.stepperUnit}>{unit}</Text>}
      </View>
      <TouchableOpacity
        style={s.stepperBtn}
        onPress={() => onChange(value + step)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Plus size={14} color={T.onDark} strokeWidth={2.4} />
      </TouchableOpacity>
    </View>
  </View>
);

export function ActiveWorkoutScreen({
  plan,
  onClose,
  onFinish,
  lastPerformance,
  sessionId,
  sessionCreating = false,
  sessionCreateError = null,
  onRetryCreateSession,
  exercises: exercisesProp,
  onExercisesChange,
  onAppendExercise,
  initialMode = "list",
}: Props) {
  const insets = useSafeAreaInsets();
  const safeTop = topInset(insets.top);
  const {
    addExercise: addToLiveSession,
    addingName,
    addError,
  } = useAddToLiveSession(sessionId);
  const deleteSession = useDeleteWorkoutSession();
  const updateSessionExercise = useUpdateSessionExercise();
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const sessionReady = !!sessionId && !sessionCreating && !sessionCreateError;

  const guardSessionReady = (actionLabel: string): boolean => {
    if (sessionReady) return true;
    if (sessionCreateError) {
      Alert.alert(
        "Workout not saved yet",
        sessionCreateError,
        onRetryCreateSession
          ? [
              { text: "Dismiss", style: "cancel" },
              { text: "Retry", onPress: onRetryCreateSession },
            ]
          : [{ text: "OK" }],
      );
      return false;
    }
    Alert.alert(
      "Still setting up",
      `Hang on a moment — ${actionLabel} will be available once your workout is saved.`,
    );
    return false;
  };

  const dismissCancelConfirm = () => setCancelConfirmOpen(false);

  const confirmCancelWorkout = () => {
    if (deleteSession.isPending) return;
    setCancelConfirmOpen(false);
    // No server row yet — just leave.
    if (!sessionId) {
      onClose();
      return;
    }
    deleteSession.mutate(sessionId, {
      onSuccess: () => onClose(),
      onError: (err) => {
        Alert.alert(
          "Couldn't cancel workout",
          err instanceof Error
            ? err.message
            : "Check your connection and try again.",
        );
      },
    });
  };

  const [localExercises, setLocalExercises] = useState<Exercise[]>(
    () => plan.exercises,
  );
  const exercises = exercisesProp ?? localExercises;
  const exercisesRef = useRef(exercises);
  exercisesRef.current = exercises;

  const appendExercise = (ex: Exercise) => {
    if (onAppendExercise) {
      onAppendExercise(ex);
      return;
    }
    if (onExercisesChange) {
      onExercisesChange([...exercisesRef.current, ex]);
      return;
    }
    setLocalExercises((prev) => [...prev, ex]);
  };

  const removeExerciseById = (id: string) => {
    const next = exercisesRef.current.filter((e) => e.id !== id);
    if (onExercisesChange) onExercisesChange(next);
    else setLocalExercises(next);
  };

  const remapExerciseId = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const next = exercisesRef.current.map((e) =>
      e.id === fromId ? { ...e, id: toId } : e,
    );
    if (onExercisesChange) onExercisesChange(next);
    else setLocalExercises(next);
    setSetsDone((prev) => {
      if (!(fromId in prev)) return prev;
      const { [fromId]: count, ...rest } = prev;
      return { ...rest, [toId]: count };
    });
    setSelectedId((cur) => (cur === fromId ? toId : cur));
  };

  const sessionExerciseNames = useMemo(
    () => new Set(exercises.map((e) => e.name)),
    [exercises],
  );

  const handleAddFromLibrary = (libEx: LibraryExercise) => {
    void addToLiveSession(libEx, {
      alreadyAdded: sessionExerciseNames,
      onOptimistic: appendExercise,
      onRollback: removeExerciseById,
      onCommitted: remapExerciseId,
      onAfterOptimistic: () => setLibraryOpen(false),
      onAfterError: () => setLibraryOpen(true),
    });
  };

  // ── Interaction model ────────────────────────────────────────────────────
  // list  = home base (nothing auto-starts)
  // focus = logging one exercise; playMode manual (tapped) or auto (Start workout)
  // initialMode="auto" (fresh start) drops straight into auto-play on the
  // first exercise instead of requiring a redundant second "Start" tap.
  const [screenMode, setScreenMode] = useState<ScreenMode>(
    initialMode === "auto" && exercises.length > 0 ? "focus" : "list",
  );
  const [playMode, setPlayMode] = useState<PlayMode>(
    initialMode === "auto" ? "auto" : "manual",
  );
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    initialMode === "auto" ? (exercises[0]?.id ?? null) : null,
  );
  // Fresh start: no loggedSets → {}. Resume: hydrate from Stage-1 PATCH data.
  const [setsDone, setSetsDone] = useState<Record<string, number>>(() =>
    initialSetsDoneFromExercises(exercises),
  );
  const [phase, setPhase] = useState<Phase>("exercise");
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [secsLeft, setSecsLeft] = useState<number | null>(null);

  const selected =
    exercises.find((e) => e.id === selectedId) ?? null;
  const doneForSelected = selected ? (setsDone[selected.id] ?? 0) : 0;
  const setNum = doneForSelected + 1;
  const selectedComplete = selected
    ? doneForSelected >= selected.sets
    : false;

  const setsDoneRef = useRef(setsDone);
  setsDoneRef.current = setsDone;

  const isExComplete = (ex: Exercise, doneMap = setsDoneRef.current) =>
    (doneMap[ex.id] ?? 0) >= ex.sets;

  const firstIncompleteId = () => {
    const doneMap = setsDoneRef.current;
    const hit = exercisesRef.current.find((e) => !isExComplete(e, doneMap));
    return hit?.id ?? null;
  };

  const nextIncompleteIdAfter = (afterId: string, doneMap = setsDoneRef.current) => {
    const list = exercisesRef.current;
    const idx = list.findIndex((e) => e.id === afterId);
    for (let i = idx + 1; i < list.length; i++) {
      if (!isExComplete(list[i], doneMap)) return list[i].id;
    }
    return null;
  };

  const totalSets = useMemo(
    () => exercises.reduce((a, e) => a + e.sets, 0),
    [exercises],
  );
  const doneSets = useMemo(
    () =>
      exercises.reduce(
        (a, e) => a + Math.min(setsDone[e.id] ?? 0, e.sets),
        0,
      ),
    [exercises, setsDone],
  );

  const logsRef = useRef<SetLog[]>(initialLogsFromExercises(exercises));
  const [currentReps, setCurrentReps] = useState(8);
  const [currentWeight, setCurrentWeight] = useState(0);

  const requestCancelWorkout = () => {
    if (deleteSession.isPending) return;
    // Stage 1 persists sets mid-workout — leave the session for Resume /
    // ContinueWorkoutCard instead of deleting whenever anything is logged.
    const hasLocalProgress =
      Object.values(setsDoneRef.current).some((n) => n > 0) ||
      logsRef.current.length > 0 ||
      exercisesRef.current.some((e) => (e.loggedSets?.length ?? 0) > 0);
    if (hasLocalProgress) {
      onClose();
      return;
    }
    setCancelConfirmOpen(true);
  };

  useEffect(() => {
    if (!selected) return;
    const last = lastPerformance?.[selected.name];
    setCurrentReps(selected.reps ?? last?.reps ?? 8);
    setCurrentWeight(last?.weight ?? 0);
  }, [selectedId]);

  // ── animated values ────────────────────────────────────────────────────────
  const panelY = useRef(new Animated.Value(60)).current;
  const imgScale = useRef(new Animated.Value(1)).current;
  const exFade = useRef(new Animated.Value(1)).current;
  const exSlide = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const pauseScale = useRef(new Animated.Value(1)).current;
  const setNumScale = useRef(new Animated.Value(1)).current;
  const restContentOpacity = useRef(new Animated.Value(0)).current;
  const exContentOpacity = useRef(new Animated.Value(1)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const doneOpacity = useRef(new Animated.Value(0)).current;
  const doneScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.spring(panelY, {
      toValue: 0,
      friction: 9,
      tension: 55,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: totalSets > 0 ? doneSets / totalSets : 0,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [doneSets, totalSets]);

  useEffect(() => {
    if (paused || phase === "done") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [paused, phase]);

  useEffect(() => {
    if (screenMode !== "focus" || !selected) {
      setSecsLeft(null);
      return;
    }
    // Rest must keep ticking even after the just-finished set made
    // selectedComplete true (auto-play rests before jumping ahead).
    if (phase === "rest") {
      setSecsLeft(selected.restSec);
      return;
    }
    if (selectedComplete) {
      setSecsLeft(null);
      return;
    }
    if (phase === "exercise" && selected.type === "duration")
      setSecsLeft(selected.durationSec ?? 0);
    else setSecsLeft(null);
  }, [phase, selectedId, doneForSelected, screenMode, selectedComplete]);

  const completeCurrentSetRef = useRef<() => void>(() => {});
  const advanceFromRestRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (paused || secsLeft === null || screenMode !== "focus" || !selected)
      return;
    if (secsLeft <= 0) {
      if (phase === "rest") {
        advanceFromRestRef.current();
      } else if (phase === "exercise" && selected.type === "duration") {
        completeCurrentSetRef.current();
      }
      return;
    }
    const t = setTimeout(() => setSecsLeft((n) => (n ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [secsLeft, paused, phase, selected, screenMode]);

  useEffect(() => {
    const toRest = phase === "rest" && screenMode === "focus";
    Animated.parallel([
      Animated.timing(restContentOpacity, {
        toValue: toRest ? 1 : 0,
        duration: 320,
        useNativeDriver: false,
      }),
      Animated.timing(exContentOpacity, {
        toValue: toRest ? 0 : 1,
        duration: 320,
        useNativeDriver: false,
      }),
    ]).start();
  }, [phase, screenMode]);

  useEffect(() => {
    exFade.setValue(0);
    exSlide.setValue(14);
    imgScale.setValue(1.05);
    Animated.parallel([
      Animated.timing(exFade, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(exSlide, {
        toValue: 0,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(imgScale, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedId, screenMode]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(setNumScale, {
        toValue: 1.28,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(setNumScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [setNum]);

  useEffect(() => {
    if (phase !== "done") return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    Animated.parallel([
      Animated.timing(doneOpacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.spring(doneScale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
    const t = setTimeout(() => onFinish(logsRef.current), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  const logCurrentSet = (completed: boolean) => {
    if (!selected) return;
    logsRef.current.push({
      exerciseName: selected.name,
      reps: selected.type === "reps" ? currentReps : undefined,
      weight: selected.type === "reps" ? currentWeight : undefined,
      durationSec:
        selected.type === "duration"
          ? (selected.durationSec ?? 0)
          : undefined,
      completed,
    });
  };

  /**
   * Background-sync this exercise's logged sets so far. Uses WorkoutExercise
   * row id (remapped after session create / live-add). Failures are quiet —
   * Finish's POST /complete remains the authoritative write.
   */
  const syncExerciseSets = (ex: Exercise) => {
    if (!sessionId) return;
    // Guard against catalog / optimistic ids that predate remapping.
    if (
      ex.id.startsWith("pending-") ||
      ex.id.startsWith("live-") ||
      ex.id.startsWith("standalone-")
    ) {
      console.log(
        `[set-sync] skip "${ex.name}" — id ${ex.id} is not a WorkoutExercise row yet`,
      );
      return;
    }

    const sets = logsRef.current
      .filter((l) => l.exerciseName === ex.name)
      .map((l) => ({
        reps: l.reps,
        weight: l.weight,
        durationSec: l.durationSec,
        completed: l.completed,
      }));
    if (sets.length === 0) return;

    console.log(
      `[set-sync] PATCH /api/workouts/${sessionId}/exercises/${ex.id} (${sets.length} set(s) for "${ex.name}")`,
    );
    void updateSessionExercise
      .mutateAsync({ sessionId, exerciseId: ex.id, sets })
      .then(() => {
        console.log(
          `[set-sync] ok — "${ex.name}" (${ex.id}) now has ${sets.length} set(s)`,
        );
      })
      .catch((e) => {
        console.log(
          `[set-sync] failed for "${ex.name}" (${ex.id}):`,
          e instanceof Error ? e.message : e,
        );
      });
  };

  const returnToList = () => {
    setScreenMode("list");
    setSelectedId(null);
    setPhase("exercise");
    setPaused(false);
    setSecsLeft(null);
  };

  const enterFocus = (exId: string, mode: PlayMode) => {
    setSelectedId(exId);
    setPlayMode(mode);
    setScreenMode("focus");
    setPhase("exercise");
    setPaused(false);
  };

  /** After rest ends: next set of same exercise, or (auto) next incomplete. */
  const advanceFromRest = () => {
    if (!selected) {
      returnToList();
      return;
    }
    if (doneForSelected < selected.sets) {
      // More sets on this exercise
      setPhase("exercise");
      return;
    }
    // Exercise finished during the set that preceded this rest
    if (playMode === "auto") {
      const nextId = nextIncompleteIdAfter(selected.id);
      if (nextId) {
        setSelectedId(nextId);
        setPhase("exercise");
      } else {
        returnToList();
      }
    } else {
      returnToList();
    }
  };
  advanceFromRestRef.current = advanceFromRest;

  const completeCurrentSet = () => {
    if (!selected || selectedComplete || screenMode !== "focus") return;
    logCurrentSet(true);
    const newDone = doneForSelected + 1;
    const nextDoneMap = { ...setsDoneRef.current, [selected.id]: newDone };
    setSetsDone(nextDoneMap);
    // Persist incrementally — does not block UI / Finish.
    syncExerciseSets(selected);

    if (newDone >= selected.sets) {
      haptic(Haptics.ImpactFeedbackStyle.Medium);
      if (playMode === "manual") {
        // All sets done via tap-one → back to list (no trailing rest)
        returnToList();
        return;
      }
      // Auto: rest, then skip ahead to next incomplete on rest end
      const nextId = nextIncompleteIdAfter(selected.id, nextDoneMap);
      if (!nextId) {
        returnToList();
        return;
      }
      setPhase("rest");
      return;
    }
    setPhase("rest");
  };
  completeCurrentSetRef.current = completeCurrentSet;

  const openExerciseManual = (ex: Exercise) => {
    if (isExComplete(ex)) return;
    if (!guardSessionReady("logging sets")) return;
    haptic(Haptics.ImpactFeedbackStyle.Light);
    enterFocus(ex.id, "manual");
  };

  const startAutoWorkout = () => {
    if (!guardSessionReady("starting the workout")) return;
    const id = firstIncompleteId();
    if (!id) {
      haptic(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    haptic(Haptics.ImpactFeedbackStyle.Medium);
    enterFocus(id, "auto");
  };

  const onCompletePress = () => {
    haptic(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(btnScale, {
        toValue: 0.93,
        duration: 85,
        useNativeDriver: true,
      }),
      Animated.spring(btnScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start(completeCurrentSet);
  };

  const onHoldTogglePress = () => {
    haptic(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(btnScale, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(btnScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start(() => setPaused((p) => !p));
  };

  const onPausePress = () => {
    haptic(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(pauseScale, {
        toValue: 0.88,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.spring(pauseScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start(() => setPaused((p) => !p));
  };

  const onSkipRest = () => {
    haptic(Haptics.ImpactFeedbackStyle.Light);
    advanceFromRest();
  };

  const onFinishPress = () => {
    if (!guardSessionReady("finishing")) return;
    haptic(Haptics.ImpactFeedbackStyle.Medium);
    setPhase("done");
  };

  const barPct = barWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const heroImage =
    (screenMode === "focus" && selected?.imageUrl) ||
    exercises[0]?.imageUrl ||
    plan.coverImage;

  const incompleteCount = exercises.filter((e) => !isExComplete(e)).length;

  return (
    <View style={s.screen}>
      <Animated.Image
        source={{ uri: heroImage }}
        style={[s.bgImage, { transform: [{ scale: imgScale }] }]}
        resizeMode="cover"
      />

      <LinearGradient
        colors={[
          "rgba(8,9,11,0.70)",
          "rgba(8,9,11,0.12)",
          "rgba(8,9,11,0.00)",
          "rgba(8,9,11,0.62)",
        ]}
        locations={[0, 0.26, 0.58, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <View
        style={[s.topContent, { paddingTop: safeTop + 8 }]}
        pointerEvents="box-none"
      >
        <View style={s.topBar}>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={
              screenMode === "focus" ? returnToList : requestCancelWorkout
            }
            disabled={screenMode !== "focus" && deleteSession.isPending}
            activeOpacity={0.85}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={
              screenMode === "focus" ? "Back to exercise list" : "Close workout"
            }
          >
            {screenMode === "focus" ? (
              <ChevronLeft size={20} color={T.onDark} strokeWidth={2.2} />
            ) : deleteSession.isPending ? (
              <ActivityIndicator size="small" color={T.onDark} />
            ) : (
              <X size={18} color={T.onDark} strokeWidth={2.2} />
            )}
          </TouchableOpacity>

          <View style={s.titleBlock}>
            <Text style={s.topTitle} numberOfLines={1}>
              {plan.title}
            </Text>
            <View style={s.elapsedPill}>
              <Text style={s.elapsedText}>{fmt(elapsed)}</Text>
            </View>
          </View>

          <Animated.View style={{ transform: [{ scale: pauseScale }] }}>
            <TouchableOpacity
              style={s.iconBtn}
              onPress={onPausePress}
              activeOpacity={0.85}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={paused ? "Resume workout" : "Pause workout"}
            >
              {paused ? (
                <Play size={16} color={T.onDark} strokeWidth={2.2} />
              ) : (
                <Pause size={16} color={T.onDark} strokeWidth={2.2} />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {!!sessionCreateError && (
          <Pressable
            style={s.setupErrorBanner}
            onPress={onRetryCreateSession}
            accessibilityRole="button"
            accessibilityLabel="Retry saving workout"
          >
            <Text style={s.setupErrorText}>
              Couldn't save this workout. Tap to retry.
            </Text>
          </Pressable>
        )}

        <View style={s.progressTrack}>
          <Animated.View style={[s.progressFill, { width: barPct }]} />
        </View>

        <Animated.View
          pointerEvents="none"
          style={[
            s.heroWrap,
            { opacity: exFade, transform: [{ translateY: exSlide }] },
          ]}
        >
          <Text style={s.heroTitle} numberOfLines={2}>
            {screenMode === "focus" && selected
              ? selected.name
              : "Your workout"}
          </Text>
          <Text style={s.heroSub} numberOfLines={1}>
            {screenMode === "focus" && selected
              ? `${selected.sets} sets · ${
                  selected.type === "reps"
                    ? `${selected.reps} reps`
                    : `${selected.durationSec}s hold`
                } · ${doneForSelected}/${selected.sets} done`
              : `${doneSets}/${totalSets} sets · ${incompleteCount} left`}
          </Text>
        </Animated.View>
      </View>

      <Animated.View
        style={[s.panelOuter, { transform: [{ translateY: panelY }] }]}
      >
        <View style={[s.panel, { paddingBottom: insets.bottom + 18 }]}>
          <ScrollView
            style={s.panelScroll}
            contentContainerStyle={s.panelScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── LIST (home base) ─────────────────────────────────────── */}
            {screenMode === "list" && (
              <>
                <View style={s.listHeaderRow}>
                  <Text style={s.listLabel}>Exercises</Text>
                  <Pressable
                    onPress={() => {
                      if (!guardSessionReady("adding exercises")) return;
                      setLibraryOpen(true);
                    }}
                    hitSlop={8}
                    style={[s.addExBtn, !sessionReady && s.actionDisabled]}
                    accessibilityRole="button"
                    accessibilityLabel="Add exercise"
                  >
                    <Plus
                      size={14}
                      color={T.accentOnDark}
                      strokeWidth={2.6}
                    />
                    <Text style={s.addExBtnText}>Add</Text>
                  </Pressable>
                </View>

                <View style={s.exList}>
                  {exercises.map((ex) => {
                    const done = setsDone[ex.id] ?? 0;
                    const complete = done >= ex.sets;
                    return (
                      <TouchableOpacity
                        key={ex.id}
                        style={[
                          s.exListRow,
                          complete && s.exListRowDone,
                          !sessionReady && !complete && s.actionDisabled,
                        ]}
                        activeOpacity={complete ? 1 : 0.85}
                        onPress={() => openExerciseManual(ex)}
                        disabled={complete}
                        accessibilityRole="button"
                        accessibilityLabel={`${ex.name}, ${done} of ${ex.sets} sets`}
                      >
                        <View
                          style={[
                            s.exStatusDot,
                            complete && s.exStatusDotDone,
                          ]}
                        >
                          {complete && (
                            <Check
                              size={11}
                              color={T.accentOnDarkText}
                              strokeWidth={3}
                            />
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              s.exListName,
                              complete && s.exListNameDone,
                            ]}
                            numberOfLines={1}
                          >
                            {ex.name}
                          </Text>
                          <Text style={s.exListMeta}>
                            {done}/{ex.sets} sets
                            {ex.type === "reps"
                              ? ` · ${ex.reps} reps`
                              : ` · ${ex.durationSec}s`}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {incompleteCount > 0 && (
                  <TouchableOpacity
                    style={[s.startBtn, !sessionReady && s.actionDisabled]}
                    onPress={startAutoWorkout}
                    activeOpacity={0.9}
                    accessibilityRole="button"
                    accessibilityLabel="Start workout auto advance"
                  >
                    <Play
                      size={15}
                      color={T.accentOnDarkText}
                      strokeWidth={2.4}
                      fill={T.accentOnDarkText}
                    />
                    <Text style={s.startBtnText}>
                      {sessionCreating
                        ? "Setting up…"
                        : sessionCreateError
                          ? "Retry save to start"
                          : "Start workout"}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[s.finishBtn, !sessionReady && s.actionDisabled]}
                  onPress={onFinishPress}
                  activeOpacity={0.9}
                  accessibilityRole="button"
                  accessibilityLabel="Finish workout"
                >
                  <Flag
                    size={15}
                    color={T.accentOnDarkText}
                    strokeWidth={2.4}
                  />
                  <Text style={s.finishBtnText}>Finish workout</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── FOCUS (manual or auto logging) ───────────────────────── */}
            {screenMode === "focus" && selected && phase === "rest" && (
              <Animated.View
                style={[s.restBlock, { opacity: restContentOpacity }]}
              >
                <Text style={s.restEyebrow}>Rest</Text>
                <CountdownRing
                  left={secsLeft ?? 0}
                  total={selected.restSec}
                  size={120}
                />
                <Text style={s.restHint}>
                  {doneForSelected < selected.sets
                    ? `Next: set ${setNum} of ${selected.sets}`
                    : playMode === "auto"
                      ? "Up next"
                      : "Back to list"}
                </Text>
                <TouchableOpacity
                  style={s.skipBtn}
                  onPress={onSkipRest}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Skip rest"
                >
                  <SkipForward
                    size={13}
                    color={T.onDark}
                    strokeWidth={2.4}
                  />
                  <Text style={s.skipText}>Skip rest</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {screenMode === "focus" &&
              selected &&
              phase === "exercise" &&
              !selectedComplete && (
                <Animated.View
                  style={[s.activeBlock, { opacity: exContentOpacity }]}
                >
                  {playMode === "auto" && (
                    <Text style={s.autoBadge}>AUTO</Text>
                  )}
                  <Text style={s.cueLabel}>Form cue</Text>
                  <Text style={s.exInstr} numberOfLines={3}>
                    {selected.instructions}
                  </Text>

                  <View style={s.statRow}>
                    <View style={s.statChip}>
                      <Text style={s.statLabel}>Set</Text>
                      <Animated.Text
                        style={[
                          s.statValue,
                          { transform: [{ scale: setNumScale }] },
                        ]}
                      >
                        {setNum}
                        <Text style={s.statDim}>/{selected.sets}</Text>
                      </Animated.Text>
                    </View>

                    <View style={s.centerDisplay}>
                      {selected.type === "duration" && (
                        <>
                          <Text style={s.bigNumber}>
                            {fmt(secsLeft ?? 0)}
                          </Text>
                          <Text style={s.bigLabel}>Hold</Text>
                        </>
                      )}
                    </View>

                    <View style={s.statChip}>
                      <Text style={s.statLabel}>Logged</Text>
                      <Text style={s.statValue}>
                        {doneForSelected}
                        <Text style={s.statDim}>/{selected.sets}</Text>
                      </Text>
                    </View>
                  </View>

                  {selected.type === "reps" && (
                    <View style={s.stepperGrid}>
                      <Stepper
                        label="WEIGHT"
                        value={currentWeight}
                        onChange={setCurrentWeight}
                        step={2.5}
                        unit="kg"
                      />
                      <Stepper
                        label="REPS"
                        value={currentReps}
                        onChange={setCurrentReps}
                        step={1}
                      />
                    </View>
                  )}

                  {selected.type === "reps" ? (
                    <Animated.View
                      style={{ transform: [{ scale: btnScale }] }}
                    >
                      <TouchableOpacity
                        style={s.cta}
                        onPress={onCompletePress}
                        activeOpacity={0.92}
                        accessibilityRole="button"
                        accessibilityLabel="Mark set complete"
                      >
                        <Check
                          size={16}
                          color={T.accentOnDarkText}
                          strokeWidth={3}
                        />
                        <Text style={s.ctaText}>
                          {setNum >= selected.sets
                            ? playMode === "auto"
                              ? "Done — next exercise"
                              : "Done — back to list"
                            : "Done — next set"}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  ) : (
                    <Animated.View
                      style={{ transform: [{ scale: btnScale }] }}
                    >
                      <TouchableOpacity
                        style={s.ctaOutline}
                        onPress={onHoldTogglePress}
                        activeOpacity={0.88}
                        accessibilityRole="button"
                      >
                        <Text style={s.ctaOutlineText}>
                          {paused ? "Resume" : "Pause hold"}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )}

                  <TouchableOpacity
                    style={s.secondaryLink}
                    onPress={returnToList}
                    hitSlop={8}
                  >
                    <Text style={s.secondaryLinkText}>
                      Back to exercise list
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
          </ScrollView>
        </View>
      </Animated.View>

      <Animated.View
        pointerEvents={phase === "done" ? "auto" : "none"}
        style={[s.doneOverlay, { opacity: doneOpacity }]}
      >
        <Animated.View
          style={[s.doneBadge, { transform: [{ scale: doneScale }] }]}
        >
          <Check size={30} color={T.accentOnDarkText} strokeWidth={3} />
        </Animated.View>
        <Text style={s.doneTitle}>Workout complete</Text>
        <Text style={s.doneSub}>
          {fmt(elapsed)} elapsed · {doneSets}/{totalSets} sets logged
        </Text>
      </Animated.View>

      <Modal
        visible={libraryOpen}
        animationType="slide"
        onRequestClose={() => setLibraryOpen(false)}
        statusBarTranslucent
      >
        <SafeAreaProvider>
          <LibraryModalBody
            onClose={() => setLibraryOpen(false)}
            sessionExerciseNames={sessionExerciseNames}
            onAdd={(ex) => {
              void handleAddFromLibrary(ex);
            }}
            addingName={addingName}
            addError={addError}
          />
        </SafeAreaProvider>
      </Modal>

      {/* Same Modal + dimmed-backdrop pattern as WeightLogSheet; panel uses
          ActiveWorkout immersive dark tokens (T.darkGlass / darkGlassBorder). */}
      <Modal
        visible={cancelConfirmOpen}
        transparent
        animationType="fade"
        onRequestClose={dismissCancelConfirm}
        statusBarTranslucent
      >
        <View style={s.cancelModalRoot}>
          <Pressable
            style={s.cancelBackdrop}
            onPress={dismissCancelConfirm}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
          />
          <View style={s.cancelCard} accessibilityViewIsModal>
            <Text style={s.cancelTitle}>Cancel this workout?</Text>
            <Text style={s.cancelBody}>Your progress won't be saved.</Text>
            <View style={s.cancelActions}>
              <TouchableOpacity
                style={s.cancelKeepBtn}
                onPress={dismissCancelConfirm}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel="Keep going"
              >
                <Text style={s.cancelKeepText}>Keep going</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.cancelDestroyBtn}
                onPress={confirmCancelWorkout}
                disabled={deleteSession.isPending}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel="Cancel workout"
              >
                {deleteSession.isPending ? (
                  <ActivityIndicator size="small" color="#FFB4B4" />
                ) : (
                  <Text style={s.cancelDestroyText}>Cancel workout</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.darkBg },
  bgImage: { ...StyleSheet.absoluteFillObject },

  topContent: { paddingHorizontal: 18, gap: 12 },
  topBar: { flexDirection: "row", alignItems: "center", gap: 10 },
  setupErrorBanner: {
    backgroundColor: "rgba(180,60,60,0.35)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,120,120,0.35)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  setupErrorText: {
    color: T.onDark,
    fontFamily: T.bodySemi,
    fontSize: 12.5,
  },
  actionDisabled: { opacity: 0.45 },
  cancelModalRoot: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  cancelBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,10,0.72)",
  },
  cancelCard: {
    backgroundColor: T.darkPanel,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.darkGlassBorder,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  cancelTitle: {
    color: T.onDark,
    fontFamily: T.displaySemi,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  cancelBody: {
    color: T.onDarkMuted,
    fontFamily: T.bodyMed,
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 10,
  },
  cancelActions: { gap: 10 },
  cancelKeepBtn: {
    height: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.darkGlass,
    borderWidth: 1,
    borderColor: T.darkGlassBorder,
  },
  cancelKeepText: {
    color: T.onDark,
    fontFamily: T.bodyBold,
    fontSize: 14.5,
  },
  cancelDestroyBtn: {
    height: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(180,60,60,0.28)",
    borderWidth: 1,
    borderColor: "rgba(255,120,120,0.4)",
  },
  cancelDestroyText: {
    color: "#FFB4B4",
    fontFamily: T.bodyBold,
    fontSize: 14.5,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: { flex: 1, alignItems: "center", gap: 4 },
  topTitle: {
    color: T.onDark,
    fontFamily: T.bodySemi,
    fontSize: 13,
    letterSpacing: 0.1,
  },
  elapsedPill: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  elapsedText: {
    color: T.accentOnDark,
    fontFamily: T.displaySemi,
    fontSize: 12.5,
    letterSpacing: -0.2,
    fontVariant: ["tabular-nums"],
  },

  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: T.accentOnDark,
    borderRadius: 2,
  },

  heroWrap: { paddingRight: 40, marginTop: 2 },
  heroTitle: {
    color: T.onDark,
    fontFamily: T.displayExtraBold,
    fontSize: 27,
    letterSpacing: -0.6,
    lineHeight: 32,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  heroSub: {
    color: "rgba(255,255,255,0.75)",
    fontFamily: T.bodyMed,
    fontSize: 13,
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  panelOuter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: "38%",
  },
  panel: {
    flex: 1,
    backgroundColor: T.darkPanel,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: T.darkPanelBorder,
    paddingHorizontal: 20,
    paddingTop: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.35,
    shadowRadius: 26,
    elevation: 20,
  },
  panelScroll: { flex: 1 },
  panelScrollContent: { paddingBottom: 12, gap: 12 },

  listHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listLabel: {
    color: T.onDarkMuted,
    fontFamily: T.bodySemi,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  addExBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(127,217,174,0.12)",
    borderWidth: 1,
    borderColor: "rgba(127,217,174,0.35)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addExBtnText: {
    color: T.accentOnDark,
    fontFamily: T.bodyBold,
    fontSize: 12,
  },
  exList: { gap: 8 },
  libraryModal: { flex: 1, backgroundColor: T.bg },
  libraryModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  libraryModalTitle: {
    fontFamily: T.displayBold,
    fontSize: 20,
    color: T.white,
    letterSpacing: -0.3,
  },
  libraryCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.glass,
    borderWidth: 0.5,
    borderColor: T.glassBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  addingHint: {
    fontFamily: T.bodyMed,
    fontSize: 12,
    color: T.faint,
    textAlign: "center",
    marginTop: 12,
  },
  addErrorText: {
    fontFamily: T.bodyMed,
    fontSize: 12,
    color: T.badge,
    textAlign: "center",
    marginTop: 8,
  },
  exListRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: T.darkGlass,
    borderWidth: 1,
    borderColor: T.darkGlassBorder,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  exListRowDone: { opacity: 0.72 },
  exStatusDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  exStatusDotDone: {
    borderColor: T.accentOnDark,
    backgroundColor: T.accentOnDark,
  },
  exListName: {
    color: T.onDark,
    fontFamily: T.bodySemi,
    fontSize: 14,
  },
  exListNameDone: { color: T.onDarkMuted },
  exListMeta: {
    color: T.onDarkMuted,
    fontFamily: T.bodyMed,
    fontSize: 11.5,
    marginTop: 2,
  },

  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: T.accentOnDark,
    borderRadius: 999,
    paddingVertical: 15,
    marginTop: 4,
  },
  startBtnText: {
    color: T.accentOnDarkText,
    fontFamily: T.bodyBold,
    fontSize: 14.5,
  },

  activeBlock: { gap: 14, marginTop: 4 },
  restBlock: { alignItems: "center", gap: 10, marginTop: 4 },
  restHint: {
    color: T.onDarkMuted,
    fontFamily: T.bodyMed,
    fontSize: 12.5,
  },
  autoBadge: {
    alignSelf: "flex-start",
    color: T.accentOnDark,
    fontFamily: T.bodyBold,
    fontSize: 10,
    letterSpacing: 1.6,
  },

  cueLabel: {
    color: T.onDarkMuted,
    fontFamily: T.bodySemi,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  exInstr: {
    color: T.onDarkMuted,
    fontFamily: T.body,
    fontSize: 12.5,
    lineHeight: 18,
  },

  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statChip: { alignItems: "center", minWidth: 68 },
  statLabel: {
    color: T.onDarkMuted,
    fontFamily: T.bodySemi,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  statValue: {
    color: T.onDark,
    fontFamily: T.displaySemi,
    fontSize: 19,
    letterSpacing: -0.3,
    marginTop: 3,
    fontVariant: ["tabular-nums"],
  },
  statDim: { color: T.onDarkMuted, fontFamily: T.bodySemi, fontSize: 13 },

  centerDisplay: { alignItems: "center", minWidth: 90 },
  bigNumber: {
    color: T.onDark,
    fontFamily: T.displayExtraBold,
    fontSize: 42,
    letterSpacing: -2,
    lineHeight: 46,
    fontVariant: ["tabular-nums"],
  },
  bigLabel: {
    color: T.onDarkMuted,
    fontFamily: T.bodySemi,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginTop: -2,
  },

  stepperGrid: { flexDirection: "row", gap: 12 },
  stepperWrap: { flex: 1 },
  stepperLabel: {
    color: T.onDarkMuted,
    fontFamily: T.bodySemi,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.darkGlass,
    borderWidth: 1,
    borderColor: T.darkGlassBorder,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValueWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 3,
  },
  stepperInput: {
    color: T.onDark,
    fontFamily: T.displaySemi,
    fontSize: 18,
    textAlign: "center",
    minWidth: 32,
    padding: 0,
  },
  stepperUnit: {
    color: T.onDarkMuted,
    fontFamily: T.bodyMed,
    fontSize: 11,
  },

  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: T.accentOnDark,
    borderRadius: 999,
    paddingVertical: 15,
  },
  ctaText: {
    color: T.accentOnDarkText,
    fontFamily: T.bodyBold,
    fontSize: 14.5,
    letterSpacing: 0.1,
  },
  ctaOutline: {
    borderWidth: 1.5,
    borderColor: T.darkGlassBorder,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaOutlineText: {
    color: T.onDark,
    fontFamily: T.bodyBold,
    fontSize: 14,
    letterSpacing: 0.1,
  },
  secondaryLink: { alignItems: "center", paddingVertical: 8 },
  secondaryLinkText: {
    color: T.onDarkMuted,
    fontFamily: T.bodySemi,
    fontSize: 13,
  },

  restEyebrow: {
    color: T.accentOnDark,
    fontFamily: T.bodyBold,
    fontSize: 10,
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  ringTime: {
    color: T.onDark,
    fontFamily: T.displayBold,
    fontSize: 28,
    letterSpacing: -1,
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    alignSelf: "center",
    backgroundColor: T.darkGlass,
    borderWidth: 1,
    borderColor: T.darkGlassBorder,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  skipText: { color: T.onDark, fontFamily: T.bodySemi, fontSize: 12.5 },

  finishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: T.darkGlassBorder,
    borderRadius: 999,
    paddingVertical: 15,
  },
  finishBtnText: {
    color: T.onDark,
    fontFamily: T.bodyBold,
    fontSize: 14.5,
  },

  doneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9,9,12,0.94)",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    zIndex: 50,
  },
  doneBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: T.accentOnDark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  doneTitle: {
    color: T.onDark,
    fontFamily: T.displayBold,
    fontSize: 22,
    letterSpacing: -0.4,
  },
  doneSub: { color: T.onDarkMuted, fontFamily: T.bodyMed, fontSize: 13 },
});
