export function formatKcal(n: number): string {
  return `${Math.round(n).toLocaleString()} kcal`;
}

export function formatWeightKg(n: number, unit: "kg" | "lbs" = "kg"): string {
  if (unit === "lbs") return `${(n * 2.20462).toFixed(1)} lbs`;
  return `${n.toFixed(1)} kg`;
}
