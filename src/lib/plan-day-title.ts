/**
 * Human-readable plan-day title from the day's exercise muscle groups.
 * Pure (no RN / Prisma) so adapter, generator, and scripts can share it.
 */
const MUSCLE_LABEL: Record<string, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  quads: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  calves: "Calves",
  biceps: "Biceps",
  triceps: "Triceps",
  core: "Core",
};

const LEG_GROUPS = new Set(["quads", "hamstrings", "glutes", "calves"]);
const UPPER_GROUPS = new Set([
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
]);

function formatGroup(g: string): string {
  return MUSCLE_LABEL[g] ?? g.charAt(0).toUpperCase() + g.slice(1);
}

export function dayTitleFromMuscleGroups(
  exercises: { muscleGroup?: string }[],
): string {
  // Session-derived exercises can carry no muscle group at all, so drop those
  // rather than letting them skew (or crash) the tally.
  const groups = exercises
    .map((ex) => ex.muscleGroup?.toLowerCase())
    .filter((g): g is string => !!g);

  if (groups.length === 0) return "Workout";

  const counts = new Map<string, number>();
  for (const g of groups) {
    counts.set(g, (counts.get(g) ?? 0) + 1);
  }

  const total = groups.length;
  const ranked = [...counts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });

  const legCount = ranked
    .filter(([g]) => LEG_GROUPS.has(g))
    .reduce((sum, [, n]) => sum + n, 0);
  const upperCount = ranked
    .filter(([g]) => UPPER_GROUPS.has(g))
    .reduce((sum, [, n]) => sum + n, 0);

  // Predominantly lower-body day (e.g. quads/hams/glutes/calves ± light core).
  if (legCount / total >= 0.6) {
    return "Legs";
  }

  // Evenly spread across many groups → Full Body / Upper Body.
  const topShare = ranked[0][1] / total;
  if (ranked.length >= 4 && topShare <= 0.4) {
    if (legCount > 0 && upperCount > 0) return "Full Body";
    if (upperCount / total >= 0.6) return "Upper Body";
    return "Full Body";
  }

  const [topGroup, topCount] = ranked[0];
  const second = ranked[1];
  if (!second) return formatGroup(topGroup);

  // Include the runner-up when it's a real co-focus (tie, ≥2 slots, or ≥30%).
  const includeSecond =
    second[1] >= topCount ||
    second[1] >= 2 ||
    second[1] / total >= 0.3 ||
    (ranked.length <= 3 && second[1] >= 1);

  if (includeSecond) {
    return `${formatGroup(topGroup)} & ${formatGroup(second[0])}`;
  }

  return formatGroup(topGroup);
}
