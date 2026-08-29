import type { Context } from "hono";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseLogDate(value: string): Date | null {
  if (!DATE_RE.test(value)) return null;

  // Store calendar days as UTC midnight so @db.Date / DateTime round-trip
  // with isoDate() using UTC parts.
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

/** YYYY-MM-DD from a Prisma date column stored as UTC midnight. */
export function isoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Prefer the device calendar day from `X-Client-Calendar-Date`.
 * Falling back to UTC is only for scripts / older clients.
 */
export function todayLogDate(clientDate?: string | null): string {
  if (clientDate && DATE_RE.test(clientDate)) return clientDate;
  return new Date().toISOString().slice(0, 10);
}

/** Resolve diary "today" from the request (client header wins). */
export function requestLogDate(c: Context, queryDate?: string | null): string {
  if (queryDate && DATE_RE.test(queryDate)) return queryDate;
  const header = c.req.header("x-client-calendar-date");
  return todayLogDate(header);
}
