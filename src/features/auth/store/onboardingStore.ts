import { create } from "zustand";

export type Gender = "male" | "female" | "other";
export type Goal = "lose" | "build" | "endure" | "health";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "veryActive";
export type FitnessLevel = "beginner" | "intermediate" | "advanced";

type OnboardingData = {
  // Step 1
  gender: Gender | null;
  
  // Step 2
  goal: Goal | null;
  
  // Step 3
  age: number | null;
  
  // Step 4
  heightCm: number | null;
  heightUnit: "cm" | "ft";
  
  // Step 5
  activityLevel: ActivityLevel | null;
  
  // Step 6
  fitnessLevel: FitnessLevel | null;
  
  // Step 7
  weightKg: number | null;
  weightUnit: "kg" | "lbs";
};

type OnboardingStore = OnboardingData & {
  setGender: (gender: Gender) => void;
  setGoal: (goal: Goal) => void;
  setAge: (age: number) => void;
  setHeight: (heightCm: number, unit: "cm" | "ft") => void;
  setActivityLevel: (level: ActivityLevel) => void;
  setFitnessLevel: (level: FitnessLevel) => void;
  setWeight: (weightKg: number, unit: "kg" | "lbs") => void;
  reset: () => void;
};

const initialState: OnboardingData = {
  gender: null,
  goal: null,
  age: null,
  heightCm: null,
  heightUnit: "cm",
  activityLevel: null,
  fitnessLevel: null,
  weightKg: null,
  weightUnit: "kg",
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  ...initialState,
  
  setGender: (gender) => set({ gender }),
  setGoal: (goal) => set({ goal }),
  setAge: (age) => set({ age }),
  setHeight: (heightCm, heightUnit) => set({ heightCm, heightUnit }),
  setActivityLevel: (activityLevel) => set({ activityLevel }),
  setFitnessLevel: (fitnessLevel) => set({ fitnessLevel }),
  setWeight: (weightKg, weightUnit) => set({ weightKg, weightUnit }),
  reset: () => set(initialState),
}));
