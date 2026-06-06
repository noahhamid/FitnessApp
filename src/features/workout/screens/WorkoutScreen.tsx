import { Ionicons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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

// ── Design tokens (identical to DashboardScreen) ──────────────────────────────
const T = {
  bg0: "#0A0A0C",
  bg1: "#111114",
  bg2: "#18181D",
  bg3: "#222228",
  lime: "#C8F135",
  red: "#FF3D3D",
  orange: "#FF8A00",
  blue: "#3D8EFF",
  purple: "#9B6DFF",
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

// ── Shared layout primitives (mirrors Dashboard) ──────────────────────────────
function SectionGap() {
  return <View style={{ height: 16 }} />;
}

function SectionLabel({
  label,
  icon,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={s.sectionLabelRow}>
      <Ionicons name={icon} size={12} color={T.muted} />
      <Text style={s.sectionLabel}>{label}</Text>
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
  const accent = TEMPLATE_ACCENTS[index % TEMPLATE_ACCENTS.length];
  const presetIds = TEMPLATE_EXERCISES[tpl.id] ?? [];

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 2 }}>
      <TouchableOpacity
        disabled={disabled}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={s.templateCard}
      >
        <View style={[s.templateStripe, { backgroundColor: accent }]} />
        <View
          style={[
            s.templateIconWrap,
            { backgroundColor: accent + "18", borderColor: accent + "30" },
          ]}
        >
          <Ionicons name="barbell-outline" size={18} color={accent} />
        </View>
        <View style={s.templateContent}>
          <Text style={s.templateName}>{tpl.name}</Text>
          <Text style={s.templateMeta}>{tpl.tag}</Text>
          <Text style={[s.templateExCount, { color: accent }]}>
            {presetIds.length} exercises pre-loaded
          </Text>
        </View>
        <View
          style={[
            s.startChip,
            { backgroundColor: accent + "18", borderColor: accent + "30" },
          ]}
        >
          <Text style={[s.startChipText, { color: accent }]}>START</Text>
          <Ionicons name="chevron-forward" size={12} color={accent} />
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
      <View style={s.historyLeft}>
        <Text style={s.historyName} numberOfLines={1}>
          {session.name}
        </Text>
        <Text style={s.historyMeta}>
          {session.date} · {session.duration}
        </Text>
      </View>
      <View style={s.historyRight}>
        <Text style={s.historyVol}>{session.volume}</Text>
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
  const [editingName, setEditingName] = useState(false);

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

  const resetActiveWorkoutState = useCallback(() => {
    setActiveWorkout(false);
    setExercises([]);
    setExerciseSetsByUid({});
    setStartTime(null);
    setEditingName(false);
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
    <View style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg0} />

      {activeWorkout && startTime != null && (
        <WorkoutHeader
          startTime={startTime}
          name={workoutName}
          onFinish={finishWorkout}
          finishDisabled={finishingWorkout}
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
          <View style={s.header}>
            <View style={s.headerLeft}>
              <View style={s.datePill}>
                <Ionicons name="barbell-outline" size={10} color={T.muted} />
                <Text style={s.dateText}>TRAINING</Text>
              </View>
              <Text style={s.greeting}>READY TO WORK,</Text>
              <Text style={s.heroName}>TRAIN 💪</Text>
            </View>
          </View>
        )}

        {/* ── ACTIVE: name + progress ── */}
        {activeWorkout && (
          <View style={s.activeTopBar}>
            {/* Editable name */}
            <View style={s.nameRow}>
              {editingName ? (
                <TextInput
                  value={workoutName}
                  onChangeText={setWorkoutName}
                  onBlur={() => setEditingName(false)}
                  autoFocus
                  style={s.nameInput}
                  placeholderTextColor={T.muted}
                />
              ) : (
                <TouchableOpacity
                  onPress={() => setEditingName(true)}
                  style={s.nameEditTouchable}
                  activeOpacity={0.7}
                >
                  <Text style={s.nameEditText}>
                    {workoutName.toUpperCase()}
                  </Text>
                  <View style={s.editBadge}>
                    <Ionicons name="pencil" size={9} color={T.muted} />
                    <Text style={s.editBadgeText}>RENAME</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Exercise progress dots */}
            {exerciseCount > 0 && (
              <View style={s.progressInfo}>
                <Text style={s.progressText}>
                  {exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""} · tap
                  ✓ on each set when done
                </Text>
                <WorkoutSteps exerciseCount={exerciseCount} doneCount={0} />
              </View>
            )}
          </View>
        )}

        {/* ── ACTIVE: how-to hint (first time only) ── */}
        {activeWorkout && exerciseCount > 0 && (
          <View style={s.px}>
            <View style={s.hintCard}>
              <Ionicons
                name="information-circle-outline"
                size={15}
                color={T.blue}
              />
              <Text style={s.hintText}>
                Enter weight &amp; reps for each set, then tap the{" "}
                <Text style={{ color: T.lime }}>✓</Text> to mark it done.
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

        {/* ── ACTIVE: action bar ── */}
        {activeWorkout && (
          <View style={s.actionBar}>
            <TouchableOpacity
              disabled={sessionStarting || finishingWorkout}
              onPress={() => setShowLibrary(true)}
              style={s.addExBtn}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={18} color={T.lime} />
              <Text style={s.addExBtnText}>ADD EXERCISE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={finishingWorkout}
              onPress={() => setShowTimer(true)}
              style={s.timerBtn}
              activeOpacity={0.85}
            >
              <Ionicons name="timer-outline" size={20} color={T.text} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── ACTIVE: finish reminder ── */}
        {activeWorkout && exerciseCount > 0 && (
          <View style={s.px}>
            <TouchableOpacity
              disabled={finishingWorkout}
              onPress={finishWorkout}
              style={s.finishBanner}
              activeOpacity={0.85}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={T.lime}
              />
              <Text style={s.finishBannerText}>
                DONE? TAP TO FINISH &amp; SAVE
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── IDLE: quick start ── */}
        {!activeWorkout && (
          <>
            <SectionLabel label="QUICK START" icon="flash-outline" />
            <View style={s.px}>
              <View style={s.card}>
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
                    size={15}
                    color={T.muted}
                  />
                  <Text style={s.blankBtnText}>START BLANK WORKOUT</Text>
                </TouchableOpacity>
              </View>
            </View>
            <SectionGap />
          </>
        )}

        {/* ── IDLE: recent sessions ── */}
        {!activeWorkout && (
          <>
            <SectionLabel label="RECENT SESSIONS" icon="time-outline" />
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
    </View>
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

  // ── Idle header (mirrors Dashboard) ──────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 28,
    paddingBottom: 20,
  },
  headerLeft: { gap: 2 },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  dateText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: T.muted,
    letterSpacing: 0.8,
  },
  greeting: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 11,
    color: T.sub,
    letterSpacing: 1.1,
  },
  heroName: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 40,
    color: T.text,
    lineHeight: 42,
  },

  // ── Section labels (mirrors Dashboard) ───────────────────────────────────
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionLabel: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 11,
    color: T.muted,
    letterSpacing: 1.4,
  },

  // ── Card shell (mirrors Dashboard card bg) ────────────────────────────────
  card: {
    backgroundColor: T.bg1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
    overflow: "hidden",
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 4,
  },

  // ── Template card ─────────────────────────────────────────────────────────
  templateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.borderMid,
    overflow: "hidden",
    paddingRight: 12,
    gap: 12,
  },
  templateStripe: {
    width: 3,
    alignSelf: "stretch",
    opacity: 0.8,
  },
  templateIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 14,
  },
  templateContent: { flex: 1, paddingVertical: 14, gap: 2 },
  templateName: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 16,
    color: T.text,
    letterSpacing: 0.4,
  },
  templateMeta: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
  },
  templateExCount: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    letterSpacing: 0.3,
    marginTop: 1,
  },
  startChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  startChipText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 12,
    letterSpacing: 1,
  },

  // ── Blank workout button ──────────────────────────────────────────────────
  blankBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 2,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 14,
    borderStyle: "dashed",
    paddingVertical: 14,
    marginHorizontal: 2,
  },
  blankBtnText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 13,
    color: T.muted,
    letterSpacing: 1.4,
  },

  // ── Active: top area ──────────────────────────────────────────────────────
  activeTopBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 10,
  },
  nameRow: {},
  nameEditTouchable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  nameEditText: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 28,
    color: T.text,
    letterSpacing: 0.3,
  },
  editBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: T.bg3,
    borderWidth: 1,
    borderColor: T.borderMid,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  editBadgeText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 9,
    color: T.muted,
    letterSpacing: 1.5,
  },
  nameInput: {
    fontFamily: "BarlowCondensed_900Black",
    fontSize: 28,
    color: T.text,
    borderBottomWidth: 2,
    borderBottomColor: T.lime,
    paddingBottom: 4,
  },
  progressInfo: {
    gap: 6,
  },
  progressText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.sub,
  },
  stepsRow: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepDotDone: { backgroundColor: T.lime },
  stepDotActive: { backgroundColor: T.lime + "60" },
  stepDotIdle: { backgroundColor: T.muted },

  // ── Hint card ─────────────────────────────────────────────────────────────
  hintCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: T.blue + "12",
    borderWidth: 1,
    borderColor: T.blue + "25",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    marginTop: 4,
  },
  hintText: {
    flex: 1,
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.sub,
    lineHeight: 18,
  },

  // ── Active: action bar ────────────────────────────────────────────────────
  actionBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  addExBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: T.lime + "18",
    borderWidth: 1,
    borderColor: T.lime + "44",
    borderRadius: 14,
    paddingVertical: 15,
  },
  addExBtnText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: T.lime,
    letterSpacing: 1.2,
  },
  timerBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: T.bg3,
    borderWidth: 1,
    borderColor: T.borderMid,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Finish banner ─────────────────────────────────────────────────────────
  finishBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: T.lime + "12",
    borderWidth: 1,
    borderColor: T.lime + "30",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  finishBannerText: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 14,
    color: T.lime,
    letterSpacing: 1.2,
  },

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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
    overflow: "hidden",
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  historyLeft: { flex: 1, gap: 3, paddingRight: 12 },
  historyName: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: T.text,
    letterSpacing: 0.3,
  },
  historyMeta: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
  },
  historyRight: { alignItems: "flex-end", gap: 3 },
  historyVol: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 15,
    color: T.lime,
    letterSpacing: 0.3,
  },
  historySets: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: T.sub,
  },
  emptyHistory: {
    paddingVertical: 36,
    alignItems: "center",
    gap: 8,
    backgroundColor: T.bg1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
  },
  emptyHistoryTitle: {
    fontFamily: "BarlowCondensed_700Bold",
    fontSize: 16,
    color: T.text,
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  emptyHistoryText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: T.muted,
  },
});
