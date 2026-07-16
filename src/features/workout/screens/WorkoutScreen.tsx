import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  StyleSheet,
  Animated,
  StyleProp,
  ViewStyle,
} from "react-native";

import { WorkoutTabHeader } from "../components/WorkoutTabHeader";
import { ContinueWorkoutCard } from "../components/ContinueWorkoutCard";
import { WorkoutPlanCard } from "../components/WorkoutPlanCard";
import { CategoryFilter, Category } from "../components/CategoryFilter";
import { WorkoutDetailScreen } from "../components/WorkoutDetailScreen";
import { ActiveWorkoutScreen } from "../components/ActiveWorkoutScreen";
import { WORKOUT_PLANS } from "../data/workouts";

const T = {
  bg: "#000000",
  text: "#FFFFFF",
  faint: "#9AA0AE",
};

type ViewState = "list" | "detail" | "active";

interface Plan {
  id: string;
  title: string;
  tag: string;
  minutes: number;
  calories: number;
  exerciseCount: number;
  muscles: string;
  imageUrl: string;
  accentColor: string;
  category: Category;
}

const PLANS: Plan[] = [
  {
    id: "lower-body",
    title: "Lower body workout",
    tag: "Cardio",
    minutes: 30,
    calories: 260,
    exerciseCount: 5,
    muscles: "Glutes / Squats / Hamstrings",
    imageUrl:
      "https://hips.hearstapps.com/hmg-prod/images/muscular-shirtless-man-exercising-with-weights-in-royalty-free-image-1700572250.jpg?crop=0.88847xw:1xh;center,top&resize=1200:*",
    accentColor: "#8B7FD1",
    category: "Lower body",
  },
  {
    id: "upper-body",
    title: "Upper body workout",
    tag: "Strength",
    minutes: 20,
    calories: 210,
    exerciseCount: 6,
    muscles: "Chest / Shoulders / Triceps",
    imageUrl:
      "https://i.pinimg.com/736x/22/72/88/2272887bd04a94150dc8f84bddd4d87a.jpg",
    accentColor: "#F45FA0",
    category: "Upper body",
  },
  {
    id: "full-body",
    title: "Full body burn",
    tag: "HIIT",
    minutes: 25,
    calories: 340,
    exerciseCount: 8,
    muscles: "Core / Legs / Arms",
    imageUrl:
      "https://muscleevo.net/wp-content/uploads/2020/08/full-body-workout.jpg",
    accentColor: "#FFA85C",
    category: "Full body",
  },
  {
    id: "core-blast",
    title: "Core blast",
    tag: "Core",
    minutes: 15,
    calories: 150,
    exerciseCount: 6,
    muscles: "Abs / Obliques / Lower back",
    imageUrl:
      "https://static1.squarespace.com/static/688fc73e20ffbd450fcb4753/6925b6378d5a3270d4a1bc30/6925fdd1bb9d4237255cc945/1764097529075/pexels-li-sun-2294363.jpg?format=1500w",
    accentColor: "#5FE3A1",
    category: "Core",
  },
  {
    id: "mobility-flow",
    title: "Mobility & stretch",
    tag: "Recovery",
    minutes: 18,
    calories: 95,
    exerciseCount: 7,
    muscles: "Hips / Spine / Shoulders",
    imageUrl:
      "https://www.getfitwithshiblin.com/wp-content/uploads/2023/03/Benefits-of-Stretching-And-Mobility-Exercises.jpg",
    accentColor: "#D4F445",
    category: "Mobility",
  },
];

const CATEGORIES: Category[] = [
  "All workouts",
  "Lower body",
  "Upper body",
  "Full body",
  "Core",
  "Mobility",
];

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

export default function WorkoutScreen() {
  const [view, setView] = useState<ViewState>("list");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] =
    useState<Category>("All workouts");

  const filteredPlans = useMemo(() => {
    if (activeCategory === "All workouts") return PLANS;
    return PLANS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const listOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    listOpacity.setValue(0);
    Animated.timing(listOpacity, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [activeCategory]);

  const handleCardPress = (planId: string) => {
    if (WORKOUT_PLANS[planId]) {
      setSelectedPlanId(planId);
      setView("detail");
    } else {
      // Bug fix: this used to fail completely silently, which is exactly
      // what looked like "clicking does nothing." Now it's at least visible
      // in the console so a missing WORKOUT_PLANS entry is easy to spot.
      console.warn(
        `[WorkoutScreen] No WORKOUT_PLANS entry for id "${planId}" — check data/workouts.ts`,
      );
    }
  };

  // ── Detail screen ─────────────────────────────────────────────────────────
  if (view === "detail" && selectedPlanId && WORKOUT_PLANS[selectedPlanId]) {
    return (
      <WorkoutDetailScreen
        plan={WORKOUT_PLANS[selectedPlanId]}
        onBack={() => {
          setView("list");
          setSelectedPlanId(null);
        }}
        onStart={() => setView("active")}
      />
    );
  }

  // ── Active workout screen ────────────────────────────────────────────────
  if (view === "active" && selectedPlanId && WORKOUT_PLANS[selectedPlanId]) {
    return (
      <ActiveWorkoutScreen
        plan={WORKOUT_PLANS[selectedPlanId]}
        onClose={() => setView("detail")}
        onFinish={() => {
          setView("list");
          setSelectedPlanId(null);
        }}
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

        <Reveal delay={80} style={s.heroSpacing}>
          <ContinueWorkoutCard
            title="Lower Body"
            tag="Cardio"
            minutes={10}
            calories={538}
            percent={72}
            onPress={() => handleCardPress("lower-body")}
          />
        </Reveal>

        <Reveal delay={160}>
          <Text style={s.sectionTitle}>Your plan</Text>
        </Reveal>

        <Reveal delay={200} style={{ marginBottom: 20 }}>
          <CategoryFilter
            categories={CATEGORIES}
            active={activeCategory}
            onChange={setActiveCategory}
          />
        </Reveal>

        {/* Bug fix: filtering into an empty category used to render nothing
            with no explanation — now shows a clear empty state instead. */}
        {filteredPlans.length === 0 ? (
          <Animated.View style={[s.emptyState, { opacity: listOpacity }]}>
            <Text style={s.emptyTitle}>No workouts here yet</Text>
            <Text style={s.emptySubtitle}>
              Try a different category to see more plans.
            </Text>
          </Animated.View>
        ) : (
          <Animated.View style={{ opacity: listOpacity }}>
            {filteredPlans.map((plan, i) => (
              // Card owns its own entrance animation (entranceDelay) now, so
              // it isn't double-wrapped in a second Reveal fade/slide.
              <WorkoutPlanCard
                key={plan.id}
                title={plan.title}
                tag={plan.tag}
                minutes={plan.minutes}
                exerciseCount={plan.exerciseCount}
                muscles={plan.muscles}
                imageUrl={plan.imageUrl}
                bgColor={plan.accentColor}
                entranceDelay={i * 60}
                onPress={() => handleCardPress(plan.id)}
              />
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 128 },
  heroSpacing: { marginBottom: 24 },
  sectionTitle: {
    color: T.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 14,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 6,
  },
  emptyTitle: { color: T.text, fontSize: 15, fontWeight: "700" },
  emptySubtitle: { color: T.faint, fontSize: 12, textAlign: "center" },
});
