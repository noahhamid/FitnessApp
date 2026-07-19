import React, { useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  StyleSheet,
  Animated,
  ActivityIndicator,
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
import { useWorkoutPlan } from "../hooks/useWorkoutPlan";
import { useLastPerformance } from "../hooks/useLastPerformance";
import { adaptPlanDay } from "../lib/workout-plan-adapter";
import {
  useStartWorkoutSession,
  useCompleteWorkoutSession,
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

type ViewState = "list" | "detail" | "active";

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
  // Exercise names double as a rough muscle-group hint since the adapter
  // doesn't currently expose muscleGroup on the UI Exercise type — good
  // enough for a card subtitle without threading another field through.
  const first = plan.exercises.slice(0, 3).map((e) => e.name.split(" ")[0]);
  return first.join(" / ");
}

export default function WorkoutScreen() {
  const [view, setView] = useState<ViewState>("list");
  const [selectedDay, setSelectedDay] = useState<WorkoutPlan | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const { data: apiPlan, isLoading, error } = useWorkoutPlan();
  const { data: lastPerformance } = useLastPerformance();
  const startSession = useStartWorkoutSession();
  const completeSession = useCompleteWorkoutSession();

  const uiDays: WorkoutPlan[] = useMemo(() => {
    if (!apiPlan) return [];
    return apiPlan.days.map((day) => adaptPlanDay(day, apiPlan.goalId));
  }, [apiPlan]);

  const handleCardPress = (plan: WorkoutPlan) => {
    setSelectedDay(plan);
    setView("detail");
  };

  const handleStart = async () => {
    if (!selectedDay) return;
    try {
      const session = await startSession.mutateAsync({
        notes: `${apiPlan?.splitLabel ?? "Workout"} — ${selectedDay.title}`,
        exercises: selectedDay.exercises.map((ex) => ({
          exerciseName: ex.name,
          sets: [],
        })),
      });
      setActiveSessionId(session.id);
      setView("active");
    } catch (e) {
      console.log("Failed to start workout session:", e);
    }
  };

  const handleFinish = async (logs: SetLog[]) => {
    if (!activeSessionId) {
      setView("list");
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

    setView("list");
    setSelectedDay(null);
    setActiveSessionId(null);
  };

  // ── Detail screen ─────────────────────────────────────────────────────────
  if (view === "detail" && selectedDay) {
    return (
      <WorkoutDetailScreen
        plan={selectedDay}
        onBack={() => {
          setView("list");
          setSelectedDay(null);
        }}
        onStart={handleStart}
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

  // ── List screen ───────────────────────────────────────────────────────────
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

        <Reveal delay={140}>
          <Text style={s.sectionTitle}>Your plan</Text>
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

        {!isLoading && !error && uiDays.length === 0 && (
          <View style={s.centerState}>
            <Text style={s.emptyTitle}>No plan yet</Text>
            <Text style={s.emptySubtitle}>
              Finish onboarding to get a personalized training split.
            </Text>
          </View>
        )}

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
            onPress={() => handleCardPress(plan)}
          />
        ))}
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
});
