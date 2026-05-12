import { useState } from "react";

export function useActiveWorkout() {
  const [active, setActive] = useState(false);
  return { active, setActive };
}
