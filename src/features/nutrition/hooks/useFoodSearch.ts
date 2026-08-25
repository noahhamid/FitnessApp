import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCustomFood,
  searchFoods,
} from "@/src/features/nutrition/services/nutrition.service";
import type { FoodLibraryItem } from "../types/nutrition.types";

function useDebouncedValue(value: string, ms = 220) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [ms, value]);
  return debounced;
}

export function useFoodSearch(query: string) {
  const trimmed = query.trim();
  const debounced = useDebouncedValue(trimmed);

  const search = useQuery({
    queryKey: ["nutrition", "food-search", debounced.toLowerCase()],
    queryFn: () => searchFoods(debounced),
    enabled: debounced.length >= 2,
  });

  return {
    results: search.data ?? [],
    isSearching: search.isFetching && debounced.length >= 2,
  };
}

export function useAddCustomFood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (food: Omit<FoodLibraryItem, "id" | "user_id" | "created_at">) =>
      addCustomFood(food),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nutrition", "food-search"] });
    },
  });
}
