import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";
import type {
  EquipmentAccess,
  ExperienceLevel,
} from "@/src/features/profile/services/profile.service";

type IconName = ComponentProps<typeof Ionicons>["name"];

export const PROFILE_GOALS = [
  { id: "lose", label: "Lose Weight", icon: "trending-down-outline" as IconName },
  { id: "build", label: "Build Muscle", icon: "barbell-outline" as IconName },
  { id: "endure", label: "Endurance", icon: "heart-outline" as IconName },
  { id: "health", label: "Stay Healthy", icon: "leaf-outline" as IconName },
] as const;

export type ProfileGoalId = (typeof PROFILE_GOALS)[number]["id"];

export const PROFILE_EXPERIENCE_OPTIONS: {
  id: ExperienceLevel;
  label: string;
}[] = [
  { id: "novice", label: "Novice" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

export const PROFILE_EQUIPMENT_OPTIONS: {
  id: EquipmentAccess;
  label: string;
}[] = [
  { id: "full_gym", label: "Full Gym" },
  { id: "home_dumbbells", label: "Home / Dumbbells" },
  { id: "bodyweight", label: "Bodyweight Only" },
];

export function parsePositiveNumber(value: string): number | null {
  const parsed = Number(value.trim().replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export function isProfileGoalId(value: unknown): value is ProfileGoalId {
  return (
    value === "lose" ||
    value === "build" ||
    value === "endure" ||
    value === "health"
  );
}
