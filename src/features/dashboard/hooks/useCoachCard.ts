import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/src/lib/api";
import { useWeightLog } from "@/src/features/progress/hooks/useProgress";
import { useWorkoutPlan } from "@/src/features/workout/hooks/useWorkoutPlan";

function thirtyDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function startOfThisWeekMonday(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

const SPARK_HEIGHT = 26;

export function useCoachCard() {
  const { data: weightEntries, isLoading: weightLoading } = useWeightLog(thirtyDaysAgo());
  const { data: apiPlan } = useWorkoutPlan();

  const { data: recentSessions } = useQuery({
    queryKey: ["dashboard-coach", "sessions-this-week"],
    queryFn: () => api.get<{ completedAt: string | null }[]>("/api/workouts?completed=true&limit=30"),
  });

  const completedThisWeek = useMemo(() => {
    if (!recentSessions) return 0;
    const monday = startOfThisWeekMonday();
    return recentSessions.filter((s) => s.completedAt && new Date(s.completedAt) >= monday).length;
  }, [recentSessions]);

  const { sparklinePoints, progressValue, hasEnoughData } = useMemo(() => {
    if (!weightEntries || weightEntries.length < 2) {
      return { sparklinePoints: [], progressValue: "—", hasEnoughData: false };
    }

    const weights = weightEntries.map((e) => e.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const range = max - min || 1;

    // Inverted: heavier weight → larger y → LOWER on screen (SVG y grows
    // downward). Losing weight visually reads as the line trending up.
    const points = weights.map((w) => ((w - min) / range) * SPARK_HEIGHT);

    const delta = weights[weights.length - 1] - weights[0];
    const formattedDelta =
      delta === 0 ? "No change" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg`;

    return { sparklinePoints: points, progressValue: formattedDelta, hasEnoughData: true };
  }, [weightEntries]);

  const coach = useMemo(() => {
    const target = apiPlan?.daysPerWeek ?? 0;
    const remaining = Math.max(0, target - completedThisWeek);

    // Days left in the week (through Sunday) — determines "on pace" tone.
    const today = new Date();
    const dayIdx = (today.getDay() + 6) % 7; // Monday = 0
    const daysLeftInWeek = 6 - dayIdx;

    if (target === 0) {
      return {
        headline: "Complete onboarding to set a weekly training target.",
        body: "Once your plan is set, this card tracks your pace toward it.",
      };
    }

    if (remaining === 0) {
      return {
        headline: "You've hit your training goal this week 🎉",
        body: "Great consistency — keep the momentum into next week.",
      };
    }

    const onPace = daysLeftInWeek >= remaining;
    return {
      headline: `${remaining} more ${remaining === 1 ? "workout" : "workouts"} to hit your weekly goal.`,
      body: onPace
        ? "You're on pace — a session today keeps things on track."
        : "You're behind pace this week — worth fitting in an extra session if you can.",
    };
  }, [apiPlan?.daysPerWeek, completedThisWeek]);

  return {
    isLoading: weightLoading,
    hasEnoughData,
    progressValue,
    sparklinePoints,
    coachHeadline: coach.headline,
    coachBody: coach.body,
  };
}