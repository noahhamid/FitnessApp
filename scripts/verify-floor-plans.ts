/**
 * Checks that no bodyweight plan can surface a move that needs furniture, and
 * that the floor-only pool is deep enough to rotate across a 6-day split.
 * Run with: npx tsx scripts/verify-floor-plans.ts
 */
import { prisma } from "../src/lib/prisma";
import { generateWorkoutPlan } from "../src/lib/workout-plan-generator";
import { GOAL_DETAIL_TUNING } from "../src/lib/plan-modifiers";

async function main() {
  const propNames = new Set(
    (
      await prisma.exercise.findMany({
        where: { needsProp: true },
        select: { name: true },
      })
    ).map((r) => r.name),
  );
  console.log(`${propNames.size} prop-dependent exercises in the catalog\n`);

  const goalDetails = [undefined, ...Object.keys(GOAL_DETAIL_TUNING)];
  let failures = 0;

  // Surfaces rows added to the catalog without a needsProp tag — the plan check
  // below can only reject moves we already know need furniture. Phrases are
  // deliberately narrow: "step forward" and "sitting back into a chair" are
  // cues, not equipment. A hit needs a human to judge, so it warns.
  const suspect = [
    /edge of (a |the )?(bench|chair|step)/i,
    /\bon (a|the) (bench|chair|step|box|block)\b/i,
    /(pull-up|straight|dip|parallel) bars?\b/i,
    /elevated surface/i,
    /suspension trainer/i,
    /sturdy object/i,
  ];
  const untagged = (
    await prisma.exercise.findMany({
      where: { minEquipment: "bodyweight", needsProp: false },
      select: { name: true, instructions: true },
    })
  ).filter((r) => suspect.some((re) => re.test(r.instructions ?? "")));
  if (untagged.length > 0) {
    console.log(
      `WARN ${untagged.length} untagged bodyweight row(s) may need furniture:`,
    );
    for (const r of untagged) console.log(`  ${r.name}`);
    console.log("");
  }

  for (const days of [3, 4, 5, 6]) {
    for (const goalDetail of goalDetails) {
      const plan = await generateWorkoutPlan({
        goalId: "build",
        experience: "intermediate",
        equipment: "bodyweight",
        daysPerWeek: days,
        injuries: [],
        focusAreas: [],
        goalDetail,
        bodyIssues: ["lower_back_pain"],
      });

      const all = plan.days.flatMap((d) => d.exercises);
      const offenders = all.filter((ex) => propNames.has(ex.exerciseName));
      const unique = new Set(all.map((ex) => ex.exerciseName));
      const label = `${days}d / ${goalDetail ?? "no goalDetail"}`;

      if (offenders.length > 0) {
        failures++;
        console.log(
          `FAIL ${label}: ${offenders.map((o) => o.exerciseName).join(", ")}`,
        );
      } else {
        const repeatRate = (unique.size / all.length).toFixed(2);
        console.log(
          `ok   ${label} — ${all.length} moves, ${unique.size} unique (${repeatRate})`,
        );
      }
    }
  }

  // Rotation sanity on the deepest split: no day should be a copy of another.
  const six = await generateWorkoutPlan({
    goalId: "build",
    experience: "intermediate",
    equipment: "bodyweight",
    daysPerWeek: 6,
    injuries: [],
    focusAreas: [],
  });
  console.log("\n6-day plan:");
  for (const day of six.days) {
    console.log(
      `  ${day.label}: ${day.exercises.map((e) => e.exerciseName).join(", ")}`,
    );
  }
  const signatures = six.days.map((d) =>
    d.exercises.map((e) => e.exerciseName).join("|"),
  );
  const dupeDays = signatures.length - new Set(signatures).size;
  if (dupeDays > 0) {
    failures++;
    console.log(`\nFAIL ${dupeDays} duplicate day(s)`);
  }

  console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} failed.`);
  await prisma.$disconnect();
  process.exit(failures === 0 ? 0 : 1);
}

void main();
