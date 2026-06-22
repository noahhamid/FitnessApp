export type NutritionGoalInput = {
  weightKg: number;
  heightCm: number;
  age: number;
  goalId: string;
  gender?: "male" | "female";
};

export type NutritionGoalResult = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note: string;
};

export function calculateNutritionGoals(input: NutritionGoalInput): NutritionGoalResult {
  const { weightKg, heightCm, age, goalId, gender = "male" } = input;

  // Mifflin-St Jeor BMR
  const bmr =
    gender === "female"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
      : 10 * weightKg + 6.25 * heightCm - 5 * age + 5;

  // TDEE — assume lightly active (1.375)
  const tdee = Math.round(bmr * 1.375);

  let calories: number;
  let note: string;

  switch (goalId) {
    case "lose":
      calories = Math.round(tdee - 500);
      note = "A 500 kcal daily deficit supports steady fat loss of ~0.5kg per week.";
      break;
    case "build":
      calories = Math.round(tdee + 300);
      note = "A 300 kcal surplus supports lean muscle gain while minimizing fat.";
      break;
    case "endure":
      calories = Math.round(tdee + 200);
      note = "Slightly above maintenance to fuel endurance training and recovery.";
      break;
    case "health":
    default:
      calories = tdee;
      note = "Maintenance calories to support overall health and wellbeing.";
      break;
  }

  calories = Math.max(calories, 1200);

  let proteinRatio: number;
  let fatRatio: number;

  switch (goalId) {
    case "lose":
      proteinRatio = 0.35;
      fatRatio = 0.30;
      break;
    case "build":
      proteinRatio = 0.30;
      fatRatio = 0.25;
      break;
    case "endure":
      proteinRatio = 0.20;
      fatRatio = 0.25;
      break;
    case "health":
    default:
      proteinRatio = 0.25;
      fatRatio = 0.30;
      break;
  }

  const carbRatio = 1 - proteinRatio - fatRatio;

  const protein = Math.round((calories * proteinRatio) / 4);
  const fat = Math.round((calories * fatRatio) / 9);
  const carbs = Math.round((calories * carbRatio) / 4);

  return { calories, protein, carbs, fat, note };
}
