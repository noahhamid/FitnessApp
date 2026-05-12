import { useState, useEffect, useCallback } from "react";

export function useRestTimer(initialSeconds = 90) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const t = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [running, remaining]);

  const reset = useCallback((sec = initialSeconds) => {
    setRemaining(sec);
    setRunning(false);
  }, [initialSeconds]);

  return { remaining, running, setRunning, reset };
}
