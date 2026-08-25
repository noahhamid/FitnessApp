import { createContext, useContext } from "react";
import type { PremiumSku } from "./skus";

export type StoreProduct = {
  id: string;
  title: string;
  displayPrice: string;
};

export type IapContextValue = {
  ready: boolean;
  isPremium: boolean;
  products: StoreProduct[];
  selectedSku: PremiumSku;
  setSelectedSku: (sku: PremiumSku) => void;
  purchasing: boolean;
  restoring: boolean;
  error: string | null;
  purchase: (sku?: PremiumSku) => Promise<boolean>;
  restore: () => Promise<boolean>;
  refresh: () => Promise<void>;
};

export const IapContext = createContext<IapContextValue | null>(null);

export function useIap(): IapContextValue {
  const ctx = useContext(IapContext);
  if (!ctx) {
    throw new Error("useIap must be used inside IapProvider");
  }
  return ctx;
}

export function usePremium(): boolean {
  return useIap().isPremium;
}
