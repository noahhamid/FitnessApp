// src/features/nutrition/types/weight.types.ts

export type WeightLogEntry = {
  id: string;
  user_id: string;
  log_date: string;
  weight: number;
};

export type WeightGoalRecord = {
  id: string;
  user_id: string;
  goal_weight: number;
  start_weight: number;
  updated_at: string;
};

/** Chart/history point shape consumed by WeightSection mock imports. */
export type WeightChartPoint = {
  date: string;
  w: number;
};
