import { create } from "zustand";

type FocusState = {
  blockedAppCount: number;
  setBlockedAppCount: (n: number) => void;
};

export const useFocusStore = create<FocusState>((set) => ({
  blockedAppCount: 0,
  setBlockedAppCount: (blockedAppCount) => set({ blockedAppCount }),
}));
