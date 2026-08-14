import { Wheat, Egg, Droplet } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { GlassSurface } from "@/src/features/dashboard/components/GlassSurface";
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
  const { styles } = useThemedStyles(makeStyles);

  return (
    <GlassSurface style={styles.card}>
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
          Edit
        </Text>
      </View>
    </GlassSurface>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    card: {
      borderRadius: 22,
      padding: 20,
    },
    top: {
      flexDirection: "row",
      alignItems: "center",
      gap: 18,
      zIndex: 1,
    },
    macros: { flex: 1 },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 16,
      paddingTop: 14,
      borderTopWidth: 0.5,
      borderTopColor: T.glassBorder,
      zIndex: 1,
    },
    footerText: { fontFamily: T.bodyMed, fontSize: 11.5, color: T.muted },
    footerBold: { fontFamily: T.bodySemi, color: T.white },
    footerLink: { fontFamily: T.bodySemi, fontSize: 11.5, color: T.accent },
  });
}
