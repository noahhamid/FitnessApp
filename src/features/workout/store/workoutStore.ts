import { create } from "zustand";

type WorkoutState = {
  draftName: string;
  setDraftName: (n: string) => void;
};

export const useWorkoutStore = create<WorkoutState>((set) => ({
  draftName: "",
  setDraftName: (draftName) => set({ draftName }),
}));
