import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchProfile,
    upsertProfile
} from "../services/profile.service";

export function useProfile() {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: fetchProfile,
  });
}

export function useSaveProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user", "profile"] }),
  });
}
