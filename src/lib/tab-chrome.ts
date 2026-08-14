import { bottomInset } from "@/src/lib/safe-area";

/** Floating tab pill geometry — keep in sync with `app/(app)/(tabs)/_layout.tsx`. */
export const TAB_PILL_H = 64;
export const TAB_PILL_H_MARGIN = 20;
export const TAB_PILL_BOTTOM_GAP = 10;
/** Extra red chrome above the pill so content clears the dock, not only the icons. */
export const TAB_CHROME_PEEK = 14;
/** Breathing room between last content and the chrome dock. */
export const TAB_CONTENT_GAP = 20;

/** Home sticky CTA dock height (content + padding). */
export const HOME_FLOATING_BAR_H = 58;

/**
 * Full height of the bottom tab chrome dock (safe inset + gap + pill + peek).
 */
export function tabChromeDockHeight(insetsBottom: number): number {
  return (
    bottomInset(insetsBottom) +
    TAB_PILL_BOTTOM_GAP +
    TAB_PILL_H +
    TAB_CHROME_PEEK
  );
}

/**
 * Distance from the physical screen bottom to the top edge of the tab pill.
 * Floating docks that sit *above* the pill should use this as their `bottom`.
 */
export function tabPillTopFromBottom(insetsBottom: number): number {
  return bottomInset(insetsBottom) + TAB_PILL_BOTTOM_GAP + TAB_PILL_H;
}

/**
 * Scroll/content padding so the last card clears the full red tab chrome
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
