export function calculateVolume(sets: { weightKg: number; reps: number }[]): number {
  return sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
}
