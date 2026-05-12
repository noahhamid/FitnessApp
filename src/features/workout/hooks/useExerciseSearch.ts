import { useMemo, useState } from "react";
import { EXERCISES } from "@/src/features/workout/services/workout.service";

export function useExerciseSearch() {
  const [q, setQ] = useState("");
  const results = useMemo(
    () => EXERCISES.filter((e) => e.name.toLowerCase().includes(q.toLowerCase())),
    [q]
  );
  return { q, setQ, results };
}
