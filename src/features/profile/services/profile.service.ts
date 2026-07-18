import { api } from "@/src/lib/api";

export type Gender = "male" | "female";
export type ExperienceLevel = "novice" | "intermediate" | "advanced";
export type EquipmentAccess = "full_gym" | "home_dumbbells" | "bodyweight";

export type UserProfile = {
  id: string;
  userId: string;
  goalId: string | null;
  gender: Gender | null;
  weightKg: number | null;
  heightCm: number | null;
  age: number | null;
  daysPerWeek: number | null;
  experience: ExperienceLevel | null;
  equipment: EquipmentAccess | null;
  updatedAt: string;
};

export async function fetchUserProfile() {
  return api.get<UserProfile | null>("/api/profile");
}

export async function saveUserProfile(data: {
  name?: string;
  goalId?: string;
  gender?: Gender;
  weightKg?: number;
  heightCm?: number;
  age?: number;
  daysPerWeek?: number;
  experience?: ExperienceLevel;
  equipment?: EquipmentAccess;
}) {
  return api.put<UserProfile>("/api/profile", data);
}