import { Wheat, Egg, Droplet } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { T } from "../theme";
import { CalorieRing } from "./CalorieRing";
import { MacroBar } from "./MacroBar";

type MacroValue = { value: number; goal: number };

type Props = {
  consumed: number;
  calorieGoal: number;
  carbs: MacroValue;
  protein: MacroValue;
  fat: MacroValue;
  goalLabel: string;
  onEditGoal?: () => void;
};

export function DailySummaryCard({
  consumed,
  calorieGoal,
  carbs,
  protein,
  fat,
  goalLabel,
  onEditGoal,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <CalorieRing consumed={consumed} goal={calorieGoal} />
        <View style={styles.macros}>
          <MacroBar
            icon={Wheat}
            label="Carbs"
            value={carbs.value}
            goal={carbs.goal}
          />
          <MacroBar
            icon={Egg}
            label="Protein"
            value={protein.value}
            goal={protein.goal}
          />
          <MacroBar
            icon={Droplet}
            label="Fat"
            value={fat.value}
            goal={fat.goal}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Goal: <Text style={styles.footerBold}>{goalLabel}</Text>
        </Text>
        <Text style={styles.footerLink} onPress={onEditGoal}>
          Edit →
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.glassBorder,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
  top: { flexDirection: "row", alignItems: "center", gap: 18 },
  macros: { flex: 1 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: T.glassBorder,
  },
  footerText: { fontFamily: T.bodyMed, fontSize: 11.5, color: T.muted },
  footerBold: { fontFamily: T.bodySemi, color: T.white },
  footerLink: { fontFamily: T.bodySemi, fontSize: 11.5, color: T.accent },
});
