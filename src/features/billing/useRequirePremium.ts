import { useCallback } from "react";
import { router } from "expo-router";
import { setPendingPremiumAction } from "./pending-action";
import { useIap } from "./IapContext";

export function useRequirePremium() {
  const { isPremium } = useIap();

  return useCallback(
    (action: () => void) => {
      if (isPremium) {
        action();
        return;
      }
      setPendingPremiumAction(action);
      router.push("/paywall");
    },
    [isPremium],
  );
}
