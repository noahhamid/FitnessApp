import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserGoal, upsertUserGoal } from "../services/goals.service";

export function useUserGoal() {
  return useQuery({
    queryKey: ["user", "goal"],
    queryFn: fetchUserGoal,
  });
}

export function useSaveGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertUserGoal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user", "goal"] }),
  });
}
