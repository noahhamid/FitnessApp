import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  ArrowRight,
  AlertCircle,
  Dumbbell as DumbbellIcon,
} from "lucide-react-native";
import { T } from "@/src/theme";
import { WorkoutTabHeader } from "../components/WorkoutTabHeader";
import { WorkoutPlanCard } from "../components/WorkoutPlanCard";
import { WorkoutDetailScreen } from "../components/WorkoutDetailScreen";
import { ContinueWorkoutCard } from "../components/ContinueWorkoutCard";
import {
  ActiveWorkoutScreen,
  type SetLog,
} from "../components/ActiveWorkoutScreen";
import { ExerciseLibrarySection } from "../components/ExerciseLibrarySection";
import { ExerciseDetailCard } from "../components/ExerciseDetailCard";
import type { LibraryExercise } from "../hooks/useExerciseLibrary";
import { useWorkoutPlan } from "../hooks/useWorkoutPlan";
import { useLastPerformance } from "../hooks/useLastPerformance";
import { useInProgressSession } from "../hooks/useInProgressSession";
import {
  adaptPlanDay,
  adaptLibraryExercise,
  imageForMuscleGroup,
} from "@/src/lib/workout-plan-adapter";
import { getTodaysPlanDayIndex } from "@/src/lib/plan-day-selection";
import {
  useStartWorkoutSession,
  useCompleteWorkoutSession,
  useAddExerciseToSession,
} from "../hooks/useWorkoutSession";
import type { WorkoutPlan } from "../data/workouts";
import { useAuth } from "@/src/features/auth/hooks/useAuth";

type ViewState = "today" | "fullPlan" | "detail" | "active" | "libraryDetail";

// Standard entrance used everywhere in this app: fade + rise,
// Easing.out(Easing.cubic), 380–480ms, staggered per-section by delay.
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
  const translateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 440,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 440,
        delay,
        easing: Easing.out(Easing.cubic),
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
  const [view, setView] = useState<ViewState>("today");
  const [selectedDay, setSelectedDay] = useState<WorkoutPlan | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const { user } = useAuth();
  const { data: apiPlan, isLoading, error } = useWorkoutPlan();
  const { data: lastPerformance } = useLastPerformance();
  const { inProgress } = useInProgressSession();
  const startSession = useStartWorkoutSession();
  const addExercise = useAddExerciseToSession();
  const completeSession = useCompleteWorkoutSession();
  const [starting, setStarting] = useState(false);

  const uiDays: WorkoutPlan[] = useMemo(() => {
    if (!apiPlan) return [];
    return apiPlan.days.map((day) => adaptPlanDay(day, apiPlan.goalId));
  }, [apiPlan]);

  const todaysIndex = useMemo(
    () => getTodaysPlanDayIndex(uiDays.length),
    [uiDays.length],
  );
  const baseTodaysWorkout = uiDays[todaysIndex] ?? null;

  const [extraExercises, setExtraExercises] = useState<
    { id: string; name: string; muscleGroup: string; movementPattern: string }[]
  >([]);
  const addedIds = useMemo(
    () => new Set(extraExercises.map((e) => e.id)),
    [extraExercises],
  );

  const todaysWorkout = useMemo(() => {
    if (!baseTodaysWorkout) return null;
    if (extraExercises.length === 0) return baseTodaysWorkout;
    return {
      ...baseTodaysWorkout,
      exercises: [
        ...baseTodaysWorkout.exercises,
        ...extraExercises.map((e) =>
          adaptLibraryExercise(e, apiPlan?.goalId ?? "health"),
        ),
      ],
    };
  }, [baseTodaysWorkout, extraExercises, apiPlan?.goalId]);

  const [cameFrom, setCameFrom] = useState<"today" | "fullPlan">("today");
  const [viewingExercise, setViewingExercise] =
    useState<LibraryExercise | null>(null);
  const [libraryDetailAdded, setLibraryDetailAdded] = useState(false);

  const handleCardPress = (plan: WorkoutPlan, from: "today" | "fullPlan") => {
    setSelectedDay(plan);
    setCameFrom(from);
    setView("detail");
  };

  const handleResume = () => {
    if (!inProgress) return;
    // Reopens the SAME session (no new session created, no exercises
    // re-added) — just restarts the exercise sequence from the top.
    // See useInProgressSession's note on why a true mid-set resume
    // isn't possible with what's currently persisted.
    setSelectedDay(inProgress.plan);
    setActiveSessionId(inProgress.sessionId);
    setView("active");
  };

  const handleStart = async (plan: WorkoutPlan) => {
    if (starting) return; // guards against rapid double-taps
    setStarting(true);
    setSelectedDay(plan);

    try {
      const session = await startSession.mutateAsync({
        notes: `${apiPlan?.splitLabel ?? "Workout"} — ${plan.title}`,
      });

      // Parallelized — was a sequential awaited loop before, which meant
      // N exercises = N back-to-back round-trips before the active screen
      // ever appeared. All independent, so no reason not to fire together.
      await Promise.all(
        plan.exercises.map((ex) =>
          addExercise.mutateAsync({
            sessionId: session.id,
            exerciseName: ex.name,
          }),
        ),
      );

      setActiveSessionId(session.id);
      setView("active");
    } catch (e) {
      console.log("Failed to start workout session:", e);
    } finally {
      setStarting(false);
    }
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
    setExtraExercises([]);
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
        starting={starting}
      />
    );
  }

  // ── Active workout screen ────────────────────────────────────────────────
  if (view === "active" && selectedDay) {
    return (
      <ActiveWorkoutScreen
        plan={selectedDay}
        onClose={() => setView("detail")}
        onFinish={handleFinish}
        lastPerformance={lastPerformance}
      />
    );
  }

  // ── Full plan view — all days, same card list as before ────────────────────
  if (view === "fullPlan") {
    return (
      <View style={s.screen}>
        <LinearGradient
          colors={["rgba(28,63,46,0.06)", "rgba(28,63,46,0)"]}
          style={s.topWash}
          pointerEvents="none"
        />
        <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Reveal delay={0} style={s.fullPlanHeader}>
            <Pressable
              onPress={() => setView("today")}
              hitSlop={8}
              style={s.backRow}
            >
              <ChevronLeft size={16} color={T.faint} strokeWidth={2.4} />
              <Text style={s.backLink}>Today</Text>
            </Pressable>
            <Text style={s.sectionTitle}>Full plan</Text>
            {apiPlan && (
              <Text style={s.splitSub}>
                {apiPlan.splitLabel} · {apiPlan.daysPerWeek} days / week
              </Text>
            )}
          </Reveal>

          {uiDays.map((plan, i) => (
            <WorkoutPlanCard
              key={plan.id}
              title={plan.title}
              tag={plan.tag}
              minutes={estimateMinutes(plan)}
              exerciseCount={plan.exercises.length}
              muscles={muscleSummary(plan)}
              imageUrl={plan.coverImage}
              entranceDelay={i * 60}
              onPress={() => handleCardPress(plan, "fullPlan")}
            />
          ))}
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
        addedToToday={addedIds.has(viewingExercise.id) || libraryDetailAdded}
        onBack={() => {
          setView("today");
          setViewingExercise(null);
          setLibraryDetailAdded(false);
        }}
        onAddToToday={() => {
          setExtraExercises((prev) => [...prev, viewingExercise]);
          setLibraryDetailAdded(true);
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
          setViewingExercise(null);
          setLibraryDetailAdded(false);
          handleStart(standalonePlan);
        }}
      />
    );
  }

  // ── Today screen ─────────────────────────────────────────────────────────
  return (
    <View style={s.screen}>
      <LinearGradient
        colors={["rgba(28,63,46,0.06)", "rgba(28,63,46,0)"]}
        style={s.topWash}
        pointerEvents="none"
      />
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Reveal delay={0}>
          <WorkoutTabHeader
            name={user?.name ?? "there"}
            avatarUrl="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80"
            onPressBell={() => {}}
          />
        </Reveal>

        <Reveal delay={80} style={s.splitHeader}>
          {apiPlan && (
            <>
              <View style={s.splitLabelRow}>
                <View style={s.splitDot} />
                <Text style={s.splitLabel}>
                  {apiPlan.splitLabel.toUpperCase()}
                </Text>
              </View>
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
          <Reveal delay={0} style={s.centerState}>
            <View style={s.centerIcon}>
              <AlertCircle size={20} color={T.accent} strokeWidth={1.8} />
            </View>
            <Text style={s.emptyTitle}>Couldn't load your plan</Text>
            <Text style={s.emptySubtitle}>
              Pull to refresh, or check your connection.
            </Text>
          </Reveal>
        )}

        {!isLoading && !error && !todaysWorkout && (
          <Reveal delay={0} style={s.centerState}>
            <View style={s.centerIcon}>
              <DumbbellIcon size={20} color={T.accent} strokeWidth={1.8} />
            </View>
            <Text style={s.emptyTitle}>No plan yet</Text>
            <Text style={s.emptySubtitle}>
              Finish onboarding to get a personalized training split.
            </Text>
          </Reveal>
        )}

        {inProgress && (
          <Reveal delay={100} style={{ marginBottom: T.space.lg }}>
            <ContinueWorkoutCard
              title={inProgress.plan.title}
              tag={inProgress.plan.tag}
              minutes={inProgress.minutesLeft}
              calories={inProgress.estCalories}
              percent={inProgress.percent}
              onPress={handleResume}
            />
          </Reveal>
        )}

        {todaysWorkout && (
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
                entranceDelay={0}
                onPress={() => handleCardPress(todaysWorkout, "today")}
              />
            </Reveal>

            <Reveal delay={240} style={s.seeFullPlanWrap}>
              <Pressable
                onPress={() => setView("fullPlan")}
                hitSlop={8}
                style={s.seeFullPlanRow}
              >
                <Text style={s.seeFullPlanText}>See full plan</Text>
                <ArrowRight size={14} color={T.accent} strokeWidth={2.4} />
              </Pressable>
            </Reveal>

            <ExerciseLibrarySection
              addedIds={addedIds}
              onAdd={(ex) => setExtraExercises((prev) => [...prev, ex])}
              onView={(ex) => {
                setViewingExercise(ex);
                setView("libraryDetail");
              }}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: T.space.xl,
    paddingTop: T.space.lg,
    paddingBottom: 128, // tab-bar clearance, screen-specific
  },
  splitHeader: { marginBottom: T.space.xl },
  splitLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  splitDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: T.accent,
  },
  splitLabel: {
    color: T.accent,
    fontFamily: T.bodyBold,
    fontSize: 10.5,
    letterSpacing: 1,
  },
  splitSub: {
    color: T.faint,
    fontFamily: T.bodyMed,
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: T.text,
    fontFamily: T.displaySemi,
    fontSize: 21,
    letterSpacing: -0.4,
    marginBottom: T.space.md + 2,
  },
  centerState: {
    alignItems: "center",
    paddingVertical: T.space.xxxl + 8,
    gap: 6,
  },
  centerIcon: {
    width: 44,
    height: 44,
    borderRadius: T.radius.md,
    backgroundColor: T.ringGlass,
    borderWidth: 0.5,
    borderColor: T.ringBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: T.space.xs,
  },
  emptyTitle: { color: T.text, fontFamily: T.bodyBold, fontSize: 15 },
  emptySubtitle: {
    color: T.faint,
    fontFamily: T.bodyMed,
    fontSize: 12,
    textAlign: "center",
  },
  seeFullPlanWrap: { alignItems: "center", marginTop: T.space.xl },
  seeFullPlanRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  seeFullPlanText: {
    color: T.accent,
    fontFamily: T.bodyBold,
    fontSize: 13,
    letterSpacing: -0.1,
  },
  fullPlanHeader: { marginBottom: T.space.lg + 2 },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginBottom: T.space.lg,
    alignSelf: "flex-start",
  },
  backLink: {
    color: T.faint,
    fontSize: 13,
    fontFamily: T.bodySemi,
  },
  topWash: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 260,
  },
});
