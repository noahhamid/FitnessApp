/**
 * Equipment tiers are ranked, not exact-matched. Someone with full_gym
 * access can perform anything tagged bodyweight, home_dumbbells, OR
 * full_gym. Someone with bodyweight-only access can only perform
 * exercises tagged bodyweight.
 */

export type EquipmentAccess = "bodyweight" | "home_dumbbells" | "full_gym";

export const EQUIPMENT_RANK: Record<EquipmentAccess, number> = {
  bodyweight: 0,
  home_dumbbells: 1,
  full_gym: 2,
};

/** Can a user with `userTier` access perform an exercise requiring `minRequired`? */
export function canPerform(
  userTier: EquipmentAccess,
  minRequired: EquipmentAccess,
): boolean {
  return EQUIPMENT_RANK[userTier] >= EQUIPMENT_RANK[minRequired];
}