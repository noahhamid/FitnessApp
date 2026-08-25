type PendingAction = () => void;

let pending: PendingAction | null = null;

/** Run after a successful in-app purchase. Discarded if the user dismisses. */
export function setPendingPremiumAction(action: PendingAction): void {
  pending = action;
}

export function takePendingPremiumAction(): PendingAction | null {
  const next = pending;
  pending = null;
  return next;
}
