import { useAuthStore } from "../hooks/useAuth";

export type GoalId = "lose" | "build" | "endure" | "health";

export async function upsertUserGoal(goal: GoalId): Promise<void> {
  useAuthStore.getState().setGoalId(goal);
}

export async function fetchUserGoal(): Promise<GoalId | null> {
  const goalId = useAuthStore.getState().goalId;
  if (!goalId) return null;
  return goalId as GoalId;
}
