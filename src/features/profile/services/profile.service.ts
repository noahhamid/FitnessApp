import { api } from "@/src/lib/api";

export type Gender = "male" | "female";
export type ExperienceLevel = "novice" | "intermediate" | "advanced";
export type EquipmentAccess = "full_gym" | "home_dumbbells" | "bodyweight";
export type Pace = "slow" | "moderate" | "aggressive";

export type UserProfile = {
  id: string;
  userId: string;
  goalId: string | null;
  goalDetail: string | null;
  gender: Gender | null;
  weightKg: number | null;
  targetWeightKg: number | null;
  pace: Pace | null;
  heightCm: number | null;
  age: number | null;
  daysPerWeek: number | null;
  experience: ExperienceLevel | null;
  equipment: EquipmentAccess | null;
  trainingDays: number[];
  focusAreas: string[];
  bodyIssues: string[];
  injuries: string[];
  reminderEnabled: boolean | null;
  reminderHour: number | null;
  updatedAt: string;
};

export async function fetchUserProfile() {
  return api.get<UserProfile | null>("/api/profile");
}

export async function saveUserProfile(data: {
  name?: string;
  goalId?: string;
  goalDetail?: string;
  gender?: Gender;
  weightKg?: number;
  targetWeightKg?: number;
  pace?: Pace;
  heightCm?: number;
  age?: number;
  daysPerWeek?: number;
  /** Monday-indexed weekdays (0=Mon … 6=Sun); [] restores the default pattern. */
  trainingDays?: number[];
  experience?: ExperienceLevel;
  equipment?: EquipmentAccess;
  focusAreas?: string[];
  bodyIssues?: string[];
  injuries?: string[];
  reminderEnabled?: boolean;
  reminderHour?: number;
}) {
  return api.put<UserProfile>("/api/profile", data);
}