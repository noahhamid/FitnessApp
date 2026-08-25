import { useMemo, useState, type ReactNode } from "react";
import { IapContext, type IapContextValue } from "./IapContext";
import { PREMIUM_ANNUAL_SKU, type PremiumSku } from "./skus";

const WEB_UNAVAILABLE = "Purchases are available in the iOS and Android apps.";

export function IapProvider({ children }: { children: ReactNode }) {
  const [selectedSku, setSelectedSku] = useState<PremiumSku>(PREMIUM_ANNUAL_SKU);

  const value = useMemo<IapContextValue>(
    () => ({
      ready: true,
      isPremium: false,
      products: [],
      selectedSku,
      setSelectedSku,
      purchasing: false,
      restoring: false,
      error: WEB_UNAVAILABLE,
      purchase: async () => false,
      restore: async () => false,
      refresh: async () => {},
    }),
    [selectedSku],
  );

  return <IapContext.Provider value={value}>{children}</IapContext.Provider>;
}
