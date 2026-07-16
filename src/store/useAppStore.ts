import { create } from 'zustand';

// Temporary mock store to provide data to your beautiful new dashboard UI
export const useAppStore = create((set) => ({
  // Header state
  user: {
    name: "Noah",
    avatarUrl: null
  },
  
  // Workout Section state
  currentWorkout: {
    name: "Full Body Foundation",
    level: "Beginner Friendly",
    duration: "45 min",
    exerciseCount: "6 Exercises"
  },
  
  // Nutrition Section state
  nutritionTotals: {
    calories: 1850,
    targetCalories: 2400,
    protein: 130,
    targetProtein: 160,
    carbs: 210,
    targetCarbs: 250,
    fat: 55,
    targetFat: 70
  },
  
  // Recent Logs feed state (Fixes the empty space!)
  recentLogs: [
    { id: '1', title: '🥞 Breakfast: Oats & Honey', details: '340 kcal • 45g Carbs' },
    { id: '2', title: '🍗 Lunch: Grilled Chicken Rice', details: '620 kcal • 55g Protein' },
    { id: '3', title: '🍌 Pre-Workout: Banana', details: '105 kcal • 27g Carbs' }
  ],
  
  // Action placeholders that your buttons call
  startActiveSession: () => {
    console.log("Workout session started!");
  },
  
  triggerAiScanner: () => {
    console.log("AI Scanner camera launched!");
  }
}));