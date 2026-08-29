import { Platform } from "react-native";
import { api } from "@/src/lib/api";
import { isPremiumSku } from "./skus";

export type BillingEntitlement = {
  isPremium: boolean;
  productId: string | null;
  platform: string | null;
  expiresAt: string | null;
};

export type StoreSubscription = {
  productId?: string;
  isActive?: boolean;
  transactionId?: string;
  purchaseToken?: string | null;
  purchaseTokenAndroid?: string | null;
  expirationDateIOS?: number | null;
};

function tokenOf(sub: StoreSubscription): string | undefined {
  const token = sub.purchaseToken || sub.purchaseTokenAndroid;
  return typeof token === "string" && token.length > 0 ? token : undefined;
}

export async function fetchEntitlement(): Promise<BillingEntitlement> {
  return api.get<BillingEntitlement>("/api/billing/me");
}

export async function syncEntitlement(
  subscriptions: readonly StoreSubscription[],
): Promise<BillingEntitlement> {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return {
      isPremium: false,
      productId: null,
      platform: null,
      expiresAt: null,
    };
  }

  const payload = {
    platform: Platform.OS,
    subscriptions: subscriptions
      .filter(
        (sub) =>
          typeof sub.productId === "string" && isPremiumSku(sub.productId),
      )
      .map((sub) => ({
        productId: sub.productId!,
        ...(tokenOf(sub) ? { purchaseToken: tokenOf(sub) } : {}),
        ...(sub.transactionId ? { transactionId: sub.transactionId } : {}),
      })),
  };

  return api.post<BillingEntitlement>("/api/billing/sync", payload);
}
