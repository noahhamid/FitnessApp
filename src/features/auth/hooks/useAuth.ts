// src/features/auth/hooks/useAuth.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { authClient } from "@/src/lib/auth";
import {
  signIn,
  signUp,
  signOut,
  signInWithGoogle,
  signInWithApple,
  getSession,
} from "../services/auth.service";

// ── Auth Store (replaces missing authStore.ts) ────────────────────────────────
// Kept here since you don't have a separate authStore.ts yet.
// Move to src/features/auth/store/authStore.ts when you're ready.

type AuthStoreState = {
  onboarded:    boolean;
  goalId:       string | null;
  setOnboarded: (v: boolean) => void;
  setGoalId:    (id: string) => void;
  reset:        () => void;
};

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      onboarded:    false,
      goalId:       null,
      setOnboarded: (v) => set({ onboarded: v }),
      setGoalId:    (id) => set({ goalId: id }),
      reset:        () => set({ onboarded: false, goalId: null }),
    }),
    {
      name:    "auth-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ── Session query key ─────────────────────────────────────────────────────────

const SESSION_KEY = ["auth", "session"] as const;

// ── useSession — reactive session from Better Auth ────────────────────────────

export function useAuthSession() {
  // Better Auth's built-in reactive hook
  const { data: session, isPending } = authClient.useSession();
  return { session, isPending };
}

// ── useAuth — main hook (replaces old Supabase useAuth) ──────────────────────

export function useAuth() {
  const { session, isPending } = useAuthSession();
  const { onboarded, setOnboarded, goalId, setGoalId } = useAuthStore();
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
    user:               session?.user ?? null,
    goalId,
    setOnboarded,
    setGoalId,
  };
}

// ── useAuthHydration — was used in _layout to wait for session ────────────────

export function useAuthHydration(): boolean {
  const { isPending } = useAuthSession();
  return !isPending;
}

// ── Mutation hooks ────────────────────────────────────────────────────────────

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signIn(email, password),
    onSuccess: () => {
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
      queryClient.invalidateQueries({ queryKey: SESSION_KEY });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const { reset }   = useAuthStore();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      reset();
      queryClient.clear();
    },
  });
}

export function useGoogleSignIn() {
  return useMutation({ mutationFn: signInWithGoogle });
}

export function useAppleSignIn() {
  return useMutation({ mutationFn: signInWithApple });
}