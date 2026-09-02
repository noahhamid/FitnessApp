import {
  PREMIUM_ANNUAL_SKU,
  PREMIUM_MONTHLY_SKU,
} from "@/src/lib/brand";

export { PREMIUM_ANNUAL_SKU, PREMIUM_MONTHLY_SKU };

/** Store subscription IDs — must match App Store Connect / Play Console exactly. */
export const PREMIUM_SKUS = [PREMIUM_MONTHLY_SKU, PREMIUM_ANNUAL_SKU] as const;

export type PremiumSku = (typeof PREMIUM_SKUS)[number];

export function isPremiumSku(id: string): id is PremiumSku {
  return (PREMIUM_SKUS as readonly string[]).includes(id);
}

export const SKU_LABEL: Record<PremiumSku, string> = {
  [PREMIUM_MONTHLY_SKU]: "Monthly",
  [PREMIUM_ANNUAL_SKU]: "Annual",
};
