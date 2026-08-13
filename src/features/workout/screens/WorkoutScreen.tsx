import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Pressable,
  StyleProp,
  ViewStyle,
  Image,
  Alert,
  Modal,
  RefreshControl,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { topInset } from "@/src/lib/safe-area";
import { tabContentBottomPad } from "@/src/lib/tab-chrome";
import { api } from "@/src/lib/api";
import { WorkoutTabHeader } from "../components/WorkoutTabHeader";
import { WorkoutPlanCard } from "../components/WorkoutPlanCard";
import { WorkoutDetailScreen } from "../components/WorkoutDetailScreen";
import { ContinueWorkoutCard } from "../components/ContinueWorkoutCard";
import { InProgressStatsRow } from "../components/InProgressStatsRow";
import {
  ActiveWorkoutScreen,
  type SetLog,
} from "../components/ActiveWorkoutScreen";
import { ExerciseLibrarySection } from "../components/ExerciseLibrarySection";
import { ConditioningCard } from "../components/ConditioningCard";
import { planConditioning } from "@/src/lib/conditioning-plan";
import { useUserProfile } from "@/src/features/profile/hooks/useUserProfile";
import { ExerciseDetailCard } from "../components/ExerciseDetailCard";
import {
  useExerciseLibrary,
  type LibraryExercise,
} from "../hooks/useExerciseLibrary";
import {
  useWorkoutPlan,
  workoutPlanQueryKey,
  fetchWorkoutPlan,
} from "../hooks/useWorkoutPlan";
import { useLastPerformance } from "../hooks/useLastPerformance";
import { useInProgressSession } from "../hooks/useInProgressSession";
import { useWorkoutStreak } from "../hooks/useWorkoutStreak";
import { useTodayExtras } from "../hooks/useTodayExtras";
import { usePersonalRecords } from "@/src/features/progress/hooks/useProgress";
import {
  adaptPlanDay,
  adaptLibraryExercise,
  imageForMuscleGroup,
} from "@/src/lib/workout-plan-adapter";
import {
  getTodaysPlanDayIndex,
  getWeeklySlots,
  WEEKDAY_LABELS_SHORT,
} from "@/src/lib/plan-day-selection";
import { Moon } from "lucide-react-native";
import {
  useStartWorkoutSession,
  useCompleteWorkoutSession,
} from "../hooks/useWorkoutSession";
import { useAddToLiveSession } from "../hooks/useAddToLiveSession";
import type { Exercise, WorkoutPlan } from "../data/workouts";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import {
  invalidateQueryPrefixes,
  usePullToRefresh,
} from "@/src/hooks/usePullToRefresh";

type ViewState = "today" | "fullPlan" | "detail" | "active" | "libraryDetail";

/** Flip to `true` in __DEV__ to verify failed background session UX (banner + Alert). */
const FORCE_SESSION_CREATE_FAIL = false;

/** Resolve a plan exercise to LibraryExercise shape for ExerciseDetailCard. */
function toLibraryExercise(
  exercise: { id: string; name: string; muscleGroup?: string },
  library: LibraryExercise[] | undefined,
): LibraryExercise {
  const match = library?.find((l) => l.name === exercise.name);
  if (match) return match;
  return {
    id: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup ?? "core",
    movementPattern: "carry",
    minEquipment: "bodyweight",
  };
}

const Reveal = ({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 420,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

function estimateMinutes(plan: WorkoutPlan): number {
  const seconds = plan.exercises.reduce((sum, ex) => {
    const work =
      ex.type === "duration" ? (ex.durationSec ?? 0) : (ex.reps ?? 10) * 3;
    return sum + (work + ex.restSec) * ex.sets;
  }, 0);
  return Math.round(seconds / 60);
}

function muscleSummary(plan: WorkoutPlan): string {
  const groups = plan.exercises
    .map((e) => e.muscleGroup)
    .filter((g): g is string => !!g);
  const unique = [...new Set(groups)].slice(0, 3);
  const capitalized = unique.map((g) => g.charAt(0).toUpperCase() + g.slice(1));
  return capitalized.length > 0 ? capitalized.join(", ") : "Full body";
}

export default function WorkoutScreen() {
  const { T, styles: s, resolved } = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const safeTop = topInset(insets.top);
  const queryClient = useQueryClient();
  const [view, setView] = useState<ViewState>("today");
  const [selectedDay, setSelectedDay] = useState<WorkoutPlan | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  // Live exercise list for the active session — seeded on start/resume,
  // appendable mid-workout via ActiveWorkoutScreen's library modal.
  const [activeExercises, setActiveExercises] = useState<Exercise[]>([]);
  // Fresh start and resume both land on the list/home-base first.
  // Auto-sequential play is still available inside ActiveWorkoutScreen
  // via the in-screen "Start workout" control — just not as the default entry.
  const [entryMode, setEntryMode] = useState<"list" | "auto">("list");
  const [sessionCreating, setSessionCreating] = useState(false);
  const [sessionCreateError, setSessionCreateError] = useState<string | null>(
    null,
  );
  /** Invalidates in-flight creates when the user cancels mid-setup. */
  const startGenRef = useRef(0);
  const pendingStartPlanRef = useRef<WorkoutPlan | null>(null);

  const { user } = useAuth();
  const { data: apiPlan, isLoading, error } = useWorkoutPlan();
  const { data: profile } = useUserProfile();
  const { data: lastPerformance } = useLastPerformance();
  const { data: exerciseLibrary } = useExerciseLibrary();
  const { inProgress, isLoading: inProgressLoading } = useInProgressSession();
  const { streakDays } = useWorkoutStreak(!!inProgress);
  const { data: personalRecords } = usePersonalRecords();
  const startSession = useStartWorkoutSession();
  const completeSession = useCompleteWorkoutSession();

  const refreshWorkout = useCallback(
    () =>
      invalidateQueryPrefixes(queryClient, [
        workoutPlanQueryKey,
        ["in-progress-session"],
        ["exercise-library"],
        ["workout-last-performance"],
        ["personal-records"],
        ["today-extras"],
        ["workout-sessions"],
      ]),
    [queryClient],
  );
  const { refreshing, onRefresh } = usePullToRefresh(refreshWorkout);

  // Streak card only when there's a real multi-day streak (≥2).
  const visibleStreak =
    inProgress && streakDays >= 2 ? streakDays : null;
  // Same shared add path as ActiveWorkoutScreen's modal — sessionId from
  // the live in-progress session (confirmed field on useInProgressSession).
  const {
    addExercise: addToLiveSession,
    isPending: liveAddPending,
  } = useAddToLiveSession(inProgress?.sessionId);

  // Backend-persisted "added for today" exercises — survives reload,
  // resets naturally at the next calendar day via logDate. Replaces the
  // old local-only extraExercises state.
  const {
    extras,
    addExtra,
    removeExtra,
    clearAllExtras,
    isAddingExtra,
  } = useTodayExtras();

  // Checkmark destination matches the active add path: live session names
  // while a workout is in progress, PlannedExtraExercise names otherwise.
  const addedNames = useMemo(() => {
    if (inProgress) {
      return new Set(inProgress.plan.exercises.map((e) => e.name));
    }
    return new Set(extras.map((e) => e.exerciseName));
  }, [inProgress, extras]);

  const uiDays: WorkoutPlan[] = useMemo(() => {
    if (!apiPlan) return [];
    return apiPlan.days.map((day) => adaptPlanDay(day, apiPlan.goalId));
  }, [apiPlan]);

  const daysPerWeek = apiPlan?.daysPerWeek ?? uiDays.length;

  const trainingDays = apiPlan?.trainingDays;

  const todaysIndex = useMemo(
    () => getTodaysPlanDayIndex(daysPerWeek, trainingDays),
    [daysPerWeek, trainingDays],
  );
  const isRestDay = !!apiPlan && todaysIndex === null;
  const baseTodaysWorkout =
    todaysIndex !== null ? (uiDays[todaysIndex] ?? null) : null;

  const weekSlots = useMemo(
    () => (apiPlan ? getWeeklySlots(daysPerWeek, trainingDays) : []),
    [apiPlan, daysPerWeek, trainingDays],
  );

  // Aerobic side of the week — the plan generator only fills lifting slots.
  const conditioning = useMemo(() => {
    if (!apiPlan) return null;
    return planConditioning({
      goalId: apiPlan.goalId as "lose" | "build" | "endure" | "health",
      daysPerWeek,
      equipment: apiPlan.equipment as
        | "full_gym"
        | "home_dumbbells"
        | "bodyweight",
      injuries: profile?.injuries,
    });
  }, [apiPlan, daysPerWeek, profile?.injuries]);

  const todaysWorkout = useMemo(() => {
    if (!baseTodaysWorkout) return null;
    if (extras.length === 0) return baseTodaysWorkout;
    return {
      ...baseTodaysWorkout,
      exercises: [
        ...baseTodaysWorkout.exercises,
        ...extras.map((e) =>
          adaptLibraryExercise(
            {
              id: e.id,
              name: e.exerciseName,
              muscleGroup: e.muscleGroup,
              movementPattern: e.movementPattern,
            },
            apiPlan?.goalId ?? "health",
          ),
        ),
      ],
    };
  }, [baseTodaysWorkout, extras, apiPlan?.goalId]);

  // Prefetch plan + today's cover while the Workout tab is focused so Start
  // doesn't wait on a cold plan fetch / image decode.
  useFocusEffect(
    useCallback(() => {
      void queryClient.prefetchQuery({
        queryKey: workoutPlanQueryKey,
        queryFn: fetchWorkoutPlan,
      });
    }, [queryClient]),
  );

  useEffect(() => {
    const uri = todaysWorkout?.coverImage;
    if (!uri) return;
    Image.prefetch(uri).catch(() => {});
  }, [todaysWorkout?.coverImage]);

  const [cameFrom, setCameFrom] = useState<"today" | "fullPlan">("today");
  const [viewingExercise, setViewingExercise] =
    useState<LibraryExercise | null>(null);
  // Where to return when closing ExerciseDetailCard opened from a plan list.
  const [libraryDetailFrom, setLibraryDetailFrom] = useState<
    "today" | "detail"
  >("today");

  const handleCardPress = (plan: WorkoutPlan, from: "today" | "fullPlan") => {
    // Today's card is an entry point, not a preview — skip WorkoutDetailScreen
    // and start immediately (same path as detail's onStart). Full-plan days
    // still open the detail/preview screen for browsing.
    if (from === "today") {
      setCameFrom("today");
      handleStart(plan);
      return;
    }
    setSelectedDay(plan);
    setCameFrom(from);
    setView("detail");
  };

  const openExerciseDetail = (
    exercise: { id: string; name: string; muscleGroup?: string },
    from: "today" | "detail",
  ) => {
    setViewingExercise(toLibraryExercise(exercise, exerciseLibrary));
    setLibraryDetailFrom(from);
    setView("libraryDetail");
  };

  const handleResume = () => {
    if (!inProgress) return;
    startGenRef.current += 1;
    pendingStartPlanRef.current = null;
    setSessionCreating(false);
    setSessionCreateError(null);
    setEntryMode("list");
    setSelectedDay(inProgress.plan);
    setActiveExercises(inProgress.plan.exercises);
    setActiveSessionId(inProgress.sessionId);
    setView("active");
  };

  const createSessionInBackground = (plan: WorkoutPlan, gen: number) => {
    setSessionCreating(true);
    setSessionCreateError(null);

    void (async () => {
      try {
        if (FORCE_SESSION_CREATE_FAIL) {
          throw new Error("Forced start failure (dev test)");
        }
        const session = await startSession.mutateAsync({
          notes: plan.title,
          exercises: plan.exercises.map((ex) => ({ exerciseName: ex.name })),
        });

        if (gen !== startGenRef.current) {
          // User cancelled (or restarted) while this create was in flight —
          // delete the orphan so it doesn't become a phantom Continue card.
          void api.delete(`/api/workouts/${session.id}`).catch(() => {});
          return;
        }
        setActiveSessionId(session.id);
        // Remap catalog/plan exercise ids → real WorkoutExercise row ids
        // so incremental set PATCH can target the correct rows.
        const serverRows = [...(session.exercises ?? [])];
        setActiveExercises((prev) =>
          prev.map((ex) => {
            const idx = serverRows.findIndex(
              (se) => se.exerciseName === ex.name,
            );
            if (idx === -1) return ex;
            const [matched] = serverRows.splice(idx, 1);
            return { ...ex, id: matched.id };
          }),
        );
        setSessionCreating(false);
        setSessionCreateError(null);

        if (todaysWorkout && plan.id === todaysWorkout.id) {
          void clearAllExtras().catch((e) =>
            console.log("Failed to clear today's extras after start:", e),
          );
        }
      } catch (e) {
        if (gen !== startGenRef.current) return;
        const message =
          e instanceof Error
            ? e.message
            : "Couldn't save this workout to your account.";
        console.log("Failed to start workout session:", e);
        setSessionCreating(false);
        setSessionCreateError(message);
        Alert.alert(
          "Couldn't save workout",
          `${message}\n\nYou can retry from the banner, or cancel and try again.`,
        );
      }
    })();
  };

  /** Instant UI entry — session POST runs in the background. */
  const handleStart = (plan: WorkoutPlan) => {
    if (view === "active" && sessionCreating) return;
    // Never create while in-progress status is unknown, or when Continue exists.
    if (inProgressLoading || inProgress) return;

    const gen = ++startGenRef.current;
    pendingStartPlanRef.current = plan;
    setEntryMode("list");
    setSelectedDay(plan);
    setActiveExercises(plan.exercises);
    setActiveSessionId(null);
    setView("active");
    createSessionInBackground(plan, gen);
  };

  const handleRetryCreateSession = () => {
    const plan = pendingStartPlanRef.current ?? selectedDay;
    if (!plan) return;
    const gen = ++startGenRef.current;
    pendingStartPlanRef.current = plan;
    setActiveSessionId(null);
    createSessionInBackground(plan, gen);
  };

  const leaveActiveWorkout = () => {
    startGenRef.current += 1;
    pendingStartPlanRef.current = null;
    setSessionCreating(false);
    setSessionCreateError(null);
    setActiveSessionId(null);
    setActiveExercises([]);
    // Ensure Resume / Continue card pick up Stage-1 set PATCH data.
    void queryClient.invalidateQueries({ queryKey: ["in-progress-session"] });
    setView(cameFrom === "fullPlan" ? "detail" : "today");
  };

  const handleFinish = async (logs: SetLog[]) => {
    if (!activeSessionId) {
      setView("today");
      setSelectedDay(null);
      return;
    }

    const byExercise = new Map<string, SetLog[]>();
    for (const log of logs) {
      const existing = byExercise.get(log.exerciseName) ?? [];
      existing.push(log);
      byExercise.set(log.exerciseName, existing);
    }

    try {
      await completeSession.mutateAsync({
        sessionId: activeSessionId,
        exercises: Array.from(byExercise.entries()).map(
          ([exerciseName, sets]) => ({
            exerciseName,
            sets: sets.map((s) => ({
              reps: s.reps,
              weight: s.weight,
              durationSec: s.durationSec,
              completed: s.completed,
            })),
          }),
        ),
      });
    } catch (e) {
      console.log("Failed to log completed workout:", e);
    }

    setView("today");
    setSelectedDay(null);
    setActiveSessionId(null);
    setActiveExercises([]);
    setViewingExercise(null);
  };

  // ── Detail screen ─────────────────────────────────────────────────────────
  if (view === "detail" && selectedDay) {
    return (
      <WorkoutDetailScreen
        plan={selectedDay}
        onBack={() => {
          setView(cameFrom);
          setSelectedDay(null);
        }}
        onStart={() => selectedDay && handleStart(selectedDay)}
        onExercisePress={(ex: Exercise) => openExerciseDetail(ex, "detail")}
      />
    );
  }

  // ── Active workout screen ────────────────────────────────────────────────
  // Full-screen Modal so the floating tab pill (sibling overlay in tabs
  // layout) cannot sit on top of the immersive workout UI.
  if (view === "active" && selectedDay) {
    return (
      <Modal
        visible
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => {
          /* X / focus-back inside ActiveWorkout own the exit path
             (silent delete vs resume). Hardware back → leave resumable. */
          leaveActiveWorkout();
        }}
        statusBarTranslucent
      >
        <SafeAreaProvider>
          <ActiveWorkoutScreen
            plan={selectedDay}
            sessionId={activeSessionId}
            sessionCreating={sessionCreating}
            sessionCreateError={sessionCreateError}
            onRetryCreateSession={handleRetryCreateSession}
            initialMode={entryMode}
            exercises={activeExercises}
            onExercisesChange={setActiveExercises}
            onAppendExercise={(ex) =>
              setActiveExercises((prev) =>
                prev.some((e) => e.name === ex.name) ? prev : [...prev, ex],
              )
            }
            onClose={leaveActiveWorkout}
            onFinish={handleFinish}
            lastPerformance={lastPerformance}
          />
        </SafeAreaProvider>
      </Modal>
    );
  }

  // ── Full plan view — all days, same card list as before ────────────────────
  if (view === "fullPlan") {
    return (
      <View style={s.screen}>
        <LinearGradient
          colors={["rgba(229,57,53,0.06)", "rgba(229,57,53,0)"]}
          style={s.topWash}
          pointerEvents="none"
        />
        <StatusBar
          barStyle="light-content"
        />
        <ScrollView
          style={s.scroll}
          contentContainerStyle={[
            s.scrollContent,
            {
              paddingTop: safeTop + 8,
              paddingBottom: tabContentBottomPad(insets.bottom),
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={T.accent}
              colors={[T.accent]}
              progressBackgroundColor={T.bgElevated}
            />
          }
        >
          <Reveal delay={0} style={s.fullPlanHeader}>
            <Pressable onPress={() => setView("today")} hitSlop={8}>
              <Text style={s.backLink}>← Today</Text>
            </Pressable>
            <Text style={s.sectionTitle}>Full plan</Text>
            {apiPlan && (
              <Text style={s.splitSub}>
                {apiPlan.splitLabel} · {apiPlan.daysPerWeek} days / week
              </Text>
            )}
          </Reveal>

          {weekSlots.map((slot, i) => {
            const weekday = WEEKDAY_LABELS_SHORT[slot.weekdayIndex];
            if (slot.kind === "rest") {
              return (
                <Reveal key={`rest-${slot.weekdayIndex}`} delay={i * 50}>
                  <View style={s.restRow}>
                    <Text style={s.restRowWeekday}>{weekday}</Text>
                    <View style={s.restRowBody}>
                      <Moon size={14} color={T.faint} strokeWidth={2} />
                      <Text style={s.restRowTitle}>Rest day</Text>
                    </View>
                  </View>
                </Reveal>
              );
            }
            const plan = uiDays[slot.planDayIndex];
            if (!plan) return null;
            return (
              <View key={plan.id} style={s.trainSlot}>
                <Text style={s.trainSlotWeekday}>{weekday}</Text>
                <WorkoutPlanCard
                  title={plan.title}
                  tag={plan.tag}
                  minutes={estimateMinutes(plan)}
                  exerciseCount={plan.exercises.length}
                  muscles={muscleSummary(plan)}
                  imageUrl={plan.coverImage}
                  entranceDelay={i * 60}
                  onPress={() => handleCardPress(plan, "fullPlan")}
                />
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // ── Library exercise detail (view / start standalone / add to today) ──────
  if (view === "libraryDetail" && viewingExercise) {
    return (
      <ExerciseDetailCard
        exercise={viewingExercise}
        imageUrl={imageForMuscleGroup(viewingExercise.muscleGroup)}
        addedToToday={addedNames.has(viewingExercise.name)}
        // Mid-workout library modal (ActiveWorkoutScreen) passes
        // showStart={false} / allowRemove={false}. Today browse omits
        // showStart so it defaults to true — previously showStart={!inProgress}
        // hid Start whenever a Continue session existed.
        addLabel={
          inProgress ? "Add to this workout" : "Add to today's session"
        }
        allowRemove={!inProgress}
        addPending={inProgress ? liveAddPending : isAddingExtra}
        onBack={() => {
          setView(libraryDetailFrom);
          setViewingExercise(null);
        }}
        onAddToToday={() => {
          if (inProgress) {
            void addToLiveSession(viewingExercise, {
              alreadyAdded: addedNames,
            });
            return;
          }
          addExtra({
            exerciseName: viewingExercise.name,
            muscleGroup: viewingExercise.muscleGroup,
            movementPattern: viewingExercise.movementPattern,
          });
        }}
        onRemoveFromToday={() => {
          if (inProgress) return;
          const extra = extras.find(
            (e) => e.exerciseName === viewingExercise.name,
          );
          if (extra) removeExtra(extra.id);
        }}
        onStart={() => {
          const standalonePlan: WorkoutPlan = {
            id: `standalone-${viewingExercise.id}`,
            title: viewingExercise.name,
            tag: "Extra",
            coverImage: imageForMuscleGroup(viewingExercise.muscleGroup),
            exercises: [
              adaptLibraryExercise(
                viewingExercise,
                apiPlan?.goalId ?? "health",
              ),
            ],
          };
          handleStart(standalonePlan);
        }}
      />
    );
  }

  // ── Today screen ─────────────────────────────────────────────────────────
  return (
    <View style={s.screen}>
      <StatusBar
        barStyle="light-content"
      />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[
          s.scrollContent,
          { paddingBottom: tabContentBottomPad(insets.bottom) },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={T.accent}
            colors={[T.accent]}
            progressBackgroundColor={T.bgElevated}
          />
        }
      >
        <Reveal delay={0}>
          <WorkoutTabHeader
            name={user?.name ?? "there"}
            avatarUrl="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80"
          />
        </Reveal>

        <Reveal delay={80} style={s.splitHeader}>
          {apiPlan && (
            <>
              <Text style={s.splitLabel}>{apiPlan.splitLabel}</Text>
              <Text style={s.splitSub}>{apiPlan.daysPerWeek} days / week</Text>
            </>
          )}
        </Reveal>

        {isLoading && (
          <View style={s.centerState}>
            <ActivityIndicator color={T.accent} />
          </View>
        )}

        {!isLoading && error && (
          <View style={s.centerState}>
            <Text style={s.emptyTitle}>Couldn't load your plan</Text>
            <Text style={s.emptySubtitle}>
              Pull to refresh, or check your connection.
            </Text>
          </View>
        )}

        {!isLoading && !error && !apiPlan && (
          <View style={s.centerState}>
            <Text style={s.emptyTitle}>No plan yet</Text>
            <Text style={s.emptySubtitle}>
              Finish onboarding to get a personalized training split.
            </Text>
          </View>
        )}

        {/* Three states for today's card: loading → skeleton (no Start);
            loaded + in progress → Continue; loaded + idle → Start/rest.
            Start must not mount until in-progress is definitively known. */}
        {apiPlan && inProgressLoading && (
          <View style={s.workoutCardSkeleton} accessibilityLabel="Loading workout">
            <View style={s.workoutCardSkeletonHero} />
            <View style={s.workoutCardSkeletonBody}>
              <View style={s.workoutCardSkeletonLineWide} />
              <View style={s.workoutCardSkeletonLine} />
              <View style={s.workoutCardSkeletonCta} />
            </View>
          </View>
        )}

        {!inProgressLoading && inProgress && (
          <>
            <Reveal delay={100} style={{ marginBottom: 12 }}>
              <ContinueWorkoutCard
                title={inProgress.plan.title}
                tag={inProgress.plan.tag}
                minutes={inProgress.minutesLeft}
                calories={inProgress.estCalories}
                percent={inProgress.percent}
                imageUrl={
                  inProgress.plan.coverImage || todaysWorkout?.coverImage
                }
                exercises={inProgress.plan.exercises}
                personalRecords={personalRecords}
                onPress={handleResume}
              />
            </Reveal>
            {visibleStreak != null && (
              <Reveal delay={160} style={{ marginBottom: 16 }}>
                <InProgressStatsRow streakDays={visibleStreak} />
              </Reveal>
            )}
          </>
        )}

        {apiPlan && !inProgressLoading && (
          <>
            {!inProgress && isRestDay && (
              <>
                <Reveal delay={140}>
                  <Text style={s.sectionTitle}>Today</Text>
                </Reveal>
                <Reveal delay={180}>
                  <View style={s.restCard}>
                    <View style={s.restIconWrap}>
                      <Moon size={20} color={T.accent} strokeWidth={2} />
                    </View>
                    <Text style={s.restTitle}>Rest day</Text>
                    <Text style={s.restBody}>
                      No session on the schedule — let the work from earlier in
                      the week settle. Browse the library if you still want to
                      move.
                    </Text>
                  </View>
                </Reveal>
              </>
            )}

            {!inProgress && todaysWorkout && (
              <>
                <Reveal delay={140}>
                  <Text style={s.sectionTitle}>Today's workout</Text>
                </Reveal>

                <Reveal delay={180}>
                  <WorkoutPlanCard
                    title={todaysWorkout.title}
                    tag={todaysWorkout.tag}
                    minutes={estimateMinutes(todaysWorkout)}
                    exerciseCount={todaysWorkout.exercises.length}
                    muscles={muscleSummary(todaysWorkout)}
                    imageUrl={todaysWorkout.coverImage}
                    ctaLabel="Start workout"
                    entranceDelay={0}
                    onPress={() => handleCardPress(todaysWorkout, "today")}
                  />
                </Reveal>
              </>
            )}

            {conditioning && (
              <>
                <Reveal delay={210}>
                  <Text style={s.sectionTitle}>This week</Text>
                </Reveal>
                <Reveal delay={240} style={s.conditioningWrap}>
                  <ConditioningCard plan={conditioning} />
                </Reveal>
              </>
            )}

            <Reveal delay={280} style={s.seeFullPlanWrap}>
              <Pressable onPress={() => setView("fullPlan")} hitSlop={8}>
                <Text style={s.seeFullPlanText}>See full plan →</Text>
              </Pressable>
            </Reveal>

            <ExerciseLibrarySection
              onView={(ex) => openExerciseDetail(ex, "today")}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  // Top inset is handled by WorkoutTabHeader (and full-plan back link
  // uses its own insets). Keep a small gap under the status-bar padding.
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  splitHeader: { marginBottom: 20 },
  splitLabel: {
    color: T.accent,
    fontFamily: T.display,
    fontSize: 15,
    letterSpacing: -0.2,
  },
  splitSub: { color: T.faint, fontSize: 12, marginTop: 2 },
  sectionTitle: {
    color: T.text,
    fontFamily: T.display,
    fontSize: 21,
    letterSpacing: -0.4,
    marginBottom: 14,
  },
  centerState: { alignItems: "center", paddingVertical: 48, gap: 6 },
  emptyTitle: { color: T.text, fontFamily: T.bodyBold, fontSize: 15 },
  emptySubtitle: { color: T.faint, fontSize: 12, textAlign: "center" },
  workoutCardSkeleton: {
    marginBottom: 16,
    borderRadius: T.radius.xl,
    overflow: "hidden",
    backgroundColor: T.bgElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: T.border,
  },
  workoutCardSkeletonHero: {
    height: 156,
    backgroundColor: T.accentTint,
  },
  workoutCardSkeletonBody: {
    padding: 16,
    gap: 10,
  },
  workoutCardSkeletonLineWide: {
    height: 16,
    width: "72%",
    borderRadius: 8,
    backgroundColor: T.accentTint,
  },
  workoutCardSkeletonLine: {
    height: 12,
    width: "48%",
    borderRadius: 6,
    backgroundColor: T.accentTint,
  },
  workoutCardSkeletonCta: {
    marginTop: 6,
    height: 40,
    borderRadius: 999,
    backgroundColor: T.accentTint,
  },
  conditioningWrap: { marginBottom: 4 },
  seeFullPlanWrap: { alignItems: "center", marginTop: 20 },
  seeFullPlanText: {
    color: T.accent,
    fontFamily: T.display,
    fontSize: 13,
    letterSpacing: -0.1,
  },
  fullPlanHeader: { marginBottom: 18 },
  backLink: {
    color: T.faint,
    fontSize: 13,
    fontFamily: T.display,
    marginBottom: 16,
  },
  topWash: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 260,
  },
  restCard: {
    backgroundColor: T.bgElevated,
    borderWidth: 1,
    borderColor: T.glassBorder,
    borderRadius: T.radius.md,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: "center",
    gap: 8,
    ...T.shadow.card,
  },
  restIconWrap: {
    width: 40,
    height: 40,
    borderRadius: T.radius.sm,
    backgroundColor: T.ringGlass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: T.ringBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  restTitle: {
    fontFamily: T.displaySemi,
    fontSize: 18,
    color: T.white,
    letterSpacing: -0.3,
  },
  restBody: {
    fontFamily: T.bodyMed,
    fontSize: 13,
    color: T.muted,
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 280,
  },
  restRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    backgroundColor: T.bgElevated,
    borderRadius: T.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: T.glassBorder,
  },
  restRowWeekday: {
    width: 36,
    fontFamily: T.bodyBold,
    fontSize: 12,
    color: T.faint,
    letterSpacing: 0.2,
  },
  restRowBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  restRowTitle: {
    fontFamily: T.bodySemi,
    fontSize: 14,
    color: T.muted,
  },
  trainSlot: { marginBottom: 4 },
  trainSlotWeekday: {
    fontFamily: T.bodyBold,
    fontSize: 11,
    color: T.faint,
    letterSpacing: 0.3,
    marginBottom: 6,
    marginLeft: 2,
  },
  });
}
