/** Store subscription IDs — create matching products in ASC / Play Console. */
export const PREMIUM_MONTHLY_SKU = "com.exo.fitness.premium.monthly";
export const PREMIUM_ANNUAL_SKU = "com.exo.fitness.premium.annual";

export const PREMIUM_SKUS = [PREMIUM_MONTHLY_SKU, PREMIUM_ANNUAL_SKU] as const;

export type PremiumSku = (typeof PREMIUM_SKUS)[number];

export function isPremiumSku(id: string): id is PremiumSku {
  return (PREMIUM_SKUS as readonly string[]).includes(id);
}

export const SKU_LABEL: Record<PremiumSku, string> = {
  [PREMIUM_MONTHLY_SKU]: "Monthly",
  [PREMIUM_ANNUAL_SKU]: "Annual",
};
