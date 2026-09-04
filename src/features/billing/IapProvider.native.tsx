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
import { authClient } from "@/src/lib/auth";
import {
  PREMIUM_ANNUAL_SKU,
  PREMIUM_SKUS,
  isPremiumSku,
  type PremiumSku,
} from "./skus";
import {
  fetchEntitlement,
  syncEntitlement,
  type StoreSubscription,
} from "./sync-entitlement";

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
  const [storeChecked, setStoreChecked] = useState(false);
  const [serverPremium, setServerPremium] = useState<boolean | null>(null);
  const purchaseWaiter = useRef<((ok: boolean) => void) | null>(null);

  const resolvePurchase = useCallback((ok: boolean) => {
    purchaseWaiter.current?.(ok);
    purchaseWaiter.current = null;
  }, []);

  const { data: session } = authClient.useSession();
  const signedIn = Boolean(session?.user);

  const {
    connected,
    subscriptions,
    activeSubscriptions,
    fetchProducts,
    requestPurchase,
    finishTransaction,
    getActiveSubscriptions,
    restorePurchases,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      try {
        await finishTransaction({ purchase, isConsumable: false });
      } catch {
        // Already finished or store will retry.
      }
      let confirmed = false;
      try {
        const latest = await getActiveSubscriptions([...PREMIUM_SKUS]);
        const withPurchase: StoreSubscription[] = [
          {
            productId:
              "productId" in purchase && typeof purchase.productId === "string"
                ? purchase.productId
                : undefined,
            transactionId:
              "transactionId" in purchase &&
              typeof purchase.transactionId === "string"
                ? purchase.transactionId
                : undefined,
            purchaseToken:
              "purchaseToken" in purchase &&
              typeof purchase.purchaseToken === "string"
                ? purchase.purchaseToken
                : undefined,
            isActive: true,
          },
          ...((latest ?? []) as StoreSubscription[]),
        ];
        const result = await syncEntitlement(withPurchase);
        setServerPremium(result.isPremium);
        confirmed = result.isPremium;
        if (!result.isPremium) {
          setError("Purchase didn’t verify. Try Restore Purchases.");
        }
      } catch {
        setError("Couldn’t confirm the purchase. Try Restore Purchases.");
      }
      setPurchasing(false);
      if (confirmed) setError(null);
      resolvePurchase(confirmed);
    },
    onPurchaseError: (purchaseError) => {
      setPurchasing(false);
      if (purchaseError.code === ErrorCode.UserCancelled) {
        resolvePurchase(false);
        return;
      }
      if (purchaseError.code === ErrorCode.AlreadyOwned) {
        void (async () => {
          try {
            const latest = await getActiveSubscriptions([...PREMIUM_SKUS]);
            const result = await syncEntitlement(
              (latest ?? []) as StoreSubscription[],
            );
            setServerPremium(result.isPremium);
            resolvePurchase(result.isPremium);
          } catch {
            resolvePurchase(false);
          }
        })();
        return;
      }
      setError(purchaseError.message || "Purchase failed. Try again.");
      resolvePurchase(false);
    },
  });

  useEffect(() => {
    if (!connected) return;
    void (async () => {
      try {
        await fetchProducts({ skus: [...PREMIUM_SKUS], type: "subs" });
        await getActiveSubscriptions([...PREMIUM_SKUS]);
      } finally {
        setStoreChecked(true);
      }
    })();
  }, [connected, fetchProducts, getActiveSubscriptions]);

  const entitlementKey = useMemo(
    () =>
      activeSubscriptions
        .map(
          (sub) =>
            `${sub.productId}:${sub.isActive}:${sub.transactionId}:${sub.purchaseToken ?? ""}:${sub.expirationDateIOS ?? ""}`,
        )
        .sort()
        .join("|"),
    [activeSubscriptions],
  );

  useEffect(() => {
    if (!signedIn) {
      setServerPremium(null);
      return;
    }
    void fetchEntitlement()
      .then((row) => setServerPremium(row.isPremium))
      .catch(() => {
        // Keep last known server flag until a sync succeeds.
      });
  }, [signedIn]);

  useEffect(() => {
    if (!connected || !signedIn || !storeChecked) return;
    // Empty Play/App Store lookup is not proof of "no Pro". Dev grants and
    // server entitlements live on /api/billing/me — only sync when the store
    // actually handed us a purchase token (real buy / restore).
    const hasStoreProof = activeSubscriptions.some((sub) => {
      const token =
        (typeof sub.purchaseToken === "string" && sub.purchaseToken) ||
        (typeof (sub as { purchaseTokenAndroid?: unknown })
          .purchaseTokenAndroid === "string" &&
          (sub as { purchaseTokenAndroid: string }).purchaseTokenAndroid);
      return Boolean(token && token.length >= 8);
    });
    if (!hasStoreProof) return;
    void syncEntitlement(activeSubscriptions)
      .then((row) => setServerPremium(row.isPremium))
      .catch(() => {
        // Next launch retries. UI follows the last verified server row.
      });
  }, [activeSubscriptions, connected, entitlementKey, signedIn, storeChecked]);

  const products = useMemo(
    () =>
      subscriptions
        .filter((product) => isPremiumSku(product.id))
        .map(toStoreProduct),
    [subscriptions],
  );

  const storePremium = useMemo(
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

  // After the API answers, it is the source of truth (store-verified).
  // Before that, the store flag is only used so a paid user isn't locked
  // out for one frame on cold start.
  const isPremium = serverPremium ?? storePremium;

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
      const latest = await getActiveSubscriptions([...PREMIUM_SKUS]);
      const result = await syncEntitlement((latest ?? []) as StoreSubscription[]);
      setServerPremium(result.isPremium);
      if (!result.isPremium) {
        setError("No verified subscription found for this account.");
      }
      return result.isPremium;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn’t restore purchases.",
      );
      return false;
    } finally {
      setRestoring(false);
    }
  }, [connected, getActiveSubscriptions, restorePurchases]);

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
