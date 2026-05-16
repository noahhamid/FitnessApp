import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Session = {
  id: string;
  startedAt: number;
  durationMinutes: number;
  completed: boolean;
};

type FocusState = {
  sessions: Session[];
  blockedAppIds: string[];
  streak: number;

  // Actions
  addSession: (s: Session) => void;
  toggleAppBlock: (id: string) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
};

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      sessions: [],
      blockedAppIds: [],
      streak: 0,

      addSession: (session) => set({ sessions: [session, ...get().sessions] }),

      // This only tracks the user's intent — it doesn't enforce anything
      toggleAppBlock: (id) => {
        const current = get().blockedAppIds;
        set({
          blockedAppIds: current.includes(id)
            ? current.filter((a) => a !== id)
            : [...current, id],
        });
      },

      incrementStreak: () => set({ streak: get().streak + 1 }),
      resetStreak: () => set({ streak: 0 }),
    }),
    {
      name: "focus-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
