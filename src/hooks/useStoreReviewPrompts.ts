import { useCallback, useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { maybePromptYearlyReview } from "@/src/lib/store-review";

/**
 * After onboarding, ask for an in-app review up to twice a year on a
 * random schedule when the app is opened or returns to the foreground.
 */
export function useStoreReviewPrompts(enabled: boolean) {
  const running = useRef(false);

  const run = useCallback(async () => {
    if (!enabled || running.current) return;
    running.current = true;
    try {
      await maybePromptYearlyReview();
    } finally {
      running.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    void run();

    const onChange = (next: AppStateStatus) => {
      if (next === "active") void run();
    };
    const sub = AppState.addEventListener("change", onChange);
    return () => sub.remove();
  }, [enabled, run]);
}
