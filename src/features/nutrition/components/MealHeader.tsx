import { Flame } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { BrandWordmark } from "@/src/components/BrandWordmark";

type Props = {
  /** Unused — wordmark replaced the day eyebrow. Kept for call-site compat. */
  eyebrow?: string;
  title: string;
  caloriesLeft: number;
};

export function MealHeader({ title, caloriesLeft }: Props) {
  const { T, styles } = useThemedStyles(makeStyles);

  return (
    <View style={styles.pageBlock}>
      <View style={styles.titleRow}>
        <View style={styles.heading}>
          <BrandWordmark size={22} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.calChip}>
          <Flame size={12} color={T.onImage} strokeWidth={2.4} />
          <Text style={styles.calChipText}>
            {caloriesLeft.toLocaleString()} left
          </Text>
        </View>
      </View>
    </View>
  );
}

function makeStyles(T: AppTheme) {
  return StyleSheet.create({
    pageBlock: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 14,
    },
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
    },
    heading: {
      flex: 1,
      flexDirection: "row",
      alignItems: "baseline",
      flexWrap: "wrap",
      gap: 8,
      minWidth: 0,
    },
    title: {
      fontFamily: T.displayBold,
      fontSize: 22,
      color: T.white,
      letterSpacing: -0.3,
      flexShrink: 1,
    },
    calChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: T.accent,
      borderRadius: 999,
      paddingVertical: 7,
      paddingHorizontal: 12,
      flexShrink: 0,
    },
    calChipText: { fontFamily: T.bodyBold, fontSize: 11, color: T.onAccent },
  });
}
