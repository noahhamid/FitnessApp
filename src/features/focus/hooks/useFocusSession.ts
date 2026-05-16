// The honest version of your hook
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

export function useFocusSession() {
  const [minutes, setMinutes] = useState(25);
  const [active, setActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // Warn user when they leave the app during a session
  useEffect(() => {
    if (!active) return;

    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (
        appStateRef.current === "active" &&
        next.match(/inactive|background/)
      ) {
        // Fire a local notification nudging them back
        Notifications.scheduleNotificationAsync({
          content: {
            title: "🔒 Focus Mode Active",
            body: "You left during a session. Get back to work.",
          },
          trigger: null, // immediate
        });
      }
      appStateRef.current = next;
    });

    return () => sub.remove();
  }, [active]);

  // Elapsed counter
  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [active]);

  const start = useCallback(() => {
    setElapsed(0);
    setActive(true);
  }, []);

  const stop = useCallback(() => setActive(false), []);

  const remaining = minutes * 60 - elapsed;

  return { minutes, setMinutes, active, elapsed, remaining, start, stop };
}
