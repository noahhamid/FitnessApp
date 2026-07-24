// src/lib/gymFoods.ts
export type GymFood = {
  name: string;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
};

// Curated for people training — protein-dense, realistic per-serving values.
export const GYM_FOODS: GymFood[] = [
  { name: "Grilled chicken breast (150g)", cal: 248, protein: 46, carbs: 0, fat: 5 },
  { name: "Greek yogurt (200g)", cal: 146, protein: 20, carbs: 8, fat: 4 },
  { name: "Whey protein shake", cal: 120, protein: 24, carbs: 3, fat: 1 },
  { name: "Salmon fillet (150g)", cal: 312, protein: 34, carbs: 0, fat: 18 },
  { name: "Tuna, canned in water", cal: 128, protein: 28, carbs: 0, fat: 1 },
  { name: "Cottage cheese (200g)", cal: 194, protein: 24, carbs: 6, fat: 8 },
  { name: "3 whole eggs", cal: 234, protein: 19, carbs: 1, fat: 16 },
  { name: "Egg whites (200g)", cal: 104, protein: 22, carbs: 1, fat: 0 },
  { name: "Turkey breast (150g)", cal: 195, protein: 42, carbs: 0, fat: 2 },
  { name: "Lean beef, 5% fat (150g)", cal: 258, protein: 39, carbs: 0, fat: 10 },
  { name: "Tofu, firm (200g)", cal: 176, protein: 20, carbs: 4, fat: 10 },
  { name: "Lentils, cooked (200g)", cal: 230, protein: 18, carbs: 40, fat: 1 },
  { name: "Oats with milk (80g oats)", cal: 380, protein: 16, carbs: 60, fat: 8 },
  { name: "Rice + chicken bowl", cal: 520, protein: 40, carbs: 60, fat: 10 },
  { name: "Peanut butter (2 tbsp)", cal: 190, protein: 8, carbs: 6, fat: 16 },
  { name: "Almonds (30g)", cal: 174, protein: 6, carbs: 6, fat: 15 },
  { name: "Protein bar", cal: 210, protein: 20, carbs: 22, fat: 7 },
  { name: "Skyr yogurt (200g)", cal: 120, protein: 22, carbs: 8, fat: 0 },
  { name: "Shrimp (150g)", cal: 150, protein: 32, carbs: 1, fat: 2 },
  { name: "Quinoa, cooked (150g)", cal: 180, protein: 7, carbs: 32, fat: 3 },
];