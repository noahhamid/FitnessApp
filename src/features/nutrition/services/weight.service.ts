// src/features/nutrition/services/weight.service.ts
import { api } from "@/src/lib/api";
import type {
  WeightChartPoint,
  WeightGoalRecord,
  WeightLogEntry,
} from "../types/weight.types";

type ApiWeightLog = {
  id: string;
  userId: string;
  logDate: string;
  weight: number;
};

type ApiWeightGoal = {
  id: string;
  userId: string;
  goalWeight: number;
  startWeight: number;
  updatedAt: string;
};

function formatDisplayDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toWeightLogEntry(row: ApiWeightLog): WeightLogEntry {
  return {
    id: row.id,
    user_id: row.userId,
    log_date: row.logDate,
    weight: Number(row.weight),
  };
}

function toWeightGoalRecord(row: ApiWeightGoal): WeightGoalRecord {
  return {
    id: row.id,
    user_id: row.userId,
    goal_weight: Number(row.goalWeight),
    start_weight: Number(row.startWeight),
    updated_at: row.updatedAt,
  };
}

/**
 * Converts raw weight-log rows into chart points with ONE point per calendar day.
 * When multiple entries share the same date, the LATEST logged weight is used.
 * This prevents duplicate X-axis labels and crowded charts.
 */
export function toWeightChartPoints(rows: WeightLogEntry[]): WeightChartPoint[] {
  // Sort chronologically so later entries overwrite earlier ones in the Map.
  const sorted = [...rows].sort((a, b) => a.log_date.localeCompare(b.log_date));

  const byDate = new Map<string, number>();
  for (const row of sorted) {
    byDate.set(row.log_date, row.weight); // last write wins → latest weight for that day
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([isoDate, weight]) => ({
      date: formatDisplayDate(isoDate),
      w: weight,
    }));
}

export async function fetchWeightLog(): Promise<WeightLogEntry[]> {
  const rows = await api.get<ApiWeightLog[]>("/api/weight/log");
  return rows.map(toWeightLogEntry);
}

export async function logWeightEntry(input: {
  weight: number;
  log_date?: string;
}): Promise<WeightLogEntry> {
  const row = await api.post<ApiWeightLog>("/api/weight/log", {
    weight: input.weight,
    ...(input.log_date ? { logDate: input.log_date } : {}),
  });
  return toWeightLogEntry(row);
}

export async function updateWeightEntry(
  id: string,
  input: { weight?: number; log_date?: string },
): Promise<WeightLogEntry> {
  const row = await api.patch<ApiWeightLog>(`/api/weight/log/${id}`, {
    ...(input.weight !== undefined ? { weight: input.weight } : {}),
    ...(input.log_date ? { logDate: input.log_date } : {}),
  });
  return toWeightLogEntry(row);
}

export async function deleteWeightEntry(id: string): Promise<void> {
  await api.delete<{ deleted: boolean }>(`/api/weight/log/${id}`);
}

export async function fetchWeightGoal(): Promise<WeightGoalRecord | null> {
  const row = await api.get<ApiWeightGoal | null>("/api/weight/goal");
  return row ? toWeightGoalRecord(row) : null;
}

export async function upsertWeightGoal(input: {
  goal_weight: number;
  start_weight: number;
}): Promise<WeightGoalRecord> {
  const row = await api.put<ApiWeightGoal>("/api/weight/goal", {
    goalWeight: input.goal_weight,
    startWeight: input.start_weight,
  });
  return toWeightGoalRecord(row);
}

export async function deleteWeightGoal(): Promise<void> {
  await api.delete<{ deleted: boolean }>("/api/weight/goal");
}
