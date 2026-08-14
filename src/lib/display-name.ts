/** Max length for stored display names (first given name only). */
export const DISPLAY_NAME_MAX_LENGTH = 20;

/**
 * Keep the first given name only (no family names) and clamp length.
 */
export function normalizeDisplayFirstName(raw: string): string {
  const first = raw.trim().split(/\s+/).filter(Boolean)[0] ?? "";
  return first.slice(0, DISPLAY_NAME_MAX_LENGTH);
}
