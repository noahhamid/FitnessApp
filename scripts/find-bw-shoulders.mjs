/**
 * Find bodyweight shoulder candidates from exercises-dataset using the
 * same mapping rules as scripts/curate-exercises.ts. Does NOT write seed.
 */
import { readFileSync } from "fs";
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

const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "data", "exercises-dataset.json");
const CURATED = join(ROOT, "prisma", "data", "curated-exercises.json");

const SKIP_BODY_PARTS = new Set(["cardio", "neck", "lower arms"]);
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
  abductors: "glutes",
  adductors: "glutes",
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
const SKIP_NAME =
  /\b(stretch|pose|yoga|mobility|foam roll|self[- ]?massage)\b/i;
const COMMON_BOOST =
  /\b(bench press|overhead press|shoulder press|squat|deadlift|row|pull-?up|chin-?up|push-?up|lunge|curl|fly|dip|plank|crunch|hip thrust|rdl|romanian|lat pull|calf raise|leg press|goblet|bulgarian|face pull|lateral raise|tricep|bicep|glute bridge|sit-?up|russian twist|good morning|shrug|kickback|extension|pulldown|cable fly|incline|decline|pike|handstand|wall walk|shoulder tap)\b/i;

function titleCaseName(name: string): string {
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

function muscleOverrideFromName(name: string): MuscleGroup | null {
  const n = name.toLowerCase();
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
    /\b(plank|crunch|sit[- ]?up|dead bug|hollow|russian twist|leg raise)\b/.test(
      n,
    )
  ) {
    return "core";
  }
  // Pike / handstand push-ups are shoulder-dominant — don't let generic
  // push-up override steal them to chest.
  if (/\b(pike|handstand)\b/.test(n) && /\bpush[- ]?up\b/.test(n)) {
    return "shoulders";
  }
  if (
    /\b(bench press|chest fly|chest dip|push[- ]?up)\b/.test(n) &&
    !/\bclose[- ]grip push\b/.test(n)
  ) {
    if (/\bclose[- ]grip\b/.test(n) && /\bpush\b/.test(n)) return null;
    return "chest";
  }
  return null;
}

function mapMuscleGroup(raw: Raw): MuscleGroup | null {
  const bp = raw.body_part.toLowerCase();
  if (SKIP_BODY_PARTS.has(bp)) return null;
  if (raw.target === "cardiovascular system" || raw.target === "forearms")
    return null;
  if (raw.target === "levator scapulae") return null;
  const nameOverride = muscleOverrideFromName(raw.name);
  if (nameOverride) return nameOverride;
  const direct = BODY_PART_TO_MG[bp];
  if (!direct) return null;
  if (direct !== "split") return direct;
  const byTarget = TARGET_TO_MG[raw.target.toLowerCase()];
  return byTarget ?? null;
}

function inferMovement(
  name: string,
  target: string,
  mg: MuscleGroup,
): { pattern: MovementPattern; rule: string } {
  const n = name.toLowerCase();
  const t = target.toLowerCase();
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
  if (/\bsquat\b/.test(n)) return { pattern: "squat", rule: "name:~squat" };
  if (/\blunge\b/.test(n)) return { pattern: "squat", rule: "name:~lunge" };
  if (/\bleg press\b/.test(n))
    return { pattern: "squat", rule: "name:~leg press" };
  if (/\bstep[- ]?up\b/.test(n))
    return { pattern: "squat", rule: "name:~step-up" };
  if (/\bcalf raise\b/.test(n) || (mg === "calves" && /\braise\b/.test(n))) {
    return { pattern: "squat", rule: "name:~calf raise|calves+raise" };
  }
  if (/\bwall sit\b/.test(n))
    return { pattern: "squat", rule: "name:~wall sit" };
  if (/\bdeadlift\b/.test(n) || /\brdl\b/.test(n) || /\bromanian\b/.test(n)) {
    return { pattern: "hinge", rule: "name:~deadlift|rdl|romanian" };
  }
  if (/\bhip thrust\b/.test(n))
    return { pattern: "hinge", rule: "name:~hip thrust" };
  if (/\bgood morning\b/.test(n))
    return { pattern: "hinge", rule: "name:~good morning" };
  if (/\b(kettlebell )?swing\b/.test(n))
    return { pattern: "hinge", rule: "name:~swing" };
  if (/\b(hyperextension|back extension|pull[- ]?through)\b/.test(n)) {
    return {
      pattern: "hinge",
      rule: "name:~hyperextension|back extension|pull-through",
    };
  }
  if (/\bglute bridge\b/.test(n) || (/\bbridge\b/.test(n) && mg === "glutes")) {
    return { pattern: "hinge", rule: "name:~glute bridge|glutes+bridge" };
  }
  if (/\bnordic\b/.test(n)) return { pattern: "hinge", rule: "name:~nordic" };
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
  if (/\bpush[- ]?up\b/.test(n))
    return { pattern: "push", rule: "name:~push-up" };
  if (/\bpushdown\b/.test(n) || /\bpress[- ]?down\b/.test(n)) {
    return { pattern: "push", rule: "name:~pushdown|press-down" };
  }
  if (/\bpress\b/.test(n)) return { pattern: "push", rule: "name:~press" };
  if (/\bdip\b/.test(n)) return { pattern: "push", rule: "name:~dip" };
  if (/\bfly\b/.test(n) || /\bflye\b/.test(n)) {
    return { pattern: "push", rule: "name:~fly" };
  }
  if (/\bkickback\b/.test(n))
    return { pattern: "push", rule: "name:~kickback" };
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
  return { pattern: FALLBACK[mg], rule: `fallback:${mg}→${FALLBACK[mg]}` };
}

function score(name: string): number {
  let s = 50;
  const n = name.toLowerCase();
  if (SKIP_NAME.test(n)) return -999;
  if (COMMON_BOOST.test(n)) s += 35;
  if (/\b(pike|handstand|wall walk|shoulder tap|dolphin|inverted)\b/.test(n))
    s += 40;
  if (/\bboxing|hook|jab|punch\b/.test(n)) s -= 50;
  s -= Math.max(0, n.length - 28) * 0.6;
  return s;
}

const curated: { name: string }[] = JSON.parse(readFileSync(CURATED, "utf8"));
const existing = new Set(curated.map((c) => c.name.toLowerCase()));

const rawAll: Raw[] = JSON.parse(readFileSync(SRC, "utf8"));
const hits: {
  name: string;
  muscleGroup: MuscleGroup;
  movementPattern: MovementPattern;
  movementRule: string;
  minEquipment: "bodyweight";
  instructions: string;
  sourceId: string;
  sourceBodyPart: string;
  sourceTarget: string;
  score: number;
  mapPath: string;
}[] = [];

for (const raw of rawAll) {
  if (raw.equipment.toLowerCase() !== "body weight") continue;
  if (SKIP_NAME.test(raw.name)) continue;
  const en = raw.instructions?.en?.trim();
  if (!en) continue;

  const override = muscleOverrideFromName(raw.name);
  const mg = mapMuscleGroup(raw);
  if (mg !== "shoulders") continue;

  const name = titleCaseName(raw.name);
  if (existing.has(name.toLowerCase())) continue;

  const move = inferMovement(raw.name, raw.target, mg);
  const mapPath = override
    ? `nameOverride→${override}`
    : raw.body_part.toLowerCase() === "shoulders"
      ? `body_part=shoulders`
      : `target=${raw.target} / body_part=${raw.body_part}`;

  hits.push({
    name,
    muscleGroup: "shoulders",
    movementPattern: move.pattern,
    movementRule: move.rule,
    minEquipment: "bodyweight",
    instructions: en,
    sourceId: raw.id,
    sourceBodyPart: raw.body_part,
    sourceTarget: raw.target,
    score: score(name),
    mapPath,
  });
}

hits.sort((a, b) => b.score - a.score);
console.log(`Found ${hits.length} bodyweight→shoulders candidates not already curated:\n`);
for (const h of hits) {
  console.log(
    JSON.stringify(
      {
        name: h.name,
        score: Math.round(h.score * 10) / 10,
        muscleGroup: h.muscleGroup,
        movementPattern: h.movementPattern,
        movementRule: h.movementRule,
        mapPath: h.mapPath,
        sourceBodyPart: h.sourceBodyPart,
        sourceTarget: h.sourceTarget,
        instructionsPreview: h.instructions.slice(0, 160) + "…",
      },
      null,
      2,
    ),
  );
  console.log("---");
}
