import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

/**
 * Elapsed seconds from a wall-clock start, not a +1 ticker.
 * JS timers freeze in the background; this recomputes from timestamps
 * so time still advances with the screen off or the app backgrounded.
 */
export function useWallClockElapsed(
  startedAtMs: number | null,
  paused: boolean,
): number {
  const [, setTick] = useState(0);
  const pauseAccumMs = useRef(0);
  const pauseStartedAt = useRef<number | null>(null);
  const prevPaused = useRef(paused);
  const prevStart = useRef(startedAtMs);

  if (prevStart.current !== startedAtMs) {
    pauseAccumMs.current = 0;
    pauseStartedAt.current = paused ? Date.now() : null;
    prevPaused.current = paused;
    prevStart.current = startedAtMs;
  } else if (prevPaused.current !== paused) {
    if (paused) {
      pauseStartedAt.current = Date.now();
    } else if (pauseStartedAt.current != null) {
      pauseAccumMs.current += Date.now() - pauseStartedAt.current;
      pauseStartedAt.current = null;
    }
    prevPaused.current = paused;
  }

  useEffect(() => {
    if (startedAtMs == null || paused) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") setTick((n) => n + 1);
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [startedAtMs, paused]);

  if (startedAtMs == null) return 0;
  const end = pauseStartedAt.current ?? Date.now();
  return Math.max(
    0,
    Math.floor((end - startedAtMs - pauseAccumMs.current) / 1000),
  );
}
