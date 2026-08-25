import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ErrorCode, useIAP, type ProductSubscription } from "expo-iap";
import { IapContext, type IapContextValue, type StoreProduct } from "./IapContext";
import {
  PREMIUM_ANNUAL_SKU,
  PREMIUM_SKUS,
  isPremiumSku,
  type PremiumSku,
} from "./skus";

function toStoreProduct(product: ProductSubscription): StoreProduct {
  return {
    id: product.id,
    title: product.title,
    displayPrice: product.displayPrice,
  };
}

function googleOffers(product: ProductSubscription | undefined, sku: string) {
  return (
    product?.subscriptionOffers
      ?.filter((offer) => offer.offerTokenAndroid)
      .map((offer) => ({
        sku,
        offerToken: offer.offerTokenAndroid!,
      })) ?? []
  );
}

export function IapProvider({ children }: { children: ReactNode }) {
  const [selectedSku, setSelectedSku] = useState<PremiumSku>(PREMIUM_ANNUAL_SKU);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const purchaseWaiter = useRef<((ok: boolean) => void) | null>(null);

  const resolvePurchase = useCallback((ok: boolean) => {
    purchaseWaiter.current?.(ok);
    purchaseWaiter.current = null;
  }, []);

  const {
    connected,
    subscriptions,
    activeSubscriptions,
    fetchProducts,
    requestPurchase,
    finishTransaction,
    getActiveSubscriptions,
    hasActiveSubscriptions,
    restorePurchases,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      try {
        await finishTransaction({ purchase, isConsumable: false });
      } catch {
        // Already finished or store will retry.
      }
      try {
        await getActiveSubscriptions([...PREMIUM_SKUS]);
      } catch {
        // Entitlement refresh is best-effort; listener already granted.
      }
      setPurchasing(false);
      setError(null);
      resolvePurchase(true);
    },
    onPurchaseError: (purchaseError) => {
      setPurchasing(false);
      if (purchaseError.code === ErrorCode.UserCancelled) {
        resolvePurchase(false);
        return;
      }
      if (purchaseError.code === ErrorCode.AlreadyOwned) {
        void getActiveSubscriptions([...PREMIUM_SKUS]);
        setError(null);
        resolvePurchase(true);
        return;
      }
      setError(purchaseError.message || "Purchase failed. Try again.");
      resolvePurchase(false);
    },
  });

  useEffect(() => {
    if (!connected) return;
    void fetchProducts({ skus: [...PREMIUM_SKUS], type: "subs" });
    void getActiveSubscriptions([...PREMIUM_SKUS]);
  }, [connected, fetchProducts, getActiveSubscriptions]);

  const products = useMemo(
    () =>
      subscriptions
        .filter((product) => isPremiumSku(product.id))
        .map(toStoreProduct),
    [subscriptions],
  );

  const isPremium = useMemo(
    () =>
      activeSubscriptions.some((sub) => {
        const id =
          "productId" in sub && typeof sub.productId === "string"
            ? sub.productId
            : "";
        return isPremiumSku(id) && sub.isActive !== false;
      }),
    [activeSubscriptions],
  );

  const refresh = useCallback(async () => {
    if (!connected) return;
    await getActiveSubscriptions([...PREMIUM_SKUS]);
  }, [connected, getActiveSubscriptions]);

  const purchase = useCallback(
    async (sku?: PremiumSku) => {
      const target = sku ?? selectedSku;
      if (!connected) {
        setError("Store isn’t ready yet. Try again in a moment.");
        return false;
      }
      setPurchasing(true);
      setError(null);
      const product = subscriptions.find((item) => item.id === target);
      try {
        const wait = new Promise<boolean>((resolve) => {
          purchaseWaiter.current = resolve;
        });
        await requestPurchase({
          request: {
            apple: { sku: target },
            google: {
              skus: [target],
              subscriptionOffers: googleOffers(product, target),
            },
          },
          type: "subs",
        });
        return await wait;
      } catch (err) {
        setPurchasing(false);
        const message =
          err instanceof Error ? err.message : "Purchase failed. Try again.";
        setError(message);
        resolvePurchase(false);
        return false;
      }
    },
    [connected, requestPurchase, resolvePurchase, selectedSku, subscriptions],
  );

  const restore = useCallback(async () => {
    if (!connected) {
      setError("Store isn’t ready yet. Try again in a moment.");
      return false;
    }
    setRestoring(true);
    setError(null);
    try {
      await restorePurchases();
      await getActiveSubscriptions([...PREMIUM_SKUS]);
      return await hasActiveSubscriptions([...PREMIUM_SKUS]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn’t restore purchases.",
      );
      return false;
    } finally {
      setRestoring(false);
    }
  }, [connected, getActiveSubscriptions, hasActiveSubscriptions, restorePurchases]);

  const value = useMemo<IapContextValue>(
    () => ({
      ready: connected,
      isPremium,
      products,
      selectedSku,
      setSelectedSku,
      purchasing,
      restoring,
      error,
      purchase,
      restore,
      refresh,
    }),
    [
      connected,
      error,
      isPremium,
      products,
      purchase,
      purchasing,
      refresh,
      restore,
      restoring,
      selectedSku,
    ],
  );

  return <IapContext.Provider value={value}>{children}</IapContext.Provider>;
}
