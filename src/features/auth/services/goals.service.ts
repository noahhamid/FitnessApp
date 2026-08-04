import { useAuthStore } from "../hooks/useAuth";

export type GoalId = "lose" | "build" | "endure" | "health";

/** Display labels — same copy as onboarding GoalsForm titles. */
export const GOAL_LABELS: Record<GoalId, string> = {
  lose: "Lose Fat",
  build: "Build Muscle",
  endure: "Build Endurance",
  health: "Stay Healthy",
};

export function goalLabel(goalId: string | null | undefined): string {
  if (!goalId) return "Your plan";
  return GOAL_LABELS[goalId as GoalId] ?? goalId;
}

export async function upsertUserGoal(goal: GoalId): Promise<void> {
  useAuthStore.getState().setGoalId(goal);
}

export async function fetchUserGoal(): Promise<GoalId | null> {
  const goalId = useAuthStore.getState().goalId;
  if (!goalId) return null;
  return goalId as GoalId;
}
