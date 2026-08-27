import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const BASE =
  "Minimalist soft-3D illustrated fitness character, male with masculine proportions (broader shoulders, narrower hips), faceless (smooth blank face, no eyes/mouth/nose), short cropped amber-brown hair, off-white/cream skin with soft subtle shading, athletic build with visible muscle definition — broad shoulders, defined chest, toned arms and legs, moderate muscle tone like a fit gym-goer, NOT bulky or bodybuilder-sized. Wearing a solid mustard-gold sleeveless tank top and dark charcoal athletic shorts, gold-toned athletic shoes.";

const FRAME =
  "Character shown from a 3/4 SIDE ANGLE, same perspective throughout. Background is completely flat solid near-black (#0E0E10), no floor line, no shadow, no extra gym clutter, no gradient. Landscape canvas, width clearly greater than height (3:2 ratio). Two poses of the exact same character arranged side by side, left to right, evenly spaced, same scale, same 3/4 angle:";

const END =
  "A single thin warm-gold arrow with a soft outer glow between the two poses, pointing toward the right pose. No text anywhere in the image. Clean minimal composition. Output only the raw illustration image, no labels, no captions, no UI overlays, no biomechanics annotations, no red muscle highlights.";

function p(equipment, left, right, critical) {
  return `${BASE} ${equipment} ${FRAME} LEFT pose — ${left} RIGHT pose — ${right} Critical: ${critical} IMPORTANT EQUIPMENT RULE: render the COMPLETE equipment in BOTH poses. ${END}`;
}

const items = [
  {
    id: 102,
    name: "Dumbbell Incline Raise",
    slug: "dumbbell_incline_raise",
    prompt: p(
      "FULL EQUIPMENT: (1) a COMPLETE INCLINE workout bench set to ~30–45° (head UP, feet DOWN) — full pad, legs, frame in dark charcoal-black with warm-gold rim; (2) TWO dumbbells (one per hand) in dark charcoal with warm-gold rims. INCLINE LATERAL RAISE — lying on an incline bench (NOT seated press, NOT flat fly).",
      "lying BACK on the FULL INCLINE bench (head higher than hips), BOTH dumbbells hanging straight down beside the bench toward the floor, arms long, slight elbow bend.",
      "SAME incline bench, BOTH arms raise straight out to the SIDES (lateral raise path) until parallel to the floor — dumbbells at shoulder height beside the body, NOT pressed overhead, NOT a chest fly arc.",
      "must be INCLINE bench lateral raise (arms go OUT to sides); NOT seated shoulder press; NOT decline; NOT upright row; two dumbbells only.",
    ),
  },
  {
    id: 103,
    name: "Dumbbell Deadlift",
    slug: "dumbbell_deadlift",
    prompt: p(
      "FULL EQUIPMENT: TWO dumbbells on/near the FLOOR (one beside each foot) in dark charcoal with warm-gold rims. CONVENTIONAL deadlift — deep knee AND hip bend to pick bells from the ground, then stand tall. NOT a squat with bells at sides throughout; bells start LOW on the floor.",
      "bottom position: deep hip hinge + knee bend, BOTH dumbbells on the ground beside the feet (or just above), flat back, chest up, ready to pull.",
      "lockout: standing tall feet hip-width, BOTH dumbbells hanging at the sides against the thighs, arms straight, chest up — clearly finished a floor deadlift pull.",
      "conventional floor deadlift with TWO dumbbells; deeper knee bend than RDL; bells touch/near floor on left; NOT a squat-only pattern without floor start.",
    ),
  },
  {
    id: 104,
    name: "Dumbbell Straight Leg Deadlift",
    slug: "dumbbell_straight_leg_deadlift",
    prompt: p(
      "FULL EQUIPMENT: TWO dumbbells in dark charcoal with warm-gold rims. STRAIGHT-LEG deadlift — knees NEARLY LOCKED (minimal bend), hips hinge, bells slide down legs. Distinct from soft-knee RDL.",
      "standing tall, legs almost straight, TWO dumbbells at the thighs, chest up.",
      "straight-leg hinge: torso folded forward, knees almost locked, dumbbells lowered along the legs toward the ANKLES/shins (deeper than mid-shin RDL), flat back, hamstrings stretched.",
      "stiffer straighter legs than Romanian deadlift; two dumbbells; hinge NOT squat; NOT single-leg.",
    ),
  },
  {
    id: 105,
    name: "Barbell Deadlift",
    slug: "barbell_deadlift",
    prompt: p(
      "FULL EQUIPMENT: a COMPLETE loaded barbell ON THE FLOOR — silver-white shaft, dark charcoal plates with warm-gold rims. CONVENTIONAL barbell deadlift from the ground (not RDL from standing, not sumo wide stance). Hands outside knees, overhand grip.",
      "setup at the FLOOR: barbell resting on the ground, character bent over gripping the bar just outside the shins, hips back, chest up, flat back, knees bent ready to pull.",
      "lockout standing tall: FULL barbell at the thighs/hips, arms straight, shoulders back, plates off the floor — finished conventional deadlift.",
      "barbell starts ON THE FLOOR in left pose; conventional stance (not ultra-wide sumo); NOT hip-hinge-only RDL from standing top.",
    ),
  },
  {
    id: 106,
    name: "Barbell Good Morning",
    slug: "barbell_good_morning",
    prompt: p(
      "FULL EQUIPMENT: a COMPLETE loaded barbell across the UPPER BACK / traps (back squat position) — silver shaft, dark charcoal plates with warm-gold rims. Good morning hip hinge — bar stays on the BACK, NOT held in front, NOT on the floor.",
      "standing tall, barbell on the UPPER BACK traps, feet hip-width, overhand grip on the bar, chest up.",
      "good morning hinge: hips push BACK, torso tips forward ~ parallel, knees SOFT slight bend, bar STILL on the upper back traps, NOT lowered to the floor — hip hinge only.",
      "bar on BACK (not front rack, not floor deadlift); standing hip hinge; full barbell on traps in BOTH poses.",
    ),
  },
  {
    id: 107,
    name: "Barbell Romanian Deadlift",
    slug: "barbell_romanian_deadlift",
    prompt: p(
      "FULL EQUIPMENT: a COMPLETE loaded barbell held in front of the thighs with overhand grip — silver shaft, dark charcoal plates with warm-gold rims. ROMANIAN deadlift (RDL) starting from TOP — soft knees, bar slides down thighs to mid-shin, NOT from floor.",
      "standing tall, barbell hanging at the thighs in front of the legs, soft knees, chest up.",
      "RDL bottom: hips pushed far back, torso hinged, SOFT knee bend, barbell slides down the thighs to about mid-shin (bar OFF the floor), flat back.",
      "RDL from standing top (not floor deadlift); bar in front of legs; mid-shin depth; softer knees than stiff-leg; NOT good morning with bar on back.",
    ),
  },
  {
    id: 108,
    name: "Barbell Single Leg Deadlift",
    slug: "barbell_single_leg_deadlift",
    prompt: p(
      "FULL EQUIPMENT: a COMPLETE loaded barbell held in BOTH hands in front of the thighs — silver shaft, dark charcoal plates with warm-gold rims. Single-leg RDL: ONE foot on ground, free leg extends straight BACK, T-shape.",
      "standing on ONE leg, barbell at the thighs, free leg lightly lifted behind, soft standing knee.",
      "single-leg hinge: torso near parallel, free leg extended straight BACK, barbell lowering toward the floor in front of the standing leg, T-line body, ONE foot only on ground.",
      "must show ONE standing leg + one extended back leg; barbell in hands; NOT two-foot RDL; NOT conventional floor deadlift.",
    ),
  },
  {
    id: 109,
    name: "Barbell Sumo Deadlift",
    slug: "barbell_sumo_deadlift",
    prompt: p(
      "FULL EQUIPMENT: a COMPLETE loaded barbell ON THE FLOOR — silver shaft, dark charcoal plates with warm-gold rims. SUMO deadlift: FEET VERY WIDE, toes pointed out, hands grip the bar INSIDE the knees (narrow grip between legs).",
      "wide sumo setup: feet spread wide, toes out, bar on floor between legs, hands gripping bar INSIDE knees, hips low, chest up.",
      "sumo lockout: standing tall in the SAME wide stance, barbell at the hips/thighs, arms straight, plates off floor — clearly sumo not conventional.",
      "ultra-wide stance + hands inside knees; bar on floor left pose; distinct from conventional barbell deadlift.",
    ),
  },
  {
    id: 110,
    name: "Cable Deadlift",
    slug: "cable_deadlift",
    prompt: p(
      "FULL EQUIPMENT: a COMPLETE cable machine / functional trainer with LOW pulleys and weight stacks in dark charcoal-black with warm-gold rims; TWO D-handles or a straight bar attached to LOW pulleys with visible cables. Standing cable pull / deadlift pattern — NOT a barbell on the floor.",
      "standing facing the FULL cable towers, feet hip-width, holding both low-pulley handles at the thighs, cables taut, slight knee bend.",
      "hip hinge pulling the handles down along the legs toward the shins (cable resistance), hips back, flat back, cables still attached to the LOW pulleys, full towers visible.",
      "CABLE machine with low pulleys — NO barbell; full dual towers visible; hip hinge with cable handles NOT free weights.",
    ),
  },
  {
    id: 111,
    name: "Basic Toe Touch",
    slug: "basic_toe_touch",
    prompt: p(
      "FULL EQUIPMENT: none — bodyweight only. Standing toe touch / forward fold hamstring stretch. NO barbell, NO dumbbells, NO bench, NO cable.",
      "standing tall feet hip-width, arms at sides or reaching overhead, upright torso.",
      "forward fold: hips hinge, torso bent forward, BOTH hands reaching down toward the toes/shins, knees soft or slightly bent, hamstring stretch — clearly a toe touch stretch NOT a weighted deadlift.",
      "bodyweight stretch only; hands toward toes; NO equipment anywhere; NOT confused with RDL/deadlift.",
    ),
  },
];

writeFileSync(
  join(ROOT, "scripts/data/exercise-image-prompts.json"),
  JSON.stringify(items, null, 2) + "\n",
);

const md = [
  "# Next 10 prompts (#102–111)",
  "",
  "Save each JPG using the exercise name. No sharing files between exercises.",
  "",
];
for (const x of items) {
  md.push(`## ${x.id}. ${x.name}`, "", "```", x.prompt, "```", "");
}
writeFileSync(join(ROOT, "scripts/data/prompts-102-111.md"), md.join("\n") + "\n");
console.log(items.map((x) => `${x.id}: ${x.name}`).join("\n"));
