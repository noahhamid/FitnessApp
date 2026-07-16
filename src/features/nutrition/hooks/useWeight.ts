// src/features/nutrition/hooks/useWeight.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteWeightEntry,
  deleteWeightGoal,
  fetchWeightGoal,
  fetchWeightLog,
  logWeightEntry,
  toWeightChartPoints,
  updateWeightEntry,
  upsertWeightGoal,
} from "../services/weight.service";
import type {
  WeightChartPoint,
  WeightGoalRecord,
  WeightLogEntry,
} from "../types/weight.types";


const KEYS = {
  log: ["weight", "log"] as const,
  goal: ["weight", "goal"] as const,
  chart: ["weight", "chart"] as const,
};

export function useWeightLog() {
  return useQuery<WeightLogEntry[]>({
    queryKey: KEYS.log,
    queryFn: fetchWeightLog,
  });
}

export function useWeightChart() {
  return useQuery<WeightChartPoint[]>({
    queryKey: KEYS.chart,
    queryFn: async () => toWeightChartPoints(await fetchWeightLog()),
  });
}

export function useWeightGoal() {
  return useQuery<WeightGoalRecord | null>({
    queryKey: KEYS.goal,
    queryFn: fetchWeightGoal,
  });
}

export function useLogWeight() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: logWeightEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.log });
      qc.invalidateQueries({ queryKey: KEYS.chart });
    },
  });
}

export function useUpdateWeightEntry() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      weight?: number;
      log_date?: string;
    }) => updateWeightEntry(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.log });
      qc.invalidateQueries({ queryKey: KEYS.chart });
    },
  });
}

export function useDeleteWeightEntry() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteWeightEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.log });
      qc.invalidateQueries({ queryKey: KEYS.chart });
    },
  });
}

export function useUpdateWeightGoal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: upsertWeightGoal,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.goal }),
  });
}

export function useDeleteWeightGoal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteWeightGoal,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.goal }),
  });
}
