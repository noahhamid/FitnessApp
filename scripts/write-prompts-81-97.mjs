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

function prompt(equipment, left, right, critical) {
  return `${BASE} ${equipment} ${FRAME} LEFT pose — ${left} RIGHT pose — ${right} Critical: ${critical} IMPORTANT EQUIPMENT RULE: render the COMPLETE equipment described above in BOTH poses. ${END}`;
}

const items = [
  {
    id: 81,
    name: "Barbell Seated Overhead Press",
    slug: "barbell_seated_overhead_press",
    prompt: prompt(
      "FULL EQUIPMENT: (1) a COMPLETE upright workout bench with a backrest (or solid flat/incline bench used seated) in dark charcoal-black with thin warm-gold rim — full pad, legs, and frame visible; (2) a COMPLETE loaded barbell — silver-white shaft, dark charcoal plates with warm-gold rims — held at the front of the shoulders for an overhead press. SEATED overhead press (not standing).",
      "seated upright on the FULL bench, feet flat, barbell racked at the front of the shoulders, elbows bent, palms forward, torso braced.",
      "same seated position, arms fully extended pressing the FULL barbell straight overhead, elbows locked, bar over mid-foot/shoulders, full bench still visible under the character.",
      "must be seated on a full bench; full loaded barbell pressed overhead — not a dumbbell press, not standing.",
    ),
  },
  {
    id: 82,
    name: "Cable One Arm Lateral Raise",
    slug: "cable_one_arm_lateral_raise",
    prompt: prompt(
      "FULL EQUIPMENT: a COMPLETE cable machine / pulley tower on one side — full upright column, weight stack, and low pulley visible in dark charcoal-black with warm-gold rim highlights; ONE D-handle attached to the LOW pulley with a visible cable. ONE-ARM lateral raise (single working arm).",
      "standing beside the FULL cable tower, feet shoulder-width, holding the D-handle in the far hand with the arm hanging down beside the thigh, slight lean away from the stack, non-working hand on hip or lightly on the tower for balance.",
      "same stance, working arm raised straight out to the SIDE until parallel to the ground (lateral raise), cable taut from the LOW pulley to the hand, palm facing down, full tower and stack still fully visible.",
      "ONE arm only; cable comes from a low pulley; full cable tower always shown — not a dumbbell raise.",
    ),
  },
  {
    id: 83,
    name: "Cable Shoulder Press",
    slug: "cable_shoulder_press",
    prompt: prompt(
      "FULL EQUIPMENT: a COMPLETE dual cable machine / functional trainer — TWO upright towers with weight stacks and adjustable pulleys set at about SHOULDER height, dark charcoal-black with warm-gold rims; TWO D-handles (one in each hand) with visible cables. Standing cable shoulder press facing away from the stacks or between the towers.",
      "standing between/in front of the FULL dual cable towers, feet shoulder-width, both handles at shoulder height beside the ears, elbows bent ~90° pointing out, palms facing forward/slightly in.",
      "same stance, BOTH arms pressing the handles straight OVERHEAD until nearly locked out, cables taut from shoulder-height pulleys, full dual towers and stacks still fully visible behind/beside.",
      "dual cable towers with shoulder-height pulleys; two handles pressed overhead — not a barbell press, not laterals.",
    ),
  },
  {
    id: 84,
    name: "Barbell Lunge",
    slug: "barbell_lunge",
    prompt: prompt(
      "FULL EQUIPMENT: a COMPLETE loaded barbell resting across the UPPER BACK / traps (back squat style) — silver-white shaft, dark charcoal plates with warm-gold rims on both ends. FORWARD walking/static lunge with the bar on the back. No rack required but bar must be fully loaded and complete.",
      "standing tall feet hip-width, FULL barbell on the upper back, overhand grip, torso upright, ready to step.",
      "FORWARD LUNGE: front foot stepped ahead, front knee ~90°, rear knee lowered, torso upright, FULL barbell still sitting on the upper back traps.",
      "barbell on the BACK (not front rack); clear forward lunge step — distinct from dumbbell lunges.",
    ),
  },
  {
    id: 85,
    name: "Glute-ham Raise",
    slug: "glute_ham_raise",
    prompt: prompt(
      "FULL EQUIPMENT: a COMPLETE glute-ham raise (GHD) machine — padded thigh pads, ankle/heel roller hooks, and a curved or angled frame in dark charcoal-black with thin warm-gold rim highlights. Face-down GHD raise (not a back extension only).",
      "face down on the FULL GHD, ankles locked under the heel rollers, thighs on the pads, torso hanging down toward the floor (knees bent or hips flexed) — bottom of the raise.",
      "same machine lock-in, character curls up by extending the hips/knees until the torso is in a straight line with the thighs, chest up, arms crossed on chest or at sides — top of the glute-ham raise.",
      "must show the COMPLETE GHD machine with ankles secured; this is a glute-ham raise (hips + hamstrings), not a floor bridge.",
    ),
  },
  {
    id: 86,
    name: "Inverse Leg Curl (bench Support)",
    slug: "inverse_leg_curl_bench_support",
    prompt: prompt(
      "FULL EQUIPMENT: a COMPLETE flat workout bench in dark charcoal-black with warm-gold rim — full pad, legs, and frame. Bodyweight inverse / Nordic-style leg curl with hips supported on the edge of the bench (ankles can be imagined fixed or lightly braced). Face-down, curling legs toward glutes.",
      "face down with hips at the edge of the FULL bench, hands holding the bench for support, legs extended straight behind, body long.",
      "same setup, knees bent curling the heels toward the glutes (hamstring curl), upper body still braced on the FULL bench.",
      "full bench as support; clear knee-flexion hamstring curl from extended to curled — not a hip bridge.",
    ),
  },
  {
    id: 87,
    name: "Inverse Leg Curl (on Pull-up Cable Machine)",
    slug: "inverse_leg_curl_cable_machine",
    prompt: prompt(
      "FULL EQUIPMENT: (1) a COMPLETE cable / lat-pulldown style station or low bench attachment with a FULL tower/stack in dark charcoal-black with warm-gold rims; (2) ankle straps or low cable attached to BOTH ankles. Face-down inverse leg curl using the cable for resistance.",
      "lying face down on the bench/pad facing away from the FULL cable tower, legs extended, ankle straps attached, hands holding handles/pad for stability.",
      "same face-down setup, knees curling heels toward glutes against cable tension, straps and FULL tower still clearly visible.",
      "cable tower + ankle straps + face-down leg curl — not a standing curl, not a deadlift.",
    ),
  },
  {
    id: 88,
    name: "Kick Out Sit",
    slug: "kick_out_sit",
    prompt: prompt(
      "FULL EQUIPMENT: a COMPLETE flat workout bench or sturdy chair in dark charcoal-black with warm-gold rim. Seated kick-out: sit on the edge, lean back slightly, hands on the edge for support, then extend both legs straight out in front.",
      "seated on the edge of the FULL bench, feet flat on the ground, knees bent ~90°, hands gripping the bench edge, slight lean back.",
      "same seated lean-back support, BOTH legs extended straight out in front parallel to the ground (kick-out), toes pointed slightly up, hands still on the FULL bench.",
      "seated on a full bench with a clear kick-out leg extension — not a squat, not a deadlift.",
    ),
  },
  {
    id: 89,
    name: "Self Assisted Inverse Leg Curl",
    slug: "self_assisted_inverse_leg_curl",
    prompt: prompt(
      "FULL EQUIPMENT: optional thin exercise mat on the near-black void is fine but keep BG flat #0E0E10. Bodyweight self-assisted inverse leg curl: lying on the back, knees curling thighs toward chest (or heels toward glutes) with hands assisting at the sides/under glutes. No machine.",
      "lying flat on the back, legs extended, hands by the sides or under the glutes for support.",
      "same supine position, knees bent bringing thighs toward the chest / heels curling in (self-assisted inverse curl), hands still supporting at the sides.",
      "supine on the floor, clear knee curl toward chest — not a bridge, not a sit-up crunch only.",
    ),
  },
  {
    id: 90,
    name: "Single Leg Platform Slide",
    slug: "single_leg_platform_slide",
    prompt: prompt(
      "FULL EQUIPMENT: a COMPLETE low slide board / gliding platform or slider disc under ONE foot, dark charcoal with warm-gold rim. Standing single-leg platform slide: one foot slides backward while the standing leg bends slightly.",
      "standing tall with ONE foot on the FULL slide platform and the other planted, hands on hips or lightly out for balance, knees soft.",
      "same setup, the platform foot slid BACKWARD extending that leg, standing knee bent in a soft single-leg hinge/lunge-like slide, torso upright, full platform still under the sliding foot.",
      "one foot on a visible slide platform sliding back — not a lunge without a platform, not a squat.",
    ),
  },
  {
    id: 91,
    name: "Standing Single Leg Curl",
    slug: "standing_single_leg_curl",
    prompt: prompt(
      "FULL EQUIPMENT: none required beyond bodyweight (hands on hips). Standing single-leg hamstring curl: curl one heel toward the glute while balancing on the other leg.",
      "standing on BOTH feet hip-width, hands on hips, torso upright, ready.",
      "standing on ONE leg, the free heel curled UP toward the glute (knee bent ~90°+), standing knee soft, hands on hips for balance.",
      "clear standing single-leg heel-to-glute curl — not a kickback hip extension, not a deadlift.",
    ),
  },
  {
    id: 92,
    name: "Band Stiff Leg Deadlift",
    slug: "band_stiff_leg_deadlift",
    prompt: prompt(
      "FULL EQUIPMENT: a COMPLETE resistance band looped under BOTH feet and held in BOTH hands in front of the thighs — band colored warm mustard-gold or charcoal with gold edges. Stiff-leg / Romanian-style hip hinge with the band (slight knee bend, hips push back).",
      "standing tall feet on the band, holding the band with both hands at the thighs, soft knees, chest up.",
      "hip hinge: torso tipped forward, hips pushed back, band stretched toward the shins/ankles, slight knee bend, flat back, then implied return — bottom of the stiff-leg deadlift.",
      "band under feet + hip hinge stiff-leg pattern — not a squat, not a conventional floor deadlift with a barbell.",
    ),
  },
  {
    id: 93,
    name: "Band Straight Leg Deadlift",
    slug: "band_straight_leg_deadlift",
    prompt: prompt(
      "FULL EQUIPMENT: a COMPLETE resistance band under BOTH feet held in BOTH hands, warm mustard-gold or charcoal with gold edges. STRAIGHT-LEG deadlift hinge — knees nearly locked/straighter than a soft RDL, torso tips forward.",
      "standing tall feet on the band, hands holding band at thighs, legs nearly straight, chest up.",
      "straight-leg hinge: torso folded forward toward the band near the feet, knees almost locked (minimal bend), flat back, hamstrings stretched — bottom position.",
      "emphasize nearly straight legs (straighter than #92); band under feet — not a barbell move.",
    ),
  },
  {
    id: 94,
    name: "Dumbbell Deadlift",
    slug: "dumbbell_deadlift",
    prompt: prompt(
      "FULL EQUIPMENT: TWO dumbbells (one in EACH hand) in dark charcoal with warm-gold rims. Conventional dumbbell deadlift from a low position — bend hips AND knees to pick the bells up near the floor, then stand tall.",
      "standing tall feet shoulder-width, TWO dumbbells hanging at the sides against the thighs, arms straight, chest up (top/lockout).",
      "deadlift bottom: hips and knees bent, torso hinged, TWO dumbbells lowered close to the floor beside the feet (or just above), flat back, ready to drive up — clearly a floor-style deadlift, not an RDL mid-shin float only.",
      "two dumbbells; conventional deadlift with knee bend from a low position — distinct from Romanian (less knee bend, mid-shin).",
    ),
  },
  {
    id: 95,
    name: "Dumbbell Romanian Deadlift",
    slug: "dumbbell_romanian_deadlift",
    prompt: prompt(
      "FULL EQUIPMENT: TWO dumbbells (one in EACH hand) in dark charcoal with warm-gold rims. Romanian deadlift (RDL): soft knees, push hips back, lower dumbbells along the thighs to about mid-shin, then drive hips forward. Starts from the TOP.",
      "standing tall feet hip/shoulder-width, TWO dumbbells at the sides of the thighs, soft knees, chest up.",
      "RDL bottom: hips pushed FAR back, torso hinged forward ~45–60°, soft knee bend, dumbbells sliding along the legs to about mid-shin (NOT on the floor), flat back, hamstrings stretched.",
      "classic RDL — soft knees, mid-shin depth, not a floor deadlift; two dumbbells.",
    ),
  },
  {
    id: 96,
    name: "Dumbbell Single Leg Deadlift",
    slug: "dumbbell_single_leg_deadlift",
    prompt: prompt(
      "FULL EQUIPMENT: ONE or TWO dumbbells — prefer ONE dumbbell in the hand opposite the standing leg (or both hands) in dark charcoal with warm-gold rim. Single-leg Romanian deadlift: hinge on one leg while the free leg extends behind.",
      "standing on ONE leg holding the dumbbell(s), free leg lightly lifted behind/ready, torso upright, soft standing knee.",
      "single-leg RDL: torso hinged forward toward parallel, free leg extended straight BACK as a counterbalance, dumbbell(s) lowering toward the ground, standing knee soft, flat back — T-shape body line.",
      "must show only one foot on the ground and a clear single-leg hinge — not a two-foot RDL.",
    ),
  },
  {
    id: 97,
    name: "Dumbbell Stiff Leg Deadlift",
    slug: "dumbbell_stiff_leg_deadlift",
    prompt: prompt(
      "FULL EQUIPMENT: TWO dumbbells (one in EACH hand) in dark charcoal with warm-gold rims. Stiff-leg deadlift: hips hinge with MINIMAL knee bend (stiffer than RDL), dumbbells travel down the legs.",
      "standing tall feet shoulder-width, TWO dumbbells at the thighs, legs nearly straight, chest up.",
      "stiff-leg hinge bottom: torso tipped forward, knees almost locked with only a tiny soft bend, dumbbells lowered along the legs toward mid-shin/ankles, flat back, strong hamstring stretch.",
      "stiffer legs than a soft RDL (#95); two dumbbells; hinge not squat.",
    ),
  },
];

writeFileSync(
  join(ROOT, "scripts/data/exercise-image-prompts.json"),
  JSON.stringify(items, null, 2) + "\n",
);

console.log(`Wrote ${items.length} prompts (ids ${items[0].id}-${items.at(-1).id}) → need ${items.length} more files to reach ~${83 + items.length}`);
