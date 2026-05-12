import { useMemo, useState } from "react";
import { FOOD_SEARCH } from "@/src/features/nutrition/services/nutrition.service";

export function useFoodSearch() {
  const [q, setQ] = useState("");
  const results = useMemo(
    () => FOOD_SEARCH.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())),
    [q]
  );
  return { q, setQ, results };
}
