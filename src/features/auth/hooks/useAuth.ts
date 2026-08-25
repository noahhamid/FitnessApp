// src/features/auth/hooks/useAuth.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { authClient } from "@/src/lib/auth";
import { invalidateAuthHeaderCache } from "@/src/lib/api";
import {
  signIn,
  signUp,
  signOut,
  signInWithGoogle,
  signInWithApple,
  getSession,
  deleteAccount,
} from "../services/auth.service";

// ── Auth Store (replaces missing authStore.ts) ────────────────────────────────
// Kept here since you don't have a separate authStore.ts yet.
// Move to src/features/auth/store/authStore.ts when you're ready.

type AuthStoreState = {
  onboarded: boolean;
  /** Soft paywall unlock — workouts stay locked until the offer is accepted. */
  premiumUnlocked: boolean;
  goalId: string | null;
  setOnboarded: (v: boolean) => void;
  setPremiumUnlocked: (v: boolean) => void;
  setGoalId: (id: string) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      onboarded: false,
      premiumUnlocked: false,
      goalId: null,
      setOnboarded: (v) => set({ onboarded: v }),
      setPremiumUnlocked: (v) => set({ premiumUnlocked: v }),
      setGoalId: (id) => set({ goalId: id }),
      reset: () =>
        set({ onboarded: false, premiumUnlocked: false, goalId: null }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// ── Session query key ─────────────────────────────────────────────────────────

const SESSION_KEY = ["auth", "session"] as const;

// ── useSession — reactive session from Better Auth ────────────────────────────

export function useAuthSession() {
  const { data: session, isPending, error } = authClient.useSession();
  return { session, isPending };
}

// ── useAuth — main hook (replaces old Supabase useAuth) ──────────────────────

export function useAuth() {
  const { session, isPending } = useAuthSession();
  const { onboarded, setOnboarded, premiumUnlocked, goalId, setGoalId } =
    useAuthStore();
  const queryClient = useQueryClient();

  const hasSession = !!session?.user;

  // Sync onboarding state from user metadata when session changes
  useEffect(() => {
    if (!session?.user) return;
    // Better Auth stores extra fields in user.metadata or via your DB
    // For now we rely on the local Zustand store for onboarding state
  }, [session]);

  return {
    hasSession,
    isPending,
    onboardingComplete: onboarded,
    premiumUnlocked,
    user: session?.user ?? null,
    goalId,
    setOnboarded,
    setGoalId,
  };
}

// ── Persist hydration — AsyncStorage is async; default onboarded is false ─────

export function useAuthStoreHydration(): boolean {
  const [ready, setReady] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setReady(true);
      return;
    }
    return useAuthStore.persist.onFinishHydration(() => {
      setReady(true);
    });
  }, []);

  return ready;
}

// ── useAuthHydration — wait for session AND persisted onboarding flags ─────────

export function useAuthHydration(): boolean {
  const { isPending } = useAuthSession();
  const storeReady = useAuthStoreHydration();
  return !isPending && storeReady;
}

// ── Mutation hooks ────────────────────────────────────────────────────────────

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signIn(email, password),
    onSuccess: () => {
      invalidateAuthHeaderCache();
      queryClient.invalidateQueries({ queryKey: SESSION_KEY });
    },
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      email,
      password,
      name,
    }: {
      email:     string;
      password:  string;
      name?:     string;
    }) => signUp(email, password, name),
    onSuccess: () => {
      invalidateAuthHeaderCache();
      queryClient.invalidateQueries({ queryKey: SESSION_KEY });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: async () => {
      invalidateAuthHeaderCache();
      queryClient.clear();
      await queryClient.resetQueries();
      useAuthStore.getState().reset();
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token?: string) => deleteAccount(token),
    onSuccess: async (result) => {
      if (!result.deleted) return;
      invalidateAuthHeaderCache();
      queryClient.clear();
      await queryClient.resetQueries();
      useAuthStore.getState().reset();
    },
  });
}

export function useGoogleSignIn() {
  return useMutation({
    mutationFn: signInWithGoogle,
    onSuccess: () => {
      invalidateAuthHeaderCache();
    },
  });
}

export function useAppleSignIn() {
  return useMutation({
    mutationFn: signInWithApple,
    onSuccess: () => {
      invalidateAuthHeaderCache();
    },
  });
}