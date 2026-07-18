import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  saveUserProfile,
  type EquipmentAccess,
  type ExperienceLevel,
} from "../services/profile.service";

export function useSaveTrainingSetup() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      daysPerWeek: number;
      experience: ExperienceLevel;
      equipment: EquipmentAccess;
    }) => saveUserProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}