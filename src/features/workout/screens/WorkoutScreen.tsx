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

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg0: "#121212",
  bg1: "#1E1E1E",
  bg2: "#282828",
  bg3: "#303030",
  border: "#FFFFFF0A",
  borderMid: "#FFFFFF14",
  gold: "#FFC700",
  goldDim: "#FFC70020",
  goldBorder: "#FFC70030",
  text: "#FFFFFF",
  sub: "#A0A0A0",
  muted: "#555555",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Exercise = {
  id: string;
  name: string;
  muscle: string;
  tag: string;
  uid: string;
  sessionExerciseId?: string;
};

type Template = {
  id: string;
  name: string;
  tag: string;
  icon: string;
};

function mapSetsForComplete(
  sets: ExerciseSetData[],
): Array<{ reps?: number; weight?: number; completed?: boolean }> {
  const rows = sets.length > 0 ? sets : createInitialExerciseSets();
  return rows.map((s) => ({
    reps: Math.max(
      0,
      parseInt(String(s.reps || "").replace(/\D/g, "") || "0", 10) || 0,
    ),
    weight: Math.max(0, Number(String(s.weight || "").replace(",", ".")) || 0),
    completed: s.done,
  }));
}

const TEMPLATE_EXERCISES: Record<string, string[]> = {
  t1: ["e1", "e2", "e3", "e9", "e13"],
  t2: ["e5", "e7", "e8", "e6", "e12"],
  t3: ["e15", "e16", "e17", "e18"],
  t4: ["e1", "e5", "e15", "e9", "e19"],
};

const TEMPLATE_META: Record<string, { muscles: string; duration: number }> = {
  t1: { muscles: "Chest · Shoulders · Triceps", duration: 55 },
  t2: { muscles: "Back · Biceps", duration: 60 },
  t3: { muscles: "Quads · Hamstrings · Glutes", duration: 70 },
  t4: { muscles: "Compound lifts", duration: 65 },
};

// ─── Primitives ───────────────────────────────────────────────────────────────

function SectionGap() {
  return <View style={{ height: 28 }} />;
}

function SectionLabel({
  label,
  right,
}: {
  label: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={s.sectionHdr}>
      <Text style={s.sectionHdrTitle}>{label}</Text>
      {right ?? null}
    </View>
  );
}

// ─── Streak Card ──────────────────────────────────────────────────────────────

function StreakCard({
  streakDays,
  thisWeek,
  weekGoal,
}: {
  streakDays: number;
  thisWeek: number;
  weekGoal: number;
}) {
  const pct = Math.min((thisWeek / weekGoal) * 100, 100);

  return (
    <View style={s.streakCard}>
      {/* Left */}
      <View style={s.streakLeft}>
        <View style={s.streakFlameWrap}>
          <Ionicons name="flame" size={18} color={T.gold} />
        </View>
        <View style={s.streakLeftText}>
          <Text style={s.streakLabel}>STREAK</Text>
          <View style={s.streakValueRow}>
            <Text style={s.streakValue}>{streakDays}</Text>
            <Text style={s.streakUnit}> days</Text>
          </View>
        </View>
      </View>

      <View style={s.streakDivider} />

      {/* Right: weekly progress */}
      <View style={s.streakRight}>
        <View style={s.streakWeekRow}>
          <Text style={s.streakLabel}>THIS WEEK</Text>
          <Text style={s.streakWeekCount}>
            <Text style={s.streakWeekVal}>{thisWeek}</Text>
            <Text style={s.streakWeekGoal}>/{weekGoal}</Text>
          </Text>
        </View>
        {/* Mini dot-track */}
        <View style={s.weekDots}>
          {Array.from({ length: weekGoal }).map((_, i) => (
            <View
              key={i}
              style={[s.weekDot, i < thisWeek && s.weekDotFilled]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

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
  const presetIds = TEMPLATE_EXERCISES[tpl.id] ?? [];
  const meta = TEMPLATE_META[tpl.id];

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

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
        {/* Left: index number */}
        <Text style={s.templateIndex}>
          {String(index + 1).padStart(2, "0")}
        </Text>

        {/* Content */}
        <View style={s.templateContent}>
          <Text style={s.templateName}>{tpl.name}</Text>
          {meta && (
            <Text style={s.templateMeta}>
              {meta.muscles} · {meta.duration} min
            </Text>
          )}
          <Text style={s.templateExCount}>{presetIds.length} exercises</Text>
        </View>

        {/* CTA */}
        <View style={s.startPill}>
          <Ionicons name="play" size={11} color={T.bg0} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Empty Exercises ──────────────────────────────────────────────────────────

function EmptyExercises({ onAdd }: { onAdd: () => void }) {
  return (
    <TouchableOpacity onPress={onAdd} style={s.emptyCard} activeOpacity={0.8}>
      <View style={s.emptyIconWrap}>
        <Ionicons name="add" size={26} color={T.gold} />
      </View>
      <Text style={s.emptyTitle}>ADD YOUR FIRST EXERCISE</Text>
      <Text style={s.emptyHint}>Tap to browse the exercise library</Text>
    </TouchableOpacity>
  );
}

// ─── History Row ──────────────────────────────────────────────────────────────

function HistoryRow({
  session,
  isLast,
}: {
  session: WorkoutHistoryRow;
  isLast: boolean;
}) {
  return (
    <View style={[s.historyRow, isLast && { borderBottomWidth: 0 }]}>
      {/* Icon */}
      <View style={s.historyIcon}>
        <Ionicons name="barbell-outline" size={14} color={T.gold} />
      </View>

      {/* Info */}
      <View style={s.historyLeft}>
        <Text style={s.historyName} numberOfLines={1}>
          {session.name}
        </Text>
        <Text style={s.historyMeta}>
          {session.date} · {session.duration}
        </Text>
      </View>

      {/* Volume */}
      <View style={s.historyRight}>
        <Text style={s.historyVol}>{session.volume}</Text>
        <Text style={s.historySets}>{session.sets} sets</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

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

  const invalidateWorkoutQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["workouts", "history", "list"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["dashboard", "workouts", "completed"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["dashboard", "workouts", "open"],
      }),
      queryClient.invalidateQueries({ queryKey: ["progress", "workouts"] }),
    ]);
  }, [queryClient]);

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
        await invalidateWorkoutQueries();
        resetActiveWorkoutState();
        return;
      }
      await completeWorkoutSession(
        sid,
        workoutNameRef.current.trim() || "My Workout",
        exList.map((ex) => ({
          exerciseName: ex.name,
          sets: mapSetsForComplete(setsByUid[ex.uid] ?? []),
        })),
      );
      await invalidateWorkoutQueries();
      resetActiveWorkoutState();
    } catch (e) {
      Alert.alert(
        "Couldn't save workout",
        e instanceof Error ? e.message : "Unknown error",
      );
    }
  }, [invalidateWorkoutQueries, resetActiveWorkoutState]);

  const exerciseCount = exercises.length;

  const completedSets = useMemo(
    () =>
      exercises.reduce(
        (sum, ex) =>
          sum + (exerciseSetsByUid[ex.uid] ?? []).filter((s) => s.done).length,
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
                a + parseFloat(s.weight || "0") * parseInt(s.reps || "0", 10),
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
          item.uid === ex.uid ? { ...item, sessionExerciseId: row.id } : item,
        ),
      );
    },
    [],
  );

  const startFromTemplate = async (tpl: Template) => {
    if (sessionStarting || workoutSaveBusyRef.current || finishingWorkout)
      return;
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
      for (const ex of preloaded)
        initialSets[ex.uid] = createInitialExerciseSets();
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
    if (sessionStarting || workoutSaveBusyRef.current || finishingWorkout)
      return;
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
        : `${exerciseCount} exercise${exerciseCount !== 1 ? "s" : ""} will be saved.`,
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

  const removeExercise = useCallback(async (uid: string) => {
    const sid = activeSessionIdRef.current;
    const target = exercisesRef.current.find((e) => e.uid === uid);
    if (sid && target?.sessionExerciseId) {
      try {
        await api.delete(
          `/api/workouts/${sid}/exercises/${target.sessionExerciseId}`,
        );
      } catch {
        /* best-effort */
      }
    }
    setExerciseSetsByUid((prev) => {
      const next = { ...prev };
      delete next[uid];
      return next;
    });
    setExercises((prev) => prev.filter((e) => e.uid !== uid));
  }, []);

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
              <View>
                <Text style={s.headerEyebrow}>TRAINING</Text>
                <Text style={s.heroName}>TRAIN.</Text>
              </View>
              <TouchableOpacity style={s.menuBtn} activeOpacity={0.7}>
                <Ionicons name="ellipsis-horizontal" size={20} color={T.sub} />
              </TouchableOpacity>
            </View>

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

        {/* ── ACTIVE: hint ── */}
        {activeWorkout && exerciseCount > 0 && (
          <View style={s.px}>
            <View style={s.hintCard}>
              <Ionicons
                name="information-circle-outline"
                size={14}
                color={T.sub}
              />
              <Text style={s.hintText}>
                Log weight &amp; reps, then tap ✓ to complete each set.
              </Text>
            </View>
          </View>
        )}

        {/* ── ACTIVE: exercises ── */}
        {activeWorkout && (
          <View style={s.px}>
            {exercises.length === 0 ? (
              <EmptyExercises onAdd={() => setShowLibrary(true)} />
            ) : (
              exercises.map((ex) => (
                <ExerciseCard
                  key={ex.uid}
                  exercise={ex}
                  sets={
                    exerciseSetsByUid[ex.uid] ?? createInitialExerciseSets()
                  }
                  onSetsChange={(sets) => handleSetsChange(ex.uid, sets)}
                  onRemove={() => void removeExercise(ex.uid)}
                  onTimerOpen={() => setShowTimer(true)}
                />
              ))
            )}
          </View>
        )}

        {/* ── ACTIVE: add exercise + timer ── */}
        {activeWorkout && (
          <View style={s.actionBar}>
            <TouchableOpacity
              disabled={sessionStarting || finishingWorkout}
              onPress={() => setShowLibrary(true)}
              style={s.addExBtn}
              activeOpacity={0.82}
            >
              <Ionicons name="add" size={18} color={T.gold} />
              <Text style={s.addExBtnText}>ADD EXERCISE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={finishingWorkout}
              onPress={() => setShowTimer(true)}
              style={s.timerBadge}
              activeOpacity={0.8}
            >
              <Ionicons name="timer-outline" size={18} color={T.sub} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── ACTIVE: finish CTA ── */}
        {activeWorkout && exerciseCount > 0 && (
          <View style={s.px}>
            <TouchableOpacity
              disabled={finishingWorkout}
              onPress={finishWorkout}
              style={s.finishBtn}
              activeOpacity={0.85}
            >
              {finishingWorkout ? (
                <ActivityIndicator color={T.bg0} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={T.bg0} />
                  <Text style={s.finishBtnText}>FINISH &amp; SAVE</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── IDLE: quick start ── */}
        {!activeWorkout && (
          <>
            <SectionLabel label="QUICK START" />
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
              </View>

              {/* Blank workout */}
              <TouchableOpacity
                disabled={sessionStarting || finishingWorkout}
                onPress={() => void startBlank()}
                style={s.blankBtn}
                activeOpacity={0.85}
              >
                {sessionStarting ? (
                  <ActivityIndicator color={T.gold} size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="add-circle-outline"
                      size={16}
                      color={T.sub}
                    />
                    <Text style={s.blankBtnText}>Start blank workout</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            <SectionGap />
          </>
        )}

        {/* ── IDLE: recent sessions ── */}
        {!activeWorkout && (
          <>
            <SectionLabel
              label="RECENT SESSIONS"
              right={<Text style={s.sectionLink}>See all ›</Text>}
            />
            <View style={s.px}>
              {historyLoading ? (
                <View style={s.loadingWrap}>
                  <ActivityIndicator color={T.gold} />
                </View>
              ) : historyRows.length === 0 ? (
                <View style={s.emptyHistory}>
                  <Ionicons name="barbell-outline" size={28} color={T.muted} />
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

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerEyebrow: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    color: T.muted,
    letterSpacing: 2,
    marginBottom: 4,
  },
  heroName: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 42,
    color: T.text,
    lineHeight: 42,
    letterSpacing: 0.5,
  },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: T.bg1,
    borderWidth: 1,
    borderColor: T.borderMid,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  // Streak card
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.goldBorder,
    padding: 16,
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
    backgroundColor: T.goldDim,
    alignItems: "center",
    justifyContent: "center",
  },
  streakLeftText: { gap: 2 },
  streakLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 9,
    color: T.muted,
    letterSpacing: 1.4,
  },
  streakValueRow: { flexDirection: "row", alignItems: "baseline" },
  streakValue: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 30,
    color: T.gold,
    lineHeight: 32,
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
    backgroundColor: T.borderMid,
    marginHorizontal: 16,
  },
  streakRight: {
    gap: 8,
    alignItems: "flex-end",
  },
  streakWeekRow: { alignItems: "flex-end", gap: 1 },
  streakWeekCount: { flexDirection: "row" },
  streakWeekVal: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 18,
    color: T.text,
  },
  streakWeekGoal: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 18,
    color: T.muted,
  },
  weekDots: { flexDirection: "row", gap: 5 },
  weekDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.bg3,
  },
  weekDotFilled: { backgroundColor: T.gold },

  // Section header
  sectionHdr: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHdrTitle: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    color: T.muted,
    letterSpacing: 1.8,
  },
  sectionLink: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: T.gold,
  },

  // Templates
  templatesContainer: { gap: 8, marginBottom: 10 },
  templateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.borderMid,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  templateIndex: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 22,
    color: T.muted,
    lineHeight: 24,
    width: 28,
  },
  templateContent: { flex: 1, gap: 3 },
  templateName: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 17,
    color: T.text,
    letterSpacing: 0.2,
  },
  templateMeta: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
  },
  templateExCount: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: T.muted,
  },
  startPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: T.gold,
    alignItems: "center",
    justifyContent: "center",
  },

  // Blank button
  blankBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: T.borderMid,
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 2,
  },
  blankBtnText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: T.sub,
  },

  // Hint card
  hintCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: T.bg1,
    borderWidth: 1,
    borderColor: T.borderMid,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
    marginTop: 4,
  },
  hintText: {
    flex: 1,
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.sub,
    lineHeight: 17,
  },

  // Action bar
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 8,
  },
  addExBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: T.goldBorder,
    borderRadius: 12,
    paddingVertical: 13,
    backgroundColor: T.goldDim,
  },
  addExBtnText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 14,
    color: T.gold,
    letterSpacing: 1.0,
  },
  timerBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: T.bg1,
    borderWidth: 1,
    borderColor: T.borderMid,
    alignItems: "center",
    justifyContent: "center",
  },

  // Finish CTA
  finishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: T.gold,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 6,
    marginBottom: 8,
  },
  finishBtnText: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 17,
    color: T.bg0,
    letterSpacing: 1.0,
  },

  // Empty exercise state
  emptyCard: {
    borderWidth: 1,
    borderColor: T.borderMid,
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 44,
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: T.goldDim,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 14,
    color: T.text,
    letterSpacing: 1.5,
    opacity: 0.7,
  },
  emptyHint: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.muted,
  },

  // History
  loadingWrap: { paddingVertical: 28, alignItems: "center" },
  historyCard: {
    backgroundColor: T.bg1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.borderMid,
    overflow: "hidden",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  historyIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: T.goldDim,
    borderWidth: 1,
    borderColor: T.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  historyLeft: { flex: 1, gap: 3 },
  historyName: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 13,
    color: T.text,
  },
  historyMeta: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
  },
  historyRight: { alignItems: "flex-end", gap: 3 },
  historyVol: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 14,
    color: T.gold,
  },
  historySets: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.muted,
  },
  emptyHistory: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 8,
    backgroundColor: T.bg1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.borderMid,
  },
  emptyHistoryTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: T.sub,
  },
  emptyHistoryText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.muted,
  },
});
