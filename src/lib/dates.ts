const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseLogDate(value: string): Date | null {
  if (!DATE_RE.test(value)) return null;

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

export function todayLogDate(): string {
  return new Date().toISOString().slice(0, 10);
}
