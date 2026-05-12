import { create } from "zustand";

type NutritionState = {
  dailyCalorieGoal: number;
  setDailyCalorieGoal: (n: number) => void;
};

export const useNutritionStore = create<NutritionState>((set) => ({
  dailyCalorieGoal: 2400,
  setDailyCalorieGoal: (dailyCalorieGoal) => set({ dailyCalorieGoal }),
}));
