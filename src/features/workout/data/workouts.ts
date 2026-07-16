export type ExerciseType = "reps" | "duration";

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  sets: number;
  reps?: number;       // for type "reps"
  durationSec?: number; // for type "duration"
  restSec: number;      // rest after each set
  imageUrl: string;
  instructions: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  tag: string;
  coverImage: string;
  exercises: Exercise[];
}

export const LOWER_BODY_WORKOUT: WorkoutPlan = {
  id: "lower-body",
  title: "Lower Body Workout",
  tag: "Cardio",
  coverImage:
    "https://hips.hearstapps.com/hmg-prod/images/muscular-shirtless-man-exercising-with-weights-in-royalty-free-image-1700572250.jpg?crop=0.88847xw:1xh;center,top&resize=1200:*https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
  exercises: [
    {
      id: "bw-squat",
      name: "Bodyweight Squats",
      type: "reps",
      sets: 3,
      reps: 15,
      restSec: 30,
      imageUrl:
        "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=600&q=80",
      instructions:
        "Feet shoulder-width apart, lower hips back and down until thighs are parallel to the floor, drive through heels to stand.",
    },
    {
      id: "walking-lunge",
      name: "Walking Lunges",
      type: "reps",
      sets: 3,
      reps: 12,
      restSec: 30,
      imageUrl:
        "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&q=80",
      instructions:
        "Step forward into a lunge, back knee toward the floor, push off front foot into the next step. 12 reps per leg.",
    },
    {
      id: "glute-bridge",
      name: "Glute Bridges",
      type: "reps",
      sets: 3,
      reps: 15,
      restSec: 20,
      imageUrl:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
      instructions:
        "Lie on your back, knees bent, feet flat. Drive hips up squeezing glutes at the top, lower with control.",
    },
    {
      id: "bulgarian-split-squat",
      name: "Bulgarian Split Squats",
      type: "reps",
      sets: 3,
      reps: 10,
      restSec: 30,
      imageUrl:
        "https://images.unsplash.com/photo-1517344368193-41552b6ad3f5?w=600&q=80",
      instructions:
        "Rear foot elevated on a bench, lower back knee toward the floor, drive through front heel. 10 reps per leg.",
    },
    {
      id: "wall-sit",
      name: "Wall Sit",
      type: "duration",
      sets: 3,
      durationSec: 30,
      restSec: 30,
      imageUrl:
        "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&q=80",
      instructions:
        "Back flat against a wall, knees at 90 degrees, hold the position without letting hips drop.",
    },
    {
      id: "calf-raise",
      name: "Calf Raises",
      type: "reps",
      sets: 3,
      reps: 20,
      restSec: 20,
      imageUrl:
        "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&q=80",
      instructions:
        "Stand tall, rise onto the balls of your feet, pause at the top, lower slowly back down.",
    },
  ],
};

// Add these to WORKOUT_PLANS in data/workouts.ts

export const WORKOUT_PLANS: Record<string, WorkoutPlan> = {
  "lower-body": LOWER_BODY_WORKOUT,

  "upper-body": {
    id: "upper-body",
    title: "Upper Body Workout",
    tag: "Strength",
    coverImage:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    exercises: [
      {
        id: "push-up",
        name: "Push Ups",
        type: "reps",
        sets: 4,
        reps: 15,
        restSec: 30,
        imageUrl:
          "https://images.unsplash.com/photo-1598971639058-fab3c3109a34?w=600&q=80",
        instructions:
          "Hands shoulder-width apart, lower chest to the floor keeping your core tight, push back up to full arm extension.",
      },
      {
        id: "pike-push-up",
        name: "Pike Push Ups",
        type: "reps",
        sets: 3,
        reps: 10,
        restSec: 30,
        imageUrl:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
        instructions:
          "Form an inverted V with hips high, bend elbows to lower your head toward the floor, press back up. Targets shoulders.",
      },
      {
        id: "tricep-dip",
        name: "Tricep Dips",
        type: "reps",
        sets: 3,
        reps: 12,
        restSec: 30,
        imageUrl:
          "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&q=80",
        instructions:
          "Hands on a chair behind you, lower your body by bending elbows to 90 degrees, press back up. Keep elbows close.",
      },
      {
        id: "diamond-push-up",
        name: "Diamond Push Ups",
        type: "reps",
        sets: 3,
        reps: 10,
        restSec: 30,
        imageUrl:
          "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=600&q=80",
        instructions:
          "Form a diamond shape with thumbs and index fingers below your chest. Lower and press, keeping elbows tucked.",
      },
      {
        id: "plank-shoulder-tap",
        name: "Plank Shoulder Taps",
        type: "duration",
        sets: 3,
        durationSec: 40,
        restSec: 20,
        imageUrl:
          "https://images.unsplash.com/photo-1566241142248-38d0b3527c8e?w=600&q=80",
        instructions:
          "High plank position, tap each shoulder alternately while keeping hips square and core braced throughout.",
      },
      {
        id: "wide-push-up",
        name: "Wide Grip Push Ups",
        type: "reps",
        sets: 3,
        reps: 12,
        restSec: 25,
        imageUrl:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
        instructions:
          "Hands wider than shoulder width, lower chest to floor, press up. Emphasizes the outer chest more than standard push ups.",
      },
    ],
  },

  "full-body": {
    id: "full-body",
    title: "Full Body Burn",
    tag: "HIIT",
    coverImage:
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&q=80",
    exercises: [
      {
        id: "burpees",
        name: "Burpees",
        type: "reps",
        sets: 4,
        reps: 10,
        restSec: 30,
        imageUrl:
          "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&q=80",
        instructions:
          "Drop to a squat, kick feet back to plank, do a push up, jump feet to hands, then explode upward with arms overhead.",
      },
      {
        id: "jump-squat",
        name: "Jump Squats",
        type: "reps",
        sets: 4,
        reps: 12,
        restSec: 25,
        imageUrl:
          "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=600&q=80",
        instructions:
          "Squat down to parallel then explode upward, land softly with bent knees and immediately lower into the next rep.",
      },
      {
        id: "mountain-climber",
        name: "Mountain Climbers",
        type: "duration",
        sets: 4,
        durationSec: 30,
        restSec: 20,
        imageUrl:
          "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&q=80",
        instructions:
          "High plank, drive knees to chest alternately as fast as possible. Keep hips level and core engaged the whole time.",
      },
      {
        id: "push-up-rotation",
        name: "Push Up with Rotation",
        type: "reps",
        sets: 3,
        reps: 10,
        restSec: 30,
        imageUrl:
          "https://images.unsplash.com/photo-1598971639058-fab3c3109a34?w=600&q=80",
        instructions:
          "Do a push up, then rotate to a side plank raising one arm to the ceiling. Alternate sides each rep.",
      },
      {
        id: "high-knees",
        name: "High Knees",
        type: "duration",
        sets: 4,
        durationSec: 30,
        restSec: 15,
        imageUrl:
          "https://images.unsplash.com/photo-1517344368193-41552b6ad3f5?w=600&q=80",
        instructions:
          "Run in place driving knees up to hip height, pumping arms in rhythm. Stay on the balls of your feet throughout.",
      },
      {
        id: "lunge-jump",
        name: "Lunge Jumps",
        type: "reps",
        sets: 3,
        reps: 10,
        restSec: 30,
        imageUrl:
          "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&q=80",
        instructions:
          "Lunge forward, jump and switch legs in the air, land in a lunge on the opposite side. 10 reps each leg.",
      },
      {
        id: "plank-hold",
        name: "Plank Hold",
        type: "duration",
        sets: 3,
        durationSec: 45,
        restSec: 20,
        imageUrl:
          "https://images.unsplash.com/photo-1566241142248-38d0b3527c8e?w=600&q=80",
        instructions:
          "Forearms on floor, body in a straight line from head to heels. Squeeze every muscle and breathe steadily.",
      },
      {
        id: "star-jump",
        name: "Star Jumps",
        type: "reps",
        sets: 3,
        reps: 15,
        restSec: 20,
        imageUrl:
          "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&q=80",
        instructions:
          "Jump feet wide and arms out to form a star shape at the top, land softly with feet together and arms down.",
      },
    ],
  },

  "core-blast": {
    id: "core-blast",
    title: "Core Blast",
    tag: "Core",
    coverImage:
      "https://images.unsplash.com/photo-1566241142248-38d0b3527c8e?w=800&q=80",
    exercises: [
      {
        id: "crunch",
        name: "Crunches",
        type: "reps",
        sets: 3,
        reps: 20,
        restSec: 20,
        imageUrl:
          "https://images.unsplash.com/photo-1566241142248-38d0b3527c8e?w=600&q=80",
        instructions:
          "Lie on back, knees bent, hands behind head. Lift shoulder blades off the floor contracting the abs, lower with control.",
      },
      {
        id: "bicycle-crunch",
        name: "Bicycle Crunches",
        type: "reps",
        sets: 3,
        reps: 16,
        restSec: 20,
        imageUrl:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
        instructions:
          "Alternate bringing opposite elbow to knee while extending the other leg. Slow and controlled beats fast and sloppy.",
      },
      {
        id: "plank",
        name: "Plank Hold",
        type: "duration",
        sets: 3,
        durationSec: 45,
        restSec: 20,
        imageUrl:
          "https://images.unsplash.com/photo-1566241142248-38d0b3527c8e?w=600&q=80",
        instructions:
          "Forearms on floor, body straight, squeeze glutes and abs. Don't let hips rise or sag.",
      },
      {
        id: "leg-raise",
        name: "Leg Raises",
        type: "reps",
        sets: 3,
        reps: 15,
        restSec: 25,
        imageUrl:
          "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&q=80",
        instructions:
          "Lie flat, hands under hips. Raise straight legs to 90 degrees then lower slowly without letting feet touch the floor.",
      },
      {
        id: "russian-twist",
        name: "Russian Twists",
        type: "reps",
        sets: 3,
        reps: 20,
        restSec: 20,
        imageUrl:
          "https://images.unsplash.com/photo-1566241142248-38d0b3527c8e?w=600&q=80",
        instructions:
          "Seated with feet raised, lean back slightly, rotate torso side to side tapping the floor each time. 20 total touches.",
      },
      {
        id: "dead-bug",
        name: "Dead Bug",
        type: "reps",
        sets: 3,
        reps: 12,
        restSec: 20,
        imageUrl:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
        instructions:
          "On your back, arms up, knees at 90°. Slowly extend opposite arm and leg toward the floor, return and switch sides.",
      },
    ],
  },

  "mobility-flow": {
    id: "mobility-flow",
    title: "Mobility & Stretch",
    tag: "Recovery",
    coverImage:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    exercises: [
      {
        id: "cat-cow",
        name: "Cat-Cow Stretch",
        type: "duration",
        sets: 2,
        durationSec: 40,
        restSec: 10,
        imageUrl:
          "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
        instructions:
          "On hands and knees, alternate between arching your back upward (cat) and letting it sag downward (cow) slowly.",
      },
      {
        id: "hip-flexor-stretch",
        name: "Hip Flexor Stretch",
        type: "duration",
        sets: 2,
        durationSec: 30,
        restSec: 10,
        imageUrl:
          "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&q=80",
        instructions:
          "Lunge forward, drop back knee to ground. Push hips forward gently to feel the stretch through the front of your hip. Both sides.",
      },
      {
        id: "thoracic-rotation",
        name: "Thoracic Rotation",
        type: "reps",
        sets: 2,
        reps: 10,
        restSec: 10,
        imageUrl:
          "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
        instructions:
          "Seated or kneeling, hands behind head, rotate upper body as far as comfortable each direction. 10 reps per side.",
      },
      {
        id: "pigeon-pose",
        name: "Pigeon Pose",
        type: "duration",
        sets: 2,
        durationSec: 40,
        restSec: 10,
        imageUrl:
          "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
        instructions:
          "Bring one knee forward behind your wrist, extend the other leg back. Fold forward over the front leg. Hold, then switch.",
      },
      {
        id: "world-greatest-stretch",
        name: "World's Greatest Stretch",
        type: "reps",
        sets: 2,
        reps: 6,
        restSec: 15,
        imageUrl:
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
        instructions:
          "From a lunge, place same-side hand on the floor. Rotate other arm to the ceiling, return, then push hips back. 6 reps per side.",
      },
      {
        id: "child-pose",
        name: "Child's Pose",
        type: "duration",
        sets: 2,
        durationSec: 40,
        restSec: 10,
        imageUrl:
          "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
        instructions:
          "Kneel and sit back on heels, stretch arms forward on the floor, relax your forehead down. Breathe deeply into your back.",
      },
      {
        id: "standing-quad-stretch",
        name: "Standing Quad Stretch",
        type: "duration",
        sets: 2,
        durationSec: 30,
        restSec: 10,
        imageUrl:
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
        instructions:
          "Stand on one foot, pull the other heel to your glute. Hold a wall if needed. Feel the stretch through the front thigh.",
      },
    ],
  },
};