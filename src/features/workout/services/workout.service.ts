export const MUSCLE_GROUPS = [
  "All",
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
  "Cardio",
];

export const EXERCISES = [
  { id: "e1", name: "Bench Press", muscle: "Chest", icon: "🏋️", tag: "Compound" },
  { id: "e2", name: "Incline DB Press", muscle: "Chest", icon: "💪", tag: "Compound" },
  { id: "e3", name: "Cable Fly", muscle: "Chest", icon: "🔁", tag: "Isolation" },
  { id: "e4", name: "Push-Up", muscle: "Chest", icon: "⬆️", tag: "Bodyweight" },
  { id: "e5", name: "Deadlift", muscle: "Back", icon: "🏋️", tag: "Compound" },
  { id: "e6", name: "Pull-Up", muscle: "Back", icon: "⬆️", tag: "Bodyweight" },
  { id: "e7", name: "Barbell Row", muscle: "Back", icon: "💪", tag: "Compound" },
  { id: "e8", name: "Lat Pulldown", muscle: "Back", icon: "🔁", tag: "Machine" },
  { id: "e9", name: "OHP", muscle: "Shoulders", icon: "🏋️", tag: "Compound" },
  { id: "e10", name: "Lateral Raise", muscle: "Shoulders", icon: "🔁", tag: "Isolation" },
  { id: "e11", name: "Face Pull", muscle: "Shoulders", icon: "🔁", tag: "Isolation" },
  { id: "e12", name: "Barbell Curl", muscle: "Arms", icon: "💪", tag: "Isolation" },
  { id: "e13", name: "Tricep Pushdown", muscle: "Arms", icon: "🔁", tag: "Isolation" },
  { id: "e14", name: "Hammer Curl", muscle: "Arms", icon: "💪", tag: "Isolation" },
  { id: "e15", name: "Squat", muscle: "Legs", icon: "🏋️", tag: "Compound" },
  { id: "e16", name: "Romanian Deadlift", muscle: "Legs", icon: "🏋️", tag: "Compound" },
  { id: "e17", name: "Leg Press", muscle: "Legs", icon: "🔁", tag: "Machine" },
  { id: "e18", name: "Lunges", muscle: "Legs", icon: "⬆️", tag: "Compound" },
  { id: "e19", name: "Plank", muscle: "Core", icon: "⬆️", tag: "Bodyweight" },
  { id: "e20", name: "Cable Crunch", muscle: "Core", icon: "🔁", tag: "Isolation" },
  { id: "e21", name: "Hanging Leg Raise", muscle: "Core", icon: "⬆️", tag: "Bodyweight" },
  { id: "e22", name: "Treadmill Run", muscle: "Cardio", icon: "🏃", tag: "Cardio" },
  { id: "e23", name: "Rowing Machine", muscle: "Cardio", icon: "🚣", tag: "Cardio" },
  { id: "e24", name: "Jump Rope", muscle: "Cardio", icon: "🪢", tag: "Cardio" },
];

export const WORKOUT_HISTORY = [
  {
    id: "h1",
    date: "Mon, May 5",
    name: "Upper Body Strength",
    duration: "52 min",
    volume: "8,240 kg",
    sets: 18,
    exercises: ["Bench Press", "OHP", "Barbell Row"],
  },
  {
    id: "h2",
    date: "Wed, May 7",
    name: "Leg Day",
    duration: "48 min",
    volume: "12,600 kg",
    sets: 20,
    exercises: ["Squat", "Romanian Deadlift", "Leg Press"],
  },
  {
    id: "h3",
    date: "Fri, May 9",
    name: "Push Day",
    duration: "44 min",
    volume: "6,800 kg",
    sets: 16,
    exercises: ["Bench Press", "Incline DB Press", "Cable Fly"],
  },
];

export const VOLUME_SPARKLINE = [6200, 8400, 7100, 12600, 6800, 8200];

export const WORKOUT_TEMPLATES = [
  { id: "t1", name: "PUSH DAY", tag: "Chest · Shoulders · Triceps", icon: "💪" },
  { id: "t2", name: "PULL DAY", tag: "Back · Biceps", icon: "🏋️" },
  { id: "t3", name: "LEG DAY", tag: "Quads · Hamstrings · Glutes", icon: "🦵" },
  { id: "t4", name: "FULL BODY", tag: "All Muscle Groups", icon: "⚡" },
];

export const PHOTO_PLACEHOLDERS = [
  { id: "p1", date: "May 1", uri: null as string | null, label: "Front" },
  { id: "p2", date: "May 1", uri: null as string | null, label: "Side" },
  { id: "p3", date: "Apr 15", uri: null as string | null, label: "Front" },
];
