import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getAuthSnapshot,
  hydrateAuth,
  subscribeAuth,
  type AuthSnapshot,
} from "@/src/features/auth/store/authStore";

export function useAuth() {
  const snapshot = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthSnapshot);
  return snapshot;
}

export function useAuthHydration() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    hydrateAuth().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}

export type { AuthSnapshot };
