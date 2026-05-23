// src/features/auth/services/auth.service.ts

import { authClient } from "@/src/lib/auth";

// ── Sign in ───────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await authClient.signIn.email({ email, password });
  if (error) throw new Error(error.message);
}

// ── Sign up ───────────────────────────────────────────────────────────────────

export async function signUp(
  email:    string,
  password: string,
  name?:    string
): Promise<void> {
  const { error } = await authClient.signUp.email({
    email,
    password,
    name: name ?? email.split("@")[0],
  });
  if (error) throw new Error(error.message);
}

// ── OAuth ─────────────────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<void> {
  const { error } = await authClient.signIn.social({ provider: "google" });
  if (error) throw new Error(error.message);
}

export async function signInWithApple(): Promise<void> {
  const { error } = await authClient.signIn.social({ provider: "apple" });
  if (error) throw new Error(error.message);
}

// ── Sign out ──────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const { error } = await authClient.signOut();
  if (error) throw new Error(error.message);
}

// ── Get current session ───────────────────────────────────────────────────────

export async function getSession() {
  const { data } = await authClient.getSession();
  return data;
}