/** Split DB instruction prose into numbered steps for the detail UI. */
export function parseInstructionSteps(text?: string | null): string[] {
  if (!text?.trim()) return [];

  const normalized = text.trim().replace(/\s+/g, " ");

  // Prefer explicit numbered lists (1. … 2. …).
  const numbered = normalized
    .split(/(?=\d+\.\s)/)
    .map((s) => s.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
  if (numbered.length > 1) return numbered;

  // Fall back to sentence boundaries.
  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);
  if (sentences.length > 1) return sentences;

  return [normalized];
}

export type ExerciseTip = {
  title: string;
  body: string;
};

const TIPS_BY_PATTERN: Record<string, ExerciseTip[]> = {
  hinge: [
    {
      title: "Brace first",
      body: "Set your ribs down and squeeze your glutes before each rep so your lower back stays neutral.",
    },
    {
      title: "Hips lead",
      body: "Think about pushing your hips back — the movement comes from your hips, not from bending at the waist.",
    },
  ],
  squat: [
    {
      title: "Track your knees",
      body: "Let knees follow your toes. Keep heels planted and chest proud through the full range.",
    },
    {
      title: "Control the descent",
      body: "Lower with control, then drive up through mid-foot without bouncing at the bottom.",
    },
  ],
  push: [
    {
      title: "Stable shoulders",
      body: "Keep shoulder blades set — don't let elbows flare wildly on the way up or down.",
    },
    {
      title: "Full range",
      body: "Use a range you can control. Pause briefly at the hardest point before reversing.",
    },
  ],
  pull: [
    {
      title: "Lead with the back",
      body: "Initiate by pulling elbows toward your sides before you yank with your hands.",
    },
    {
      title: "No momentum",
      body: "Avoid swinging. A slight pause at the top makes each rep count.",
    },
  ],
  carry: [
    {
      title: "Stay stacked",
      body: "Keep ribs over hips and breathe steadily — bracing matters more than speed.",
    },
  ],
};

export function tipsForPattern(pattern?: string | null): ExerciseTip[] {
  if (!pattern) return TIPS_BY_PATTERN.carry;
  return TIPS_BY_PATTERN[pattern.toLowerCase()] ?? TIPS_BY_PATTERN.carry;
}

export function formatEquipmentLabel(equipment?: string | null): string {
  if (!equipment) return "Bodyweight";
  return equipment
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function formatPatternLabel(pattern?: string | null): string {
  if (!pattern) return "General";
  return pattern.charAt(0).toUpperCase() + pattern.slice(1);
}
