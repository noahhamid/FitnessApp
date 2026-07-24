import React, { useEffect, useMemo, useRef } from "react";
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
} from "react-native";

import { WorkoutTabHeader } from "../components/WorkoutTabHeader";
import { WorkoutPlanCard } from "../components/WorkoutPlanCard";
import { WorkoutDetailScreen } from "../components/WorkoutDetailScreen";
import {
  ActiveWorkoutScreen,
  type SetLog,
} from "../components/ActiveWorkoutScreen";
import { ExerciseLibrarySection } from "../components/ExerciseLibrarySection";
import { ExerciseDetailCard } from "../components/ExerciseDetailCard";
import type { LibraryExercise } from "../hooks/useExerciseLibrary";
import { useWorkoutPlan } from "../hooks/useWorkoutPlan";
import { useLastPerformance } from "../hooks/useLastPerformance";
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
import { useState } from "react";

const T = {
  bg: "#000000",
  text: "#FFFFFF",
  faint: "#9AA0AE",
  accent: "#FFC700",
  display: "SpaceGrotesk_700Bold",
};

type ViewState = "today" | "fullPlan" | "detail" | "active" | "libraryDetail";

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

// Rough duration estimate for the plan card, matching the same formula
// WorkoutDetailScreen uses internally.
function estimateMinutes(plan: WorkoutPlan): number {
  const seconds = plan.exercises.reduce((sum, ex) => {
    const work =
      ex.type === "duration" ? (ex.durationSec ?? 0) : (ex.reps ?? 10) * 3;
    return sum + (work + ex.restSec) * ex.sets;
  }, 0);
  return Math.round(seconds / 60);
}

function muscleSummary(plan: WorkoutPlan): string {
  // WorkoutPlanCard splits this string on "," to render separate chips.
  // Real muscle groups now, deduplicated and capitalized — not parsed
  // exercise-name fragments like "Barbell"/"Dumbbell" from before.
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

  const { data: apiPlan, isLoading, error } = useWorkoutPlan();
  const { data: lastPerformance } = useLastPerformance();
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

  // Extras only apply to today's session, not the underlying generated plan —
  // they reset if you leave and come back, which is intentional for v1
  // (persisting "today's ad-hoc additions" across sessions is a separate,
  // bigger decision about whether extras should become part of the plan).
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

  const handleStart = async (plan: WorkoutPlan) => {
    if (starting) return; // guards against rapid double-taps
    setStarting(true);
    setSelectedDay(plan);

    try {
      const session = await startSession.mutateAsync({
        notes: `${apiPlan?.splitLabel ?? "Workout"} — ${plan.title}`,
      });

      // Sets start empty and get filled in as the workout progresses —
      // this matches the backend's own intended flow for /:id/exercises
      // (sets defaults to [] there, unlike the stricter min(1) required
      // when creating the session itself).
      for (const ex of plan.exercises) {
        await addExercise.mutateAsync({
          sessionId: session.id,
          exerciseName: ex.name,
        });
      }

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

    // Group the flat log of individual sets back into
    // { exerciseName, sets: [...] } shape the API expects.
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
        <StatusBar barStyle="light-content" />
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
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
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Reveal delay={0}>
          <WorkoutTabHeader
            name="James"
            avatarUrl="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80"
            onPressBell={() => {}}
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

        {!isLoading && !error && !todaysWorkout && (
          <View style={s.centerState}>
            <Text style={s.emptyTitle}>No plan yet</Text>
            <Text style={s.emptySubtitle}>
              Finish onboarding to get a personalized training split.
            </Text>
          </View>
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
              <Pressable onPress={() => setView("fullPlan")} hitSlop={8}>
                <Text style={s.seeFullPlanText}>See full plan →</Text>
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
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 128 },
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
  emptyTitle: { color: T.text, fontSize: 15, fontWeight: "700" },
  emptySubtitle: { color: T.faint, fontSize: 12, textAlign: "center" },
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
});
