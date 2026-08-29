import { bottomInset } from "@/src/lib/safe-area";

/** Notched floating pill + raised center FAB — sync with tabs `_layout.tsx`. */
export const TAB_BAR_H = 64;
export const TAB_FAB_SIZE = 56;
export const TAB_PILL_H_MARGIN = 18;
export const TAB_PILL_BOTTOM_GAP = 0;
/** Extra clearance for the FAB that sits above the pill. */
export const TAB_CHROME_PEEK = TAB_FAB_SIZE / 2 + 8;
/** Breathing room between last content and the tab bar. */
export const TAB_CONTENT_GAP = 16;

/**
 * Full height of the bottom tab chrome dock (FAB peek + bar + safe inset).
 */
export function tabChromeDockHeight(insetsBottom: number): number {
  return (
    TAB_CHROME_PEEK +
    TAB_BAR_H +
    bottomInset(insetsBottom)
  );
}

/**
 * Distance from the physical screen bottom to the top edge of the tab pill.
 */
export function tabPillTopFromBottom(insetsBottom: number): number {
  return TAB_BAR_H + bottomInset(insetsBottom);
}

/**
 * Scroll/content padding so the last card clears the tab bar
 * (and optional floating bar above it).
 */
export function tabContentBottomPad(
  insetsBottom: number,
  floatingBarH = 0,
): number {
  const clearChrome = tabChromeDockHeight(insetsBottom) + TAB_CONTENT_GAP;
  if (floatingBarH <= 0) return clearChrome;
  return clearChrome + floatingBarH + 8;
}
