import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, StatusBar, StyleSheet } from "react-native";

import ActivityHeader, { CalendarDay } from "../components/ActivityHeader";
import TodaysChallengeCard from "../components/TodaysChallengeCard";
import { WorkoutHeroCard } from "../components/WorkoutHeroCard";
import { NutritionCard } from "../components/NutritionCard";
import { PressableScale } from "../../nutrition/components/PressableScale"; // adjust path to wherever you land the shared components

// ─── Theme tokens ────────────────────────────────────────────────────────────
// Same tokens as WorkoutPlanCard / MealScreen — this is the one that should
// get hoisted into a real shared theme.ts first, since it's now identical
// across three screens.
const T = {
  bg: "#111318",
  glass: "rgba(255,255,255,0.08)",
  glassBorder: "rgba(255,255,255,0.14)",
  ringGlass: "rgba(10,11,14,0.42)",
  ringBorder: "rgba(255,199,0,0.65)",
  accent: "#FFC700",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.7)",

  display: "SpaceGrotesk_700Bold",
  bodyMed: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
};

// ─── Types ───────────────────────────────────────────────────────────────────

type Category =
  | "All"
  | "Strength"
  | "Cardio"
  | "HIIT"
  | "Chest"
  | "Back"
  | "Arms"
  | "Legs"
  | "Core"
  | "Yoga";

interface Workout {
  id: string;
  title: string;
  tag: string;
  calories: number;
  minutes: number;
  imageUrl: string;
  categories: Category[]; // a workout can belong to more than one filter
}

// ─── Workout library ─────────────────────────────────────────────────────────
// Unchanged from your version — same ids, titles, images, categories.

const WORKOUTS: Workout[] = [
  {
    id: "bicep-curls",
    title: "Bicep Curls",
    tag: "Beginner friendly",
    calories: 180,
    minutes: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&q=80",
    categories: ["Strength", "Arms"],
  },
  {
    id: "bench-press",
    title: "Bench Press",
    tag: "Intermediate",
    calories: 260,
    minutes: 20,
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    categories: ["Strength", "Chest"],
  },
  {
    id: "deadlifts",
    title: "Deadlifts",
    tag: "Advanced",
    calories: 320,
    minutes: 25,
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
    categories: ["Strength", "Back", "Legs"],
  },
  {
    id: "squats",
    title: "Squats",
    tag: "Beginner friendly",
    calories: 240,
    minutes: 18,
    imageUrl:
      "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=600&q=80",
    categories: ["Strength", "Legs"],
  },
  {
    id: "running",
    title: "Running",
    tag: "Outdoor",
    calories: 350,
    minutes: 30,
    imageUrl:
      "https://images.unsplash.com/photo-1502224562085-639556652f33?w=600&q=80",
    categories: ["Cardio"],
  },
  {
    id: "cycling",
    title: "Cycling",
    tag: "Outdoor",
    calories: 400,
    minutes: 35,
    imageUrl:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80",
    categories: ["Cardio", "Legs"],
  },
  {
    id: "jump-rope",
    title: "Jump Rope",
    tag: "Fat burn",
    calories: 220,
    minutes: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1517344368193-41552b6ad3f5?w=600&q=80",
    categories: ["Cardio", "HIIT"],
  },
  {
    id: "burpees",
    title: "Burpees",
    tag: "High intensity",
    calories: 280,
    minutes: 10,
    imageUrl:
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&q=80",
    categories: ["HIIT", "Core"],
  },
  {
    id: "push-ups",
    title: "Push Ups",
    tag: "Bodyweight",
    calories: 150,
    minutes: 10,
    imageUrl:
      "https://images.unsplash.com/photo-1598971639058-fab3c3109a34?w=600&q=80",
    categories: ["Strength", "Chest", "Arms"],
  },
  {
    id: "pull-ups",
    title: "Pull Ups",
    tag: "Bodyweight",
    calories: 190,
    minutes: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=600&q=80",
    categories: ["Strength", "Back", "Arms"],
  },
  {
    id: "plank",
    title: "Plank Hold",
    tag: "Core stability",
    calories: 90,
    minutes: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1566241142248-38d0b3527c8e?w=600&q=80",
    categories: ["Core"],
  },
  {
    id: "yoga-flow",
    title: "Sun Salutation",
    tag: "Recovery",
    calories: 120,
    minutes: 20,
    imageUrl:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
    categories: ["Yoga"],
  },
];

const CATEGORIES: Category[] = [
  "All",
  "Strength",
  "Cardio",
  "HIIT",
  "Chest",
  "Back",
  "Arms",
  "Legs",
  "Core",
  "Yoga",
];

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const [selectedDate, setSelectedDate] = useState<number>(18);
  const [activeFilter, setActiveFilter] = useState<Category>("All");

  const calendarDays: CalendarDay[] = [
    { label: "M", date: 16 },
    { label: "T", date: 17 },
    { label: "W", date: 18 },
    { label: "T", date: 19 },
    { label: "F", date: 20 },
    { label: "S", date: 21 },
    { label: "S", date: 22 },
  ];

  const filteredWorkouts = useMemo(() => {
    if (activeFilter === "All") return WORKOUTS;
    return WORKOUTS.filter((w) => w.categories.includes(activeFilter));
  }, [activeFilter]);

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg} />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header + calendar strip */}
        <ActivityHeader
          monthLabel="May 2024"
          days={calendarDays}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onPressGrid={() => {}}
          onPrevMonth={() => {}}
          onNextMonth={() => {}}
        />

        {/* Today's Challenge hero card */}
        <View style={s.heroSpacing}>
          <TodaysChallengeCard
            title="Today's Challenge"
            subtitle="Do your plan before 9:00 AM"
            tag="Cardio"
            image={require("@/assets/images/shadow.png")}
            onPress={() => {}}
          />
        </View>

        {/* Category pill filter bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterRow}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeFilter === cat;
            return (
              <PressableScale
                key={cat}
                onPress={() => setActiveFilter(cat)}
                scaleTo={0.95}
                style={[
                  s.filterPill,
                  isActive ? s.filterPillActive : s.filterPillInactive,
                ]}
              >
                <Text style={[s.filterText, isActive && s.filterTextActive]}>
                  {cat}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>

        {/* Horizontal-scroll workout cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.workoutRow}
          style={s.heroSpacing}
        >
          {filteredWorkouts.map((w) => (
            <WorkoutHeroCard
              key={w.id}
              title={w.title}
              tag={w.tag}
              calories={w.calories}
              minutes={w.minutes}
              imageUrl={w.imageUrl}
              compact
              onPress={() => {}}
            />
          ))}
        </ScrollView>

        <NutritionCard target={1200} burned={328} remaining={872} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: T.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 128,
  },

  heroSpacing: {
    marginBottom: 24,
  },

  // Category pill row — glass inactive, solid gold active (same language as
  // LogActionsRow's primary button)
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
    paddingRight: 20, // so last pill isn't clipped
  },
  filterPill: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
  },
  filterPillActive: {
    backgroundColor: T.accent,
    borderColor: T.accent,
  },
  filterPillInactive: {
    backgroundColor: T.glass,
    borderColor: T.glassBorder,
  },
  filterText: {
    fontFamily: T.bodySemi,
    color: T.white,
    fontSize: 13,
  },
  filterTextActive: {
    fontFamily: T.bodyBold,
    color: T.bg,
  },

  // Horizontal workout row
  workoutRow: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 20,
  },
});
