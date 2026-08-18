/**
 * One-shot curator: reads data/exercises-dataset.json (MIT metadata from
 * hasaneyldrm/exercises-dataset) and writes prisma/data/curated-exercises.json
 * plus a console report. Does NOT seed the database.
 *
 * Run: npx tsx scripts/curate-exercises.ts
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "biceps"
  | "triceps"
  | "core";
type MovementPattern = "push" | "pull" | "hinge" | "squat" | "carry";
type EquipmentAccess = "bodyweight" | "home_dumbbells" | "full_gym";

type Raw = {
  id: string;
  name: string;
  category: string;
  body_part: string;
  equipment: string;
  target: string;
  muscle_group: string;
  instructions: { en?: string };
};

type Curated = {
  sourceId: string;
  name: string;
  muscleGroup: MuscleGroup;
  movementPattern: MovementPattern;
  minEquipment: EquipmentAccess;
  instructions: string;
  sourceEquipment: string;
  sourceBodyPart: string;
  sourceTarget: string;
  movementRule: string;
  equipmentAmbiguous?: string;
};

const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "data", "exercises-dataset.json");
const OUT_DIR = join(ROOT, "prisma", "data");
const OUT = join(OUT_DIR, "curated-exercises.json");
const REPORT = join(OUT_DIR, "curation-report.json");

const SKIP_BODY_PARTS = new Set(["cardio", "neck", "lower arms"]);

/** target → muscleGroup when body_part needs splitting / finer mapping */
const TARGET_TO_MG: Record<string, MuscleGroup> = {
  biceps: "biceps",
  triceps: "triceps",
  quads: "quads",
  hamstrings: "hamstrings",
  glutes: "glutes",
  calves: "calves",
  abs: "core",
  spine: "core",
  pectorals: "chest",
  delts: "shoulders",
  lats: "back",
  traps: "back",
  "upper back": "back",
  // Hip abductors/adductors don't have their own enum — treat as glute/hip work.
  abductors: "glutes",
  adductors: "glutes",
  // Chest synergists land on chest.
  "serratus anterior": "chest",
};

const BODY_PART_TO_MG: Record<string, MuscleGroup | "split"> = {
  chest: "chest",
  back: "back",
  shoulders: "shoulders",
  "lower legs": "calves",
  waist: "core",
  "upper arms": "split",
  "upper legs": "split",
};

const HOME_EQUIPMENT = new Set([
  "dumbbell",
  "kettlebell",
  "band",
  "resistance band",
  "stability ball",
  "medicine ball",
  "bosu ball",
  "roller",
  "wheel roller",
]);

const BODYWEIGHT_EQUIPMENT = new Set(["body weight"]);

/** These map to full_gym by rule but are called out in the report. */
const AMBIGUOUS_EQUIPMENT = new Map<string, string>([
  [
    "assisted",
    "Usually gym-assisted machines, but some assisted BW moves are bodyweight-like",
  ],
  ["rope", "Battle-rope / cable-rope — gym by default; not a home staple"],
  ["tire", "Odd-object / strongman — full_gym by proximity"],
  ["hammer", "Hammer-strength style plate machines → full_gym"],
  [
    "weighted",
    "Could be vest/plate at home; treated as full_gym (usually loaded gym work)",
  ],
  [
    "other",
    "Catch-all equipment tag → full_gym so we don't under-require kit",
  ],
]);

const SKIP_EQUIPMENT = new Set([
  // Pure cardio machines — leftover if category filter missed them
  "elliptical machine",
  "skierg machine",
  "stationary bike",
  "stepmill machine",
  "upper body ergometer",
  "sled machine",
]);

/** Down-rank obscure / highly machine-specific name patterns */
const OBSCURE_NAME =
  /\b(lever|smith|sissy|jaco[bs]|landmine|suspension|trx|viking|belt squat|hack|pendulum|reverse hyper)\b/i;

/** Soft boost for well-known movement keywords */
const COMMON_BOOST =
  /\b(bench press|overhead press|shoulder press|squat|deadlift|row|pull-?up|chin-?up|push-?up|lunge|curl|fly|dip|plank|crunch|hip thrust|rdl|romanian|lat pull|calf raise|leg press|goblet|bulgarian|face pull|lateral raise|tricep|bicep|glute bridge|sit-?up|russian twist|good morning|shrug|kickback|extension|pulldown|cable fly|incline|decline)\b/i;

/** Mobility / yoga / stretch entries aren't programmable "lifts" for this app. */
const SKIP_NAME =
  /\b(stretch|pose|yoga|mobility|foam roll|self[- ]?massage)\b/i;

function titleCaseName(name: string): string {
  // Drop gender markers the dataset sometimes appends.
  const cleaned = name.replace(/\s*\((male|female)\)\s*$/i, "").trim();
  return cleaned
    .split(/\s+/)
    .map((w) => {
      if (!w) return w;
      const lower = w.toLowerCase();
      if (["and", "of", "with", "to", "on", "a", "an", "the"].includes(lower)) {
        return lower;
      }
      if (/^\d/.test(w)) return w;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ")
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Exact dataset names that must stay shoulders (bodyweight catalog gap).
 * Checked before push-up→chest / waist→core / upper-arms-split→triceps rules.
 */
const SHOULDERS_NAME_OVERRIDE = new Set([
  "handstand push-up",
  "pike-to-cobra push-up",
  "shoulder tap",
]);

function muscleOverrideFromName(name: string): MuscleGroup | null {
  const n = name.toLowerCase().replace(/\s*\((male|female)\)\s*$/i, "").trim();
  // Curated BW shoulder progressions — beat noisy target tags + push-up→chest.
  if (SHOULDERS_NAME_OVERRIDE.has(n)) return "shoulders";
  // Strong name signals beat noisy dataset `target` tags (esp. upper legs).
  if (/\b(hip thrust|glute bridge)\b/.test(n)) return "glutes";
  if (/\b(nordic|leg curl)\b/.test(n)) return "hamstrings";
  if (/\bromanian\b/.test(n) || /\brdl\b/.test(n)) return "hamstrings";
  if (/\bdeadlift\b/.test(n)) return "hamstrings";
  if (
    /\b(back squat|front squat|goblet squat|split squat|hack squat|leg press|lunge|step[- ]?up)\b/.test(
      n,
    ) ||
    (/\bsquat\b/.test(n) && !/\boverhead\b/.test(n) && !/\bcurl\b/.test(n))
  ) {
    return "quads";
  }
  if (/\bcalf\b/.test(n)) return "calves";
  if (
    /\b(plank|crunch|sit[- ]?up|dead bug|hollow|russian twist|leg raise)\b/.test(n)
  ) {
    return "core";
  }
  if (/\b(bench press|chest fly|chest dip|push[- ]?up)\b/.test(n) && !/\bclose[- ]grip push\b/.test(n)) {
    // close-grip push-up stays triceps via target
    if (/\bclose[- ]grip\b/.test(n) && /\bpush\b/.test(n)) return null;
    return "chest";
  }
  return null;
}

function mapMuscleGroup(
  raw: Raw,
): { mg: MuscleGroup } | { skip: string } {
  const bp = raw.body_part.toLowerCase();
  if (SKIP_BODY_PARTS.has(bp)) {
    return { skip: `body_part=${bp}` };
  }
  if (raw.target === "cardiovascular system" || raw.target === "forearms") {
    return { skip: `target=${raw.target}` };
  }
  if (raw.target === "levator scapulae") {
    return { skip: "target=levator scapulae (neck)" };
  }

  const nameOverride = muscleOverrideFromName(raw.name);
  if (nameOverride) return { mg: nameOverride };

  const direct = BODY_PART_TO_MG[bp];
  if (!direct) return { skip: `unmapped body_part=${bp}` };

  if (direct !== "split") {
    return { mg: direct };
  }

  const byTarget = TARGET_TO_MG[raw.target.toLowerCase()];
  if (!byTarget) {
    return { skip: `split ${bp} with unmapped target=${raw.target}` };
  }
  if (bp === "upper arms" && byTarget !== "biceps" && byTarget !== "triceps") {
    return { skip: `upper arms target=${raw.target}` };
  }
  if (
    bp === "upper legs" &&
    !["quads", "hamstrings", "glutes"].includes(byTarget)
  ) {
    return { skip: `upper legs target=${raw.target}` };
  }
  return { mg: byTarget };
}

function mapEquipment(
  equipment: string,
): { tier: EquipmentAccess; ambiguous?: string } | { skip: string } {
  const eq = equipment.toLowerCase();
  if (SKIP_EQUIPMENT.has(eq)) return { skip: `equipment=${eq}` };
  if (BODYWEIGHT_EQUIPMENT.has(eq)) return { tier: "bodyweight" };
  if (HOME_EQUIPMENT.has(eq)) return { tier: "home_dumbbells" };

  // Everything else → full_gym (barbell, cable, smith, ez, leverage, weighted, other, …)
  const ambiguous = AMBIGUOUS_EQUIPMENT.get(eq);
  return { tier: "full_gym", ambiguous };
}

type RuleHit = { pattern: MovementPattern; rule: string };

function inferMovement(
  name: string,
  target: string,
  mg: MuscleGroup,
): RuleHit {
  const n = name.toLowerCase();
  const t = target.toLowerCase();

  // --- carry first when name is clearly core (before fly/press false positives) ---
  if (
    /\b(plank|crunch|sit[- ]?up|twist|dead bug|hollow|woodchop|mountain climber|v[- ]?up|leg raise|knee raise|ab wheel|roll[- ]?out)\b/.test(
      n,
    )
  ) {
    return { pattern: "carry", rule: "name:~core iso/flex patterns" };
  }
  if (mg === "core" && /\braise\b/.test(n)) {
    return { pattern: "carry", rule: "core+raise" };
  }
  if (t === "abs" || t === "spine") {
    return { pattern: "carry", rule: `target=${t}→carry` };
  }

  // --- squat ---
  if (/\bsquat\b/.test(n)) return { pattern: "squat", rule: "name:~squat" };
  if (/\blunge\b/.test(n)) return { pattern: "squat", rule: "name:~lunge" };
  if (/\bleg press\b/.test(n)) return { pattern: "squat", rule: "name:~leg press" };
  if (/\bstep[- ]?up\b/.test(n)) return { pattern: "squat", rule: "name:~step-up" };
  if (/\bcalf raise\b/.test(n) || (mg === "calves" && /\braise\b/.test(n))) {
    return { pattern: "squat", rule: "name:~calf raise|calves+raise" };
  }
  if (/\bwall sit\b/.test(n)) return { pattern: "squat", rule: "name:~wall sit" };

  // --- hinge ---
  if (/\bdeadlift\b/.test(n) || /\brdl\b/.test(n) || /\bromanian\b/.test(n)) {
    return { pattern: "hinge", rule: "name:~deadlift|rdl|romanian" };
  }
  if (/\bhip thrust\b/.test(n)) return { pattern: "hinge", rule: "name:~hip thrust" };
  if (/\bgood morning\b/.test(n)) return { pattern: "hinge", rule: "name:~good morning" };
  if (/\b(kettlebell )?swing\b/.test(n)) return { pattern: "hinge", rule: "name:~swing" };
  if (/\b(hyperextension|back extension|pull[- ]?through)\b/.test(n)) {
    return { pattern: "hinge", rule: "name:~hyperextension|back extension|pull-through" };
  }
  if (/\bglute bridge\b/.test(n) || (/\bbridge\b/.test(n) && mg === "glutes")) {
    return { pattern: "hinge", rule: "name:~glute bridge|glutes+bridge" };
  }
  if (/\bnordic\b/.test(n)) return { pattern: "hinge", rule: "name:~nordic" };

  // --- pull ---
  if (/\b(pull[- ]?up|chin[- ]?up)\b/.test(n)) {
    return { pattern: "pull", rule: "name:~pull-up|chin-up" };
  }
  if (/\b(row|pulldown|pull[- ]?down|face pull)\b/.test(n)) {
    return { pattern: "pull", rule: "name:~row|pulldown|face pull" };
  }
  if (/\bcurl\b/.test(n)) return { pattern: "pull", rule: "name:~curl" };
  if (/\bshrug\b/.test(n)) return { pattern: "pull", rule: "name:~shrug" };
  if (/\b(lat|rear delt|reverse fly|bent[- ]over raise)\b/.test(n)) {
    return { pattern: "pull", rule: "name:~lat|rear delt|reverse fly" };
  }
  if (t === "lats" || t === "upper back" || t === "biceps" || t === "traps") {
    if (/\b(pull|row|curl|lat)\b/.test(n)) {
      return { pattern: "pull", rule: `target=${t}+name pull-ish` };
    }
  }

  // --- push ---
  if (/\bpush[- ]?up\b/.test(n)) return { pattern: "push", rule: "name:~push-up" };
  if (/\bpushdown\b/.test(n) || /\bpress[- ]?down\b/.test(n)) {
    return { pattern: "push", rule: "name:~pushdown|press-down" };
  }
  if (/\bpress\b/.test(n)) return { pattern: "push", rule: "name:~press" };
  if (/\bdip\b/.test(n)) return { pattern: "push", rule: "name:~dip" };
  if (/\bfly\b/.test(n) || /\bflye\b/.test(n)) {
    return { pattern: "push", rule: "name:~fly" };
  }
  if (/\bkickback\b/.test(n)) return { pattern: "push", rule: "name:~kickback" };
  if (
    mg === "shoulders" &&
    /\b(lateral|front|side)\b/.test(n) &&
    /\braise\b/.test(n)
  ) {
    return { pattern: "push", rule: "shoulders+(lateral|front|side) raise" };
  }
  if (mg === "triceps" && /\bextension\b/.test(n)) {
    return { pattern: "push", rule: "triceps+extension" };
  }
  if (mg === "chest" || mg === "shoulders" || mg === "triceps") {
    if (/\b(raise|extension)\b/.test(n)) {
      return { pattern: "push", rule: `${mg}+raise|extension` };
    }
  }

  // --- muscle-group fallback ---
  const FALLBACK: Record<MuscleGroup, MovementPattern> = {
    chest: "push",
    shoulders: "push",
    triceps: "push",
    back: "pull",
    biceps: "pull",
    quads: "squat",
    calves: "squat",
    hamstrings: "hinge",
    glutes: "hinge",
    core: "carry",
  };
  return {
    pattern: FALLBACK[mg],
    rule: `fallback:${mg}→${FALLBACK[mg]}`,
  };
}

function scoreCandidate(raw: Raw, equipment: string): number {
  let score = 50;
  const n = raw.name.toLowerCase().replace(/\s*\((male|female)\)\s*$/i, "");
  if (SKIP_NAME.test(n)) return -999;
  if (COMMON_BOOST.test(n)) score += 35;
  if (/\bplank\b/.test(n)) score += 25;
  if (OBSCURE_NAME.test(n)) score -= 40;
  // Classic short lifts
  if (
    /^(barbell |dumbbell |cable )?(bench press|squat|deadlift|row|curl|lunge|push-?up|pull-?up|chin-?up|plank|hip thrust|overhead press|shoulder press|lat pulldown|leg press|calf raise)$/i.test(
      n.trim(),
    )
  ) {
    score += 40;
  }
  // Prefer shorter, cleaner names
  score -= Math.max(0, n.length - 28) * 0.6;
  // Prefer freer weights / BW slightly over machines for curation quality
  if (equipment === "body weight") score += 8;
  if (equipment === "dumbbell" || equipment === "barbell") score += 10;
  if (equipment === "cable" || equipment === "kettlebell") score += 6;
  if (equipment === "ez barbell") score += 3;
  if (equipment.includes("machine") || equipment === "leverage machine")
    score -= 12;
  if (equipment === "smith machine") score -= 18;
  // Mild preference against very long compound gadget names
  if ((n.match(/,/g) ?? []).length >= 1) score -= 8;
  return score;
}

/** Fingerprint for near-duplicate collapsing within a muscle group */
function fingerprint(name: string, mg: MuscleGroup, tier: EquipmentAccess): string {
  const n = name
    .toLowerCase()
    .replace(/\b(leftright|left|right|alternate|alternating|seated|standing|lying|incline|decline|close[- ]grip|wide[- ]grip)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 4)
    .join(" ");
  return `${mg}|${tier}|${n}`;
}

function main() {
  const rawAll: Raw[] = JSON.parse(readFileSync(SRC, "utf8"));
  console.log(`Loaded ${rawAll.length} source exercises`);

  let excludedBodyPart = 0;
  let excludedTarget = 0;
  let excludedEquipment = 0;
  let excludedUnmapped = 0;
  let excludedStretch = 0;
  const ambiguousFlags: { name: string; equipment: string; note: string }[] =
    [];

  const mapped: Curated[] = [];

  for (const raw of rawAll) {
    if (SKIP_NAME.test(raw.name)) {
      excludedStretch++;
      continue;
    }

    const mgResult = mapMuscleGroup(raw);
    if ("skip" in mgResult) {
      if (mgResult.skip.startsWith("body_part=")) excludedBodyPart++;
      else if (mgResult.skip.startsWith("target=")) excludedTarget++;
      else excludedUnmapped++;
      continue;
    }

    const eqResult = mapEquipment(raw.equipment);
    if ("skip" in eqResult) {
      excludedEquipment++;
      continue;
    }

    const en = raw.instructions?.en?.trim();
    if (!en) {
      excludedUnmapped++;
      continue;
    }

    const move = inferMovement(raw.name, raw.target, mgResult.mg);
    const name = titleCaseName(raw.name);

    if (eqResult.ambiguous) {
      ambiguousFlags.push({
        name,
        equipment: raw.equipment,
        note: eqResult.ambiguous,
      });
    }

    mapped.push({
      sourceId: raw.id,
      name,
      muscleGroup: mgResult.mg,
      movementPattern: move.pattern,
      minEquipment: eqResult.tier,
      instructions: en,
      sourceEquipment: raw.equipment,
      sourceBodyPart: raw.body_part,
      sourceTarget: raw.target,
      movementRule: move.rule,
      ...(eqResult.ambiguous
        ? { equipmentAmbiguous: eqResult.ambiguous }
        : {}),
    });
  }

  // Score + select with balance across muscle × equipment
  type Scored = Curated & { score: number };
  const scored: Scored[] = mapped.map((m) => ({
    ...m,
    score: scoreCandidate(
      {
        id: m.sourceId,
        name: m.name,
        category: m.sourceBodyPart,
        body_part: m.sourceBodyPart,
        equipment: m.sourceEquipment,
        target: m.sourceTarget,
        muscle_group: m.sourceTarget,
        instructions: { en: m.instructions },
      },
      m.sourceEquipment,
    ),
  }));

  scored.sort((a, b) => b.score - a.score);

  const MUSCLES: MuscleGroup[] = [
    "chest",
    "back",
    "shoulders",
    "quads",
    "hamstrings",
    "glutes",
    "calves",
    "biceps",
    "triceps",
    "core",
  ];
  const TIERS: EquipmentAccess[] = [
    "bodyweight",
    "home_dumbbells",
    "full_gym",
  ];

  // Targets: ~200 total → ~20/group, ~6–7 per tier
  const PER_GROUP_TARGET = 20;
  const PER_TIER_SOFT = 7;
  const GLOBAL_CAP = 220;

  const selected: Scored[] = [];
  const usedNames = new Set<string>();
  const usedFp = new Set<string>();
  const counts: Record<string, Record<string, number>> = {};
  for (const mg of MUSCLES) {
    counts[mg] = { bodyweight: 0, home_dumbbells: 0, full_gym: 0, total: 0 };
  }

  const groupTotal = (mg: MuscleGroup) => counts[mg].total as number;
  const tierCount = (mg: MuscleGroup, t: EquipmentAccess) =>
    counts[mg][t] as number;

  // Pass 1: fill soft per-tier quotas with highest scores
  for (const mg of MUSCLES) {
    for (const tier of TIERS) {
      for (const c of scored) {
        if (c.muscleGroup !== mg || c.minEquipment !== tier) continue;
        if (groupTotal(mg) >= PER_GROUP_TARGET) break;
        if (tierCount(mg, tier) >= PER_TIER_SOFT) break;
        const key = c.name.toLowerCase();
        if (usedNames.has(key)) continue;
        const fp = fingerprint(c.name, mg, tier);
        if (usedFp.has(fp)) continue;
        selected.push(c);
        usedNames.add(key);
        usedFp.add(fp);
        counts[mg][tier]++;
        counts[mg].total++;
      }
    }
  }

  // Pass 2: top up groups that are short (any tier) toward PER_GROUP_TARGET
  for (const mg of MUSCLES) {
    for (const c of scored) {
      if (groupTotal(mg) >= PER_GROUP_TARGET) break;
      if (selected.length >= GLOBAL_CAP) break;
      if (c.muscleGroup !== mg) continue;
      const key = c.name.toLowerCase();
      if (usedNames.has(key)) continue;
      const fp = fingerprint(c.name, mg, c.minEquipment);
      if (usedFp.has(fp)) continue;
      // Avoid blowing one tier past ~10 unless necessary
      if (tierCount(mg, c.minEquipment) >= 10) continue;
      selected.push(c);
      usedNames.add(key);
      usedFp.add(fp);
      counts[mg][c.minEquipment]++;
      counts[mg].total++;
    }
  }

  // Pass 3: if still under ~180 and calves/hamstrings/glutes thin, relax tier cap
  if (selected.length < 180) {
    for (const c of scored) {
      if (selected.length >= GLOBAL_CAP) break;
      if (groupTotal(c.muscleGroup) >= 24) continue;
      const key = c.name.toLowerCase();
      if (usedNames.has(key)) continue;
      const fp = fingerprint(c.name, c.muscleGroup, c.minEquipment);
      if (usedFp.has(fp)) continue;
      selected.push(c);
      usedNames.add(key);
      usedFp.add(fp);
      counts[c.muscleGroup][c.minEquipment]++;
      counts[c.muscleGroup].total++;
    }
  }

  selected.sort((a, b) => {
    const mi = MUSCLES.indexOf(a.muscleGroup) - MUSCLES.indexOf(b.muscleGroup);
    if (mi !== 0) return mi;
    const ti = TIERS.indexOf(a.minEquipment) - TIERS.indexOf(b.minEquipment);
    if (ti !== 0) return ti;
    return a.name.localeCompare(b.name);
  });

  const seedRows = selected.map(
    ({
      name,
      muscleGroup,
      movementPattern,
      minEquipment,
      instructions,
    }) => ({
      name,
      muscleGroup,
      movementPattern,
      minEquipment,
      instructions,
    }),
  );

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT, JSON.stringify(seedRows, null, 2), "utf8");

  // Movement rule frequency for report
  const ruleFreq: Record<string, number> = {};
  const patternByRule: Record<string, string> = {};
  for (const s of selected) {
    ruleFreq[s.movementRule] = (ruleFreq[s.movementRule] ?? 0) + 1;
    patternByRule[s.movementRule] = s.movementPattern;
  }

  const byMg: Record<string, number> = {};
  const byTier: Record<string, number> = {};
  const byMgTier: Record<string, Record<string, number>> = {};
  for (const s of selected) {
    byMg[s.muscleGroup] = (byMg[s.muscleGroup] ?? 0) + 1;
    byTier[s.minEquipment] = (byTier[s.minEquipment] ?? 0) + 1;
    byMgTier[s.muscleGroup] ??= {};
    byMgTier[s.muscleGroup][s.minEquipment] =
      (byMgTier[s.muscleGroup][s.minEquipment] ?? 0) + 1;
  }

  const pickNames = [
    "Barbell Bench Press",
    "Dumbbell Bench Press",
    "Push-up",
    "Pull-up",
    "Barbell Deadlift",
    "Goblet Squat",
    "Dumbbell Curl",
    "Cable Pushdown",
    "Plank",
    "Hip Thrust",
  ];
  const byName = new Map(selected.map((s) => [s.name, s]));
  const sampleUnique = pickNames
    .map((n) => {
      // fuzzy: find first name that includes key tokens
      if (byName.has(n)) return byName.get(n)!;
      const lower = n.toLowerCase();
      return selected.find((s) => s.name.toLowerCase().includes(lower)) ?? null;
    })
    .filter((s): s is Scored => !!s)
    .slice(0, 10);

  // If fuzzy misses, pad from high-score across groups
  if (sampleUnique.length < 10) {
    for (const s of [...selected].sort((a, b) => b.score - a.score)) {
      if (sampleUnique.some((x) => x.name === s.name)) continue;
      sampleUnique.push(s);
      if (sampleUnique.length >= 10) break;
    }
  }

  const report = {
    sourceTotal: rawAll.length,
    exclusions: {
      bodyPartCardioNeckLowerArms: excludedBodyPart,
      targetUnmappable: excludedTarget,
      cardioMachinesEtc: excludedEquipment,
      stretchYogaMobility: excludedStretch,
      otherUnmapped: excludedUnmapped,
      note: "bodyPartCardioNeckLowerArms = Step 2 category skip (cardio/neck/lower arms)",
    },
    curatedCount: selected.length,
    byMuscleGroup: byMg,
    byEquipmentTier: byTier,
    byMuscleGroupAndTier: byMgTier,
    movementInferenceRules: Object.entries(ruleFreq)
      .sort((a, b) => b[1] - a[1])
      .map(([rule, count]) => ({
        rule,
        pattern: patternByRule[rule],
        count,
      })),
    ambiguousEquipment: ambiguousFlags.filter((f) =>
      selected.some((s) => s.name === f.name),
    ),
    sampleRecords: sampleUnique.map((s) => ({
      name: s.name,
      muscleGroup: s.muscleGroup,
      movementPattern: s.movementPattern,
      movementRule: s.movementRule,
      minEquipment: s.minEquipment,
      sourceEquipment: s.sourceEquipment,
      sourceBodyPart: s.sourceBodyPart,
      sourceTarget: s.sourceTarget,
      instructions: s.instructions.slice(0, 220) + (s.instructions.length > 220 ? "…" : ""),
    })),
  };

  writeFileSync(REPORT, JSON.stringify(report, null, 2), "utf8");

  console.log("\n=== CURATION SUMMARY ===");
  console.log(`Curated: ${selected.length}`);
  console.log("By muscle group:", byMg);
  console.log("By equipment tier:", byTier);
  console.log("Exclusions (body_part cardio/neck/lower arms):", excludedBodyPart);
  console.log("Wrote", OUT);
  console.log("Wrote", REPORT);
}

main();
