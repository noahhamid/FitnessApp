import { api } from "@/src/lib/api";

export type UserProfile = {
  id: string;
  userId: string;
  goalId: string | null;
  weightKg: number | null;
  heightCm: number | null;
  age: number | null;
  updatedAt: string;
};

export async function fetchUserProfile() {
  return api.get<UserProfile | null>("/api/profile");
}

export async function saveUserProfile(data: {
  name?: string;
  goalId?: string;
  weightKg?: number;
  heightCm?: number;
  age?: number;
}) {
  return api.put<UserProfile>("/api/profile", data);
}
