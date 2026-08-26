import { isPremiumSku } from "@/src/features/billing/skus";
import { prisma } from "./prisma";

export type EntitlementRow = {
  isPremium: boolean;
  productId: string | null;
  platform: string | null;
  transactionId: string | null;
  expiresAt: Date | null;
};

export function isEntitlementActive(
  row: EntitlementRow | null | undefined,
): boolean {
  if (!row?.isPremium) return false;
  if (row.expiresAt && row.expiresAt.getTime() <= Date.now()) return false;
  return true;
}

export async function userHasPremium(userId: string): Promise<boolean> {
  const row = await prisma.userEntitlement.findUnique({
    where: { userId },
  });
  return isEntitlementActive(row);
}

export function pickActivePremium(input: {
  productId: string;
  isActive: boolean;
  transactionId?: string | null;
  expiresAt?: Date | null;
}): boolean {
  if (!input.isActive) return false;
  if (!isPremiumSku(input.productId)) return false;
  if (input.expiresAt && input.expiresAt.getTime() <= Date.now()) return false;
  return true;
}
