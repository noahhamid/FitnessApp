import { router } from "expo-router";
import { PaywallFlow } from "@/src/features/billing/PaywallFlow";
import { takePendingPremiumAction } from "@/src/features/billing/pending-action";
import { useUserProfile } from "@/src/features/profile/hooks/useUserProfile";

export default function InAppPaywallScreen() {
  const { data: profile } = useUserProfile();

  function closeAndRunPending() {
    const action = takePendingPremiumAction();
    if (router.canGoBack()) router.back();
    else router.replace("/(app)/(tabs)");
    action?.();
  }

  function closeWithoutAction() {
    takePendingPremiumAction();
    if (router.canGoBack()) router.back();
    else router.replace("/(app)/(tabs)");
  }

  return (
    <PaywallFlow
      gender={profile?.gender ?? undefined}
      leaving={false}
      onUnlocked={closeAndRunPending}
      onLeaveWithoutPurchase={closeWithoutAction}
    />
  );
}
