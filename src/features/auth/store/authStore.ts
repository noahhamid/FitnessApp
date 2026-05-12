import { storage } from "@/src/utils/storage";

const STORAGE_KEY = "pp_auth_v1";

export type AuthSnapshot = {
  hydrated: boolean;
  /** User finished onboarding flow */
  onboardingComplete: boolean;
  /** Signed in (or guest access after onboarding) */
  hasSession: boolean;
};

type Persisted = {
  onboardingComplete: boolean;
  hasSession: boolean;
};

let snapshot: AuthSnapshot = {
  hydrated: false,
  onboardingComplete: false,
  hasSession: false,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function getAuthSnapshot(): AuthSnapshot {
  return snapshot;
}

export function subscribeAuth(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function hydrateAuth(): Promise<void> {
  const raw = await storage.getString(STORAGE_KEY);
  if (raw) {
    try {
      const p = JSON.parse(raw) as Persisted;
      snapshot = {
        hydrated: true,
        onboardingComplete: !!p.onboardingComplete,
        hasSession: !!p.hasSession,
      };
    } catch {
      snapshot = { hydrated: true, onboardingComplete: false, hasSession: false };
    }
  } else {
    snapshot = { ...snapshot, hydrated: true };
  }
  notify();
}

async function persist() {
  const body: Persisted = {
    onboardingComplete: snapshot.onboardingComplete,
    hasSession: snapshot.hasSession,
  };
  await storage.setString(STORAGE_KEY, JSON.stringify(body));
}

export async function setOnboardingComplete(complete: boolean) {
  snapshot = { ...snapshot, onboardingComplete: complete };
  await persist();
  notify();
}

export async function setSession(active: boolean) {
  snapshot = { ...snapshot, hasSession: active };
  await persist();
  notify();
}

export async function signOut() {
  snapshot = { ...snapshot, hasSession: false, onboardingComplete: false };
  await storage.remove(STORAGE_KEY);
  notify();
}

/** Dev / email flow: mark user as authenticated */
export async function signInDemo() {
  snapshot = { ...snapshot, hasSession: true };
  await persist();
  notify();
}
