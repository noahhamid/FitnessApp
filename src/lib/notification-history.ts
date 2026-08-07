import { storage } from "@/src/utils/storage";
import { localDateOnly } from "@/src/features/progress/lib/localDate";

export const NOTIFICATION_HISTORY_KEY = "exo:notification-history-v1";

const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

/** Mirrors ReminderSlot — kept local to avoid circular imports. */
export type NotificationHistoryType =
  | "breakfast"
  | "lunch"
  | "snack"
  | "dinner"
  | "workout";

export type NotificationHistoryStatus =
  | "scheduled"
  | "fired"
  | "canceled";

export type NotificationHistoryEntry = {
  id: string;
  type: NotificationHistoryType;
  title: string;
  body: string;
  scheduledFor: string;
  status: NotificationHistoryStatus;
  statusChangedAt: string;
};

/** Serialize AsyncStorage read-modify-write so concurrent updates don't clobber. */
let writeChain: Promise<void> = Promise.resolve();

function enqueueWrite<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function prune(entries: NotificationHistoryEntry[], now = Date.now()) {
  const cutoff = now - RETENTION_MS;
  return entries.filter((e) => {
    const t = Date.parse(e.scheduledFor);
    if (!Number.isFinite(t)) return false;
    return t >= cutoff;
  });
}

/**
 * Entries still "scheduled" whose trigger time has passed were almost
 * certainly delivered by the OS while the app wasn't listening — mark fired.
 */
function reconcileMissedFires(
  entries: NotificationHistoryEntry[],
  now = Date.now(),
): NotificationHistoryEntry[] {
  const iso = new Date(now).toISOString();
  return entries.map((e) => {
    if (e.status !== "scheduled") return e;
    const at = Date.parse(e.scheduledFor);
    if (!Number.isFinite(at) || at > now) return e;
    return { ...e, status: "fired", statusChangedAt: iso };
  });
}

async function readRaw(): Promise<NotificationHistoryEntry[]> {
  const raw = await storage.getString(NOTIFICATION_HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as NotificationHistoryEntry[];
  } catch {
    return [];
  }
}

async function writeAll(entries: NotificationHistoryEntry[]): Promise<void> {
  const cleaned = prune(reconcileMissedFires(entries));
  await storage.setString(NOTIFICATION_HISTORY_KEY, JSON.stringify(cleaned));
}

/** Read history (pruned + reconcile), newest scheduledFor first. */
export async function getNotificationHistory(): Promise<
  NotificationHistoryEntry[]
> {
  return enqueueWrite(async () => {
    const next = prune(reconcileMissedFires(await readRaw()));
    await storage.setString(NOTIFICATION_HISTORY_KEY, JSON.stringify(next));
    return [...next].sort(
      (a, b) => Date.parse(b.scheduledFor) - Date.parse(a.scheduledFor),
    );
  });
}

export async function recordNotificationScheduled(input: {
  id: string;
  type: NotificationHistoryType;
  title: string;
  body: string;
  scheduledFor: Date | string;
}): Promise<void> {
  await enqueueWrite(async () => {
    const entries = await readRaw();
    const scheduledFor =
      typeof input.scheduledFor === "string"
        ? input.scheduledFor
        : input.scheduledFor.toISOString();
    const nowIso = new Date().toISOString();
    const existing = entries.findIndex((e) => e.id === input.id);
    const entry: NotificationHistoryEntry = {
      id: input.id,
      type: input.type,
      title: input.title,
      body: input.body,
      scheduledFor,
      status: "scheduled",
      statusChangedAt: nowIso,
    };
    if (existing >= 0) {
      const prev = entries[existing]!;
      entries[existing] =
        prev.status === "scheduled"
          ? { ...entry, statusChangedAt: prev.statusChangedAt }
          : entry;
    } else {
      entries.push(entry);
    }
    await writeAll(entries);
  });
}

export async function markNotificationCanceled(id: string): Promise<void> {
  await enqueueWrite(async () => {
    const entries = await readRaw();
    const nowIso = new Date().toISOString();
    let changed = false;
    const next = entries.map((e) => {
      if (e.id !== id) return e;
      if (e.status === "canceled" || e.status === "fired") return e;
      changed = true;
      return { ...e, status: "canceled" as const, statusChangedAt: nowIso };
    });
    if (changed) await writeAll(next);
  });
}

export async function markNotificationFired(id: string): Promise<void> {
  await enqueueWrite(async () => {
    const entries = await readRaw();
    const nowIso = new Date().toISOString();
    let changed = false;
    const next = entries.map((e) => {
      if (e.id !== id) return e;
      if (e.status === "fired") return e;
      // Fired wins over canceled only if it actually delivered; prefer fired.
      changed = true;
      return { ...e, status: "fired" as const, statusChangedAt: nowIso };
    });
    if (changed) await writeAll(next);
  });
}

export type HistoryDayGroup = {
  key: string;
  label: string;
  entries: NotificationHistoryEntry[];
};

export function groupHistoryByDate(
  entries: NotificationHistoryEntry[],
  now = new Date(),
): HistoryDayGroup[] {
  const today = localDateOnly(now);
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  const yesterday = localDateOnly(y);

  const buckets = new Map<string, NotificationHistoryEntry[]>();
  for (const e of entries) {
    const day = localDateOnly(new Date(e.scheduledFor));
    const list = buckets.get(day) ?? [];
    list.push(e);
    buckets.set(day, list);
  }

  const keys = [...buckets.keys()].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  return keys.map((key) => {
    let label: string;
    if (key === today) label = "Today";
    else if (key === yesterday) label = "Yesterday";
    else {
      const d = new Date(`${key}T12:00:00`);
      label = d.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
    const dayEntries = (buckets.get(key) ?? []).sort(
      (a, b) => Date.parse(b.scheduledFor) - Date.parse(a.scheduledFor),
    );
    return { key, label, entries: dayEntries };
  });
}
