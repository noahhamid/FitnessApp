import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  addExerciseToSession,
  completeWorkoutSession,
  createWorkoutSession,
  deleteWorkoutSession,
  EXERCISES,
  WORKOUT_TEMPLATES,
  fetchWorkoutHistory,
  type WorkoutHistoryRow,
} from "@/src/features/workout/services/workout.service";
import { api } from "@/src/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import ExerciseCard, {
  createInitialExerciseSets,
  type ExerciseSetData,
} from "@/src/features/workout/components/ExerciseCard";
import LibrarySheet from "@/src/features/workout/components/LibrarySheet";
import TimerModal from "@/src/features/workout/components/TimerModal";
import WorkoutHeader from "@/src/features/workout/components/WorkoutHeader";

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg0: "#0A0A0C",
  bg1: "#111114",
  bg2: "#18181D",
  bg3: "#222228",
  lime: "#C8F135",
  red: "#FF3D3D",
  orange: "#F97316",
  blue: "#3B82F6",
  purple: "#A855F7",
  text: "#F2F2F5",
  sub: "#7A7A8C",
  muted: "#4A4A58",
  border: "#FFFFFF0F",
  borderMid: "#FFFFFF18",
};

// ── Types ─────────────────────────────────────────────────────────────────────
type Exercise = {
  id: string;
  name: string;
  muscle: string;
  tag: string;
  uid: string;
  sessionExerciseId?: string;
};

function mapSetsForComplete(
  sets: ExerciseSetData[],
): Array<{ reps?: number; weight?: number; completed?: boolean }> {
  const rows = sets.length > 0 ? sets : createInitialExerciseSets();
  return rows.map((s) => ({
    reps: Math.max(
      0,
      Number.parseInt(String(s.reps || "").replace(/\D/g, "") || "0", 10) || 0,
    ),
    weight: Math.max(
      0,
      Number(String(s.weight || "").replace(",", ".")) || 0,
    ),
    completed: s.done,
  }));
}

type Template = {
  id: string;
  name: string;
  tag: string;
  icon: string;
};

// ── Template → default exercises map ─────────────────────────────────────────
// When a user taps a template, these exercises are pre-loaded so they can
// start immediately without confusion.
const TEMPLATE_EXERCISES: Record<string, string[]> = {
  t1: ["e1", "e2", "e3", "e9", "e13"], // Push: Bench, Incline DB, Cable Fly, OHP, Tricep
  t2: ["e5", "e7", "e8", "e6", "e12"], // Pull: Deadlift, BB Row, Lat PD, Pull-Up, Curl
  t3: ["e15", "e16", "e17", "e18"], // Legs: Squat, RDL, Leg Press, Lunges
  t4: ["e1", "e5", "e15", "e9", "e19"], // Full body
};

const TEMPLATE_ACCENTS = [T.lime, T.orange, T.blue, T.purple];

// ── Per-template muscle groups + estimated duration ───────────────────────────
const TEMPLATE_META: Record<string, { muscles: string; duration: number }> = {
  t1: { muscles: "Chest · Shoulders · Triceps", duration: 55 },
  t2: { muscles: "Back · Biceps", duration: 60 },
  t3: { muscles: "Quads · Hamstrings · Glutes", duration: 70 },
  t4: { muscles: "Compound lifts", duration: 65 },
};

// ── Shared layout primitives ──────────────────────────────────────────────────
function SectionGap() {
  return <View style={{ height: 24 }} />;
}

function SectionLabel({
  label,
  icon,
  right,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  right?: React.ReactNode;
}) {
  return (
    <View style={s.sectionHdr}>
      <View style={s.sectionHdrLeft}>
        {icon ? <Ionicons name={icon} size={13} color={T.lime} /> : null}
        <Text style={s.sectionHdrTitle}>{label}</Text>
      </View>
      {right ?? null}
    </View>
  );
}

// ── Streak card ───────────────────────────────────────────────────────────────
function StreakCard({
  streakDays,
  thisWeek,
  weekGoal,
}: {
  streakDays: number;
  thisWeek: number;
  weekGoal: number;
}) {
  return (
    <View style={s.streakCard}>
      {/* Left: current streak */}
      <View style={s.streakLeft}>
        <View style={s.streakFlameWrap}>
          <Ionicons name="flame" size={18} color={T.lime} />
        </View>
        <View style={s.streakLeftText}>
          <Text style={s.streakLabel}>CURRENT STREAK</Text>
          <View style={s.streakValueRow}>
            <Text style={s.streakValue}>{streakDays}</Text>
            <Text style={s.streakUnit}> days</Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={s.streakDivider} />

      {/* Right: this week */}
      <View style={s.streakRight}>
        <Text style={s.streakLabel}>THIS WEEK</Text>
        <View style={s.streakValueRow}>
          <Text style={s.streakValue}>{thisWeek}</Text>
          <Text style={s.streakUnit}>/{weekGoal}</Text>
        </View>
      </View>
    </View>
  );
}

// ── Template card ─────────────────────────────────────────────────────────────
function TemplateCard({
  tpl,
  index,
  onPress,
  disabled,
}: {
  tpl: Template;
  index: number;
  onPress: () => void;
  disabled?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const textShift = useRef(new Animated.Value(0)).current;
  const accent = TEMPLATE_ACCENTS[index % TEMPLATE_ACCENTS.length];
  const presetIds = TEMPLATE_EXERCISES[tpl.id] ?? [];
  const meta = TEMPLATE_META[tpl.id];

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
    // Tactile text-left shift on the START pill
    Animated.spring(textShift, {
      toValue: -5,
      useNativeDriver: true,
      tension: 300,
      friction: 14,
    }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    Animated.spring(textShift, { toValue: 0, friction: 4, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        disabled={disabled}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={s.templateCard}
      >
        {/* Left accent stripe */}
        <View style={[s.templateStripe, { backgroundColor: accent }]} />

        {/* Icon */}
        <View style={[s.templateIconWrap, { backgroundColor: accent + "20" }]}>
          <Ionicons name="barbell-outline" size={16} color={accent} />
        </View>

        {/* Content */}
        <View style={s.templateContent}>
          <Text style={s.templateName}>{tpl.name}</Text>
          {meta && <Text style={s.templateMuscles}>{meta.muscles}</Text>}
          <Text style={[s.templateExCount, { color: accent }]}>
            {presetIds.length} exercises · {meta?.duration ?? 45} min
          </Text>
        </View>

        {/* Outline START pill — text shifts left on press for tactile feedback */}
        <View style={[s.startPill, { borderColor: accent }]}>
          <Animated.Text
            style={[
              s.startPillText,
              { color: accent, transform: [{ translateX: textShift }] },
            ]}
          >
            START ›
          </Animated.Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Active workout: step indicator ────────────────────────────────────────────
function WorkoutSteps({
  exerciseCount,
  doneCount,
}: {
  exerciseCount: number;
  doneCount: number;
}) {
  if (exerciseCount === 0) return null;
  return (
    <View style={s.stepsRow}>
      {Array.from({ length: exerciseCount }).map((_, i) => (
        <View
          key={i}
          style={[
            s.stepDot,
            i < doneCount
              ? s.stepDotDone
              : i === doneCount
                ? s.stepDotActive
                : s.stepDotIdle,
          ]}
        />
      ))}
    </View>
  );
}

// ── Empty exercise state ───────────────────────────────────────────────────────
function EmptyExercises({ onAdd }: { onAdd: () => void }) {
  return (
    <TouchableOpacity onPress={onAdd} style={s.emptyCard} activeOpacity={0.8}>
      <View style={s.emptyIconWrap}>
        <Ionicons name="add" size={26} color={T.lime} />
      </View>
      <Text style={s.emptyTitle}>ADD YOUR FIRST EXERCISE</Text>
      <Text style={s.emptyHint}>Tap to browse the exercise library</Text>
    </TouchableOpacity>
  );
}

// ── History row ───────────────────────────────────────────────────────────────
function HistoryRow({
  session,
  isLast,
}: {
  session: WorkoutHistoryRow;
  isLast: boolean;
}) {
  return (
    <View style={[s.historyRow, isLast && { borderBottomWidth: 0 }]}>
      <View style={s.historyIcon}>
        <Ionicons name="barbell-outline" size={14} color={T.lime} />
      </View>
      <View style={s.historyLeft}>
        <Text style={s.historyName} numberOfLines={1}>
          {session.name}
        </Text>
        <Text style={s.historyMeta}>
          {session.date} · {session.duration}
        </Text>
      </View>
      <View style={s.historyRight}>
        <View style={s.historyVolPill}>
          <Text style={s.historyVol}>{session.volume}</Text>
        </View>
        <Text style={s.historySets}>{session.sets} sets</Text>
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
const WORKOUT_HISTORY_LIST_KEY = ["workouts", "history", "list"] as const;

export default function WorkoutScreen() {
  const queryClient = useQueryClient();
  const [activeWorkout, setActiveWorkout] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionStarting, setSessionStarting] = useState(false);
  const [finishingWorkout, setFinishingWorkout] = useState(false);

  const [workoutName, setWorkoutName] = useState("My Workout");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseSetsByUid, setExerciseSetsByUid] = useState<
    Record<string, ExerciseSetData[]>
  >({});
  const [showLibrary, setShowLibrary] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  /** Synchronous guard so Finish / start cannot double-fire before state updates. */
  const workoutSaveBusyRef = useRef(false);

  const workoutNameRef = useRef(workoutName);
  const exercisesRef = useRef(exercises);
  const exerciseSetsRef = useRef(exerciseSetsByUid);
  const activeSessionIdRef = useRef(activeSessionId);

  workoutNameRef.current = workoutName;
  exercisesRef.current = exercises;
  exerciseSetsRef.current = exerciseSetsByUid;
  activeSessionIdRef.current = activeSessionId;

  const { data: historyRows = [], isPending: historyLoading } = useQuery({
    queryKey: WORKOUT_HISTORY_LIST_KEY,
    queryFn: () => fetchWorkoutHistory(20),
  });

  // Approximate streak & weekly count from available history
  const streakDays = historyRows.length;
  const thisWeek = Math.min(
    historyRows.filter((h) =>
      /^(Today|Yesterday|Mon|Tue|Wed|Thu|Fri|Sat|Sun)/.test(h.date),
    ).length,
    5,
  );
  const WEEK_GOAL = 5;

  const resetActiveWorkoutState = useCallback(() => {
    setActiveWorkout(false);
    setExercises([]);
    setExerciseSetsByUid({});
    setStartTime(null);
    setActiveSessionId(null);
  }, []);

  const handleSetsChange = useCallback(
    (uid: string, sets: ExerciseSetData[]) => {
      setExerciseSetsByUid((prev) => ({ ...prev, [uid]: sets }));
    },
    [],
  );

  const finalizeWorkoutOnServer = useCallback(async () => {
    const sid = activeSessionIdRef.current;
    const exList = exercisesRef.current;
    const setsByUid = exerciseSetsRef.current;

    try {
      if (!sid) {
        resetActiveWorkoutState();
        return;
      }

      if (exList.length === 0) {
        try {
          await deleteWorkoutSession(sid);
        } catch (e) {
          Alert.alert(
            "Couldn't cancel workout",
            e instanceof Error ? e.message : "Unknown error",
          );
          return;
        }
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["workouts", "history", "list"] }),
          queryClient.invalidateQueries({ queryKey: ["dashboard", "workouts", "completed"] }),
          queryClient.invalidateQueries({ queryKey: ["dashboard", "workouts", "open"] }),
          queryClient.invalidateQueries({ queryKey: ["progress", "workouts"] }),
        ]);
        resetActiveWorkoutState();
        return;
      }

      const exercisePayload = exList.map((ex) => ({
        exerciseName: ex.name,
        sets: mapSetsForComplete(setsByUid[ex.uid] ?? []),
      }));

      await completeWorkoutSession(
        sid,
        workoutNameRef.current.trim() || "My Workout",
        exercisePayload,
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["workouts", "history", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "workouts", "completed"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "workouts", "open"] }),
        queryClient.invalidateQueries({ queryKey: ["progress", "workouts"] }),
      ]);
      resetActiveWorkoutState();
    } catch (e) {
      Alert.alert(
        "Couldn't save workout",
        e instanceof Error ? e.message : "Unknown error",
      );
    }
  }, [queryClient, resetActiveWorkoutState]);

  const exerciseCount = exercises.length;

  // ── Live session metrics ────────────────────────────────────────────────────
  const completedSets = useMemo(
    () =>
      exercises.reduce(
        (sum, ex) =>
          sum +
          (exerciseSetsByUid[ex.uid] ?? []).filter((s) => s.done).length,
        0,
      ),
    [exercises, exerciseSetsByUid],
  );

  const totalSets = useMemo(
    () =>
      exercises.reduce(
        (sum, ex) => sum + (exerciseSetsByUid[ex.uid] ?? []).length,
        0,
      ),
    [exercises, exerciseSetsByUid],
  );

  const totalVolumeKg = useMemo(
    () =>
      exercises.reduce((sum, ex) => {
        const sets = exerciseSetsByUid[ex.uid] ?? [];
        return (
          sum +
          sets
            .filter((s) => s.done)
            .reduce(
              (a, s) =>
                a +
                parseFloat(s.weight || "0") *
                  parseInt(s.reps || "0", 10),
              0,
            )
        );
      }, 0),
    [exercises, exerciseSetsByUid],
  );

  const syncExerciseToSession = useCallback(
    async (sessionId: string, ex: Exercise) => {
      const row = await addExerciseToSession(sessionId, ex.name);
      setExercises((prev) =>
        prev.map((item) =>
          item.uid === ex.uid
            ? { ...item, sessionExerciseId: row.id }
            : item,
        ),
      );
    },
    [],
  );

  const startFromTemplate = async (tpl: Template) => {
    if (sessionStarting || workoutSaveBusyRef.current || finishingWorkout) return;
    setSessionStarting(true);
    try {
      let sessionId: string;
      try {
        const session = await createWorkoutSession(tpl.name);
        sessionId = session.id;
        setActiveSessionId(sessionId);
      } catch (e) {
        Alert.alert(
          "Could not start workout",
          e instanceof Error ? e.message : "Try again.",
        );
        setActiveSessionId(null);
        return;
      }

      const ids = TEMPLATE_EXERCISES[tpl.id] ?? [];
      const preloaded: Exercise[] = ids
        .map((eid, i) => {
          const ex = (EXERCISES as typeof EXERCISES).find((e) => e.id === eid);
          if (!ex) return null;
          return {
            ...ex,
            uid: `${ex.id}_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 8)}`,
          };
        })
        .filter(Boolean) as Exercise[];

      const initialSets: Record<string, ExerciseSetData[]> = {};
      for (const ex of preloaded) {
        initialSets[ex.uid] = createInitialExerciseSets();
      }

      setWorkoutName(tpl.name);
      setExercises(preloaded);
      setExerciseSetsByUid(initialSets);
      setStartTime(Date.now());
      setActiveWorkout(true);

      for (const ex of preloaded) {
        try {
          await syncExerciseToSession(sessionId, ex);
        } catch (e) {
          Alert.alert(
            "Exercise not synced",
            e instanceof Error ? e.message : "Check your connection.",
          );
        }
      }
    } finally {
      setSessionStarting(false);
    }
  };

  const startBlank = async () => {
    if (sessionStarting || workoutSaveBusyRef.current || finishingWorkout) return;
    setSessionStarting(true);
    try {
      try {
        const session = await createWorkoutSession("My Workout");
        setActiveSessionId(session.id);
      } catch (e) {
        Alert.alert(
          "Could not start workout",
          e instanceof Error ? e.message : "Try again.",
        );
        setActiveSessionId(null);
        return;
      }

      setWorkoutName("My Workout");
      setExercises([]);
      setExerciseSetsByUid({});
      setStartTime(Date.now());
      setActiveWorkout(true);
    } finally {
      setSessionStarting(false);
    }
  };

  const finishWorkout = useCallback(() => {
    Alert.alert(
      "Finish Workout?",
      exerciseCount === 0
        ? "No exercises logged. Are you sure?"
        : `${exerciseCount} exercise${exerciseCount !== 1 ? "s" : ""} will be saved to your history.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "FINISH",
          style: "destructive",
          onPress: () => {
            void (async () => {
              if (workoutSaveBusyRef.current) return;
              workoutSaveBusyRef.current = true;
              setFinishingWorkout(true);
              try {
                await finalizeWorkoutOnServer();
              } finally {
                workoutSaveBusyRef.current = false;
                setFinishingWorkout(false);
              }
            })();
          },
        },
      ],
      { cancelable: true },
    );
  }, [exerciseCount, finalizeWorkoutOnServer]);

  const addExercise = useCallback(
    async (ex: Omit<Exercise, "uid" | "sessionExerciseId">) => {
      const uid = `${ex.id}_${Date.now()}_${Math.random()}`;
      const next: Exercise = { ...ex, uid };
      setExercises((prev) => [...prev, next]);
      setExerciseSetsByUid((prev) => ({
        ...prev,
        [uid]: createInitialExerciseSets(),
      }));

      const sid = activeSessionIdRef.current;
      if (!sid) return;

      try {
        await syncExerciseToSession(sid, next);
      } catch (e) {
        Alert.alert(
          "Exercise not synced",
          e instanceof Error ? e.message : "Check your connection.",
        );
      }
    },
    [syncExerciseToSession],
  );

  const removeExercise = useCallback(
    async (uid: string) => {
      const sid = activeSessionIdRef.current;
      const target = exercisesRef.current.find((e) => e.uid === uid);
      if (sid && target?.sessionExerciseId) {
        try {
          await api.delete(
            `/api/workouts/${sid}/exercises/${target.sessionExerciseId}`,
          );
        } catch {
          /* best-effort: still drop locally */
        }
      }
      setExerciseSetsByUid((prev) => {
        const next = { ...prev };
        delete next[uid];
        return next;
      });
      setExercises((prev) => prev.filter((e) => e.uid !== uid));
    },
    [],
  );

  return (
    <SafeAreaView edges={["top"]} style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg0} />

      {activeWorkout && startTime != null && (
        <WorkoutHeader
          startTime={startTime}
          name={workoutName}
          onNameChange={setWorkoutName}
          onFinish={finishWorkout}
          finishDisabled={finishingWorkout}
          onBack={finishWorkout}
          totalVolume={totalVolumeKg}
          completedSets={completedSets}
          totalSets={totalSets}
          exerciseCount={exerciseCount}
        />
      )}

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[
          s.scrollContent,
          { paddingTop: activeWorkout ? 8 : 0 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── IDLE HEADER ── */}
        {!activeWorkout && (
          <>
            <View style={s.header}>
              <View style={s.headerLeft}>
                <View style={s.datePill}>
                  <Ionicons name="barbell-outline" size={10} color={T.muted} />
                  <Text style={s.dateText}>TRAINING</Text>
                </View>
                <Text style={s.greeting}>Ready to build,</Text>
                <Text style={s.heroName}>TRAIN.</Text>
              </View>
              <TouchableOpacity style={s.menuBtn} activeOpacity={0.7}>
                <Ionicons name="ellipsis-horizontal" size={20} color={T.sub} />
              </TouchableOpacity>
            </View>

            {/* ── STREAK CARD ── */}
            <View style={s.px}>
              <StreakCard
                streakDays={streakDays}
                thisWeek={thisWeek}
                weekGoal={WEEK_GOAL}
              />
            </View>
            <SectionGap />
          </>
        )}

        {/* ── ACTIVE: blue callout tip banner ── */}
        {activeWorkout && exerciseCount > 0 && (
          <View style={s.px}>
            <View style={s.hintCard}>
              <Ionicons
                name="information-circle"
                size={15}
                color={T.blue}
              />
              <Text style={s.hintText}>
                Enter weight &amp; reps, then tap the checkmark to log each set.
              </Text>
            </View>
          </View>
        )}

        {/* ── ACTIVE: exercise cards ── */}
        {activeWorkout && (
          <View style={s.px}>
            {exercises.length === 0 ? (
              <EmptyExercises onAdd={() => setShowLibrary(true)} />
            ) : (
              exercises.map((ex) => (
                <ExerciseCard
                  key={ex.uid}
                  exercise={ex}
                  sets={exerciseSetsByUid[ex.uid] ?? createInitialExerciseSets()}
                  onSetsChange={(sets) => handleSetsChange(ex.uid, sets)}
                  onRemove={() => void removeExercise(ex.uid)}
                  onTimerOpen={() => setShowTimer(true)}
                />
              ))
            )}
          </View>
        )}

        {/* ── ACTIVE: action bar — ADD EXERCISE + appended timer badge ── */}
        {activeWorkout && (
          <View style={s.actionBar}>
            <View style={s.addExRow}>
              <TouchableOpacity
                disabled={sessionStarting || finishingWorkout}
                onPress={() => setShowLibrary(true)}
                style={s.addExBtn}
                activeOpacity={0.82}
              >
                <Ionicons name="add" size={18} color={T.lime} />
                <Text style={s.addExBtnText}>+ ADD EXERCISE</Text>
              </TouchableOpacity>
              {/* Timer badge appended to right edge */}
              <TouchableOpacity
                disabled={finishingWorkout}
                onPress={() => setShowTimer(true)}
                style={s.timerBadge}
                activeOpacity={0.8}
              >
                <Ionicons name="timer-outline" size={17} color={T.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── ACTIVE: finish & save — full-width lime banner ── */}
        {activeWorkout && exerciseCount > 0 && (
          <View style={s.px}>
            <TouchableOpacity
              disabled={finishingWorkout}
              onPress={finishWorkout}
              style={s.finishBanner}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={20} color={T.bg0} />
              <Text style={s.finishBannerText}>
                Done? Finish &amp; save session
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── IDLE: quick start ── */}
        {!activeWorkout && (
          <>
            <SectionLabel label="QUICK START" icon="flash" />
            <View style={s.px}>
              <View style={s.templatesContainer}>
                {(WORKOUT_TEMPLATES as Template[]).map((tpl, i) => (
                  <TemplateCard
                    key={tpl.id}
                    tpl={tpl}
                    index={i}
                    disabled={sessionStarting || finishingWorkout}
                    onPress={() => void startFromTemplate(tpl)}
                  />
                ))}
                <TouchableOpacity
                  disabled={sessionStarting || finishingWorkout}
                  onPress={() => void startBlank()}
                  style={s.blankBtn}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={14}
                    color={T.muted}
                  />
                  <Text style={s.blankBtnText}>Start blank workout</Text>
                </TouchableOpacity>
              </View>
            </View>
            <SectionGap />
          </>
        )}

        {/* ── IDLE: recent sessions ── */}
        {!activeWorkout && (
          <>
            <SectionLabel
              label="RECENT SESSIONS"
              icon="time-outline"
              right={<Text style={s.sectionHdrLink}>View all ›</Text>}
            />
            <View style={s.px}>
              {historyLoading ? (
                <View style={s.loadingWrap}>
                  <ActivityIndicator color={T.lime} />
                </View>
              ) : historyRows.length === 0 ? (
                <View style={s.emptyHistory}>
                  <Ionicons
                    name="barbell-outline"
                    size={28}
                    color={T.muted}
                    style={{ opacity: 0.4 }}
                  />
                  <Text style={s.emptyHistoryTitle}>No sessions yet</Text>
                  <Text style={s.emptyHistoryText}>
                    Start a workout above to begin tracking
                  </Text>
                </View>
              ) : (
                <View style={s.historyCard}>
                  {historyRows.slice(0, 8).map((h, i, arr) => (
                    <HistoryRow
                      key={h.id}
                      session={h}
                      isLast={i === arr.length - 1}
                    />
                  ))}
                </View>
              )}
            </View>
            <SectionGap />
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <LibrarySheet
        visible={showLibrary}
        onClose={() => setShowLibrary(false)}
        onAdd={addExercise}
      />
      <TimerModal visible={showTimer} onClose={() => setShowTimer(false)} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: T.bg0,
    maxWidth: 430,
    alignSelf: "center",
    width: "100%",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 110 },
  px: { paddingHorizontal: 16 },

  // ── Idle header ───────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerLeft: { gap: 2, flex: 1 },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  dateText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    color: T.muted,
    letterSpacing: 1.5,
  },
  greeting: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: T.sub,
  },
  heroName: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 38,
    color: T.text,
    lineHeight: 40,
    letterSpacing: 0.5,
  },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: T.bg2,
    borderWidth: 1,
    borderColor: T.borderMid,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  // ── Streak card ───────────────────────────────────────────────────────────
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1A0D",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.lime + "18",
    padding: 16,
    gap: 0,
  },
  streakLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  streakFlameWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: T.lime + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  streakLeftText: { gap: 2 },
  streakLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    color: T.muted,
    letterSpacing: 1.0,
  },
  streakValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  streakValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 28,
    color: T.text,
    lineHeight: 30,
  },
  streakUnit: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: T.sub,
    marginLeft: 3,
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: T.border,
    marginHorizontal: 16,
  },
  streakRight: {
    alignItems: "flex-end",
    gap: 2,
  },

  // ── Section header ────────────────────────────────────────────────────────
  sectionHdr: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHdrLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  sectionHdrTitle: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: T.text,
    letterSpacing: 1.0,
  },
  sectionHdrLink: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: T.lime,
  },

  // ── Templates container ───────────────────────────────────────────────────
  templatesContainer: {
    gap: 10,
  },

  // ── Template card ─────────────────────────────────────────────────────────
  templateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg1,
    borderRadius: 16,
    overflow: "hidden",
    paddingRight: 14,
    gap: 12,
  },
  templateStripe: {
    width: 4,
    alignSelf: "stretch",
  },
  templateIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  templateContent: { flex: 1, paddingVertical: 16, gap: 3 },
  templateName: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 16,
    color: T.text,
    letterSpacing: 0.3,
  },
  templateMuscles: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
  },
  templateMeta: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
  },
  templateExCount: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    marginTop: 1,
  },

  // Outline START pill — transparent fill, accent-colored border + text
  startPill: {
    borderRadius: 999,
    borderWidth: 1.5,
    backgroundColor: "transparent",
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  startPillText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    letterSpacing: 0.5,
  },

  // ── Blank workout button ──────────────────────────────────────────────────
  blankBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: T.borderMid,
    borderRadius: 16,
    paddingVertical: 13,
  },
  blankBtnText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: T.sub,
  },

  // ── Hint card (blue callout tip banner) ──────────────────────────────────
  hintCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: T.blue + "14",
    borderWidth: 1,
    borderColor: T.blue + "30",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    marginTop: 8,
  },
  hintText: {
    flex: 1,
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.blue + "CC",
    lineHeight: 17,
  },

  // ── Active: action bar — ADD EXERCISE + appended timer badge ──────────────
  actionBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  addExRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
  },
  addExBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: T.lime + "55",
    borderRadius: 14,
    paddingVertical: 13,
    backgroundColor: "transparent",
  },
  addExBtnText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: T.lime,
    letterSpacing: 0.8,
  },
  // Stopwatch badge: circular, anchored to right of add-ex button
  timerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: T.bg2,
    borderWidth: 1,
    borderColor: T.borderMid,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -6, // slight overlap for attached look
  },

  // ── Finish banner — massive full-width solid lime ─────────────────────────
  finishBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: T.lime,
    borderRadius: 16,
    paddingVertical: 15,
    marginTop: 4,
    marginBottom: 8,
    shadowColor: T.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  finishBannerText: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 18,
    color: T.bg0,
    letterSpacing: 0.3,
  },

  // ── Kept for step dots (used in WorkoutSteps helper) ──────────────────────
  stepsRow: { flexDirection: "row", gap: 4, flexWrap: "wrap" },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
  stepDotDone: { backgroundColor: T.lime },
  stepDotActive: { backgroundColor: T.lime + "60" },
  stepDotIdle: { backgroundColor: T.muted },

  // ── Empty exercise state ──────────────────────────────────────────────────
  emptyCard: {
    borderWidth: 1,
    borderColor: T.border,
    borderStyle: "dashed",
    borderRadius: 18,
    paddingVertical: 40,
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: T.lime + "18",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: T.text,
    letterSpacing: 1.5,
    opacity: 0.7,
  },
  emptyHint: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.sub,
  },

  // ── History ───────────────────────────────────────────────────────────────
  loadingWrap: {
    paddingVertical: 28,
    alignItems: "center",
  },
  historyCard: {
    backgroundColor: T.bg1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
    overflow: "hidden",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  historyIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: T.lime + "14",
    borderWidth: 1,
    borderColor: T.lime + "28",
    alignItems: "center",
    justifyContent: "center",
  },
  historyLeft: { flex: 1, gap: 3 },
  historyName: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 13,
    color: T.text,
    letterSpacing: -0.1,
  },
  historyMeta: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
  },
  historyRight: { alignItems: "flex-end", gap: 4 },
  historyVolPill: {
    backgroundColor: T.lime + "14",
    borderWidth: 1,
    borderColor: T.lime + "28",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  historyVol: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.lime,
    letterSpacing: 0.2,
  },
  historySets: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
  },
  emptyHistory: {
    paddingVertical: 36,
    alignItems: "center",
    gap: 8,
    backgroundColor: T.bg1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
  },
  emptyHistoryTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 15,
    color: T.text,
    letterSpacing: -0.1,
    opacity: 0.6,
  },
  emptyHistoryText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.muted,
  },
});
