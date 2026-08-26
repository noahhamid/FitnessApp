import { Platform } from "react-native";
import { api } from "@/src/lib/api";
import { isPremiumSku } from "./skus";

type StoreSubscription = {
  productId?: string;
  isActive?: boolean;
  transactionId?: string;
  expirationDateIOS?: number | null;
};

export async function syncEntitlement(
  subscriptions: readonly StoreSubscription[],
): Promise<void> {
  if (Platform.OS !== "ios" && Platform.OS !== "android") return;

  const payload = {
    platform: Platform.OS,
    subscriptions: subscriptions
      .filter((sub) => typeof sub.productId === "string" && isPremiumSku(sub.productId))
      .map((sub) => ({
        productId: sub.productId!,
        isActive: sub.isActive !== false,
        ...(sub.transactionId ? { transactionId: sub.transactionId } : {}),
        expiresAt:
          typeof sub.expirationDateIOS === "number"
            ? new Date(sub.expirationDateIOS).toISOString()
            : null,
      })),
  };

  await api.post("/api/billing/sync", payload);
}
