import { View } from "react-native";
import { MacroBar } from "./DashboardComponents";
import { COLORS, NUTRITION_GOALS } from "@/src/theme";

/** Sample macro snapshot for the dashboard */
export function MacroSummary() {
  return (
    <View style={{ paddingHorizontal: 24, gap: 8 }}>
      <MacroBar label="Protein" value={142} max={NUTRITION_GOALS.protein} unit="g" color={COLORS.blue} />
      <MacroBar label="Carbs" value={198} max={NUTRITION_GOALS.carbs} unit="g" color={COLORS.orange} />
      <MacroBar label="Fat" value={54} max={NUTRITION_GOALS.fat} unit="g" color={COLORS.red} />
    </View>
  );
}
