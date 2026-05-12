import { useState, useCallback } from "react";

export function useFocusSession() {
  const [minutes, setMinutes] = useState(25);
  const [active, setActive] = useState(false);
  const start = useCallback(() => setActive(true), []);
  const stop = useCallback(() => setActive(false), []);
  return { minutes, setMinutes, active, start, stop };
}
