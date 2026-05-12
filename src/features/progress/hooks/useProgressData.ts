/** Load weight, PRs, photos for progress tab */
export function useProgressData() {
  return { weightSeries: [] as { date: string; kg: number }[], isLoading: false };
}
