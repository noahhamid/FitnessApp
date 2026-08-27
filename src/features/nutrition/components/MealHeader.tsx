import { StyleSheet, Text, View } from "react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";
import { AppIcon } from "@/src/components/AppIcon";

type Props = {
  /** Unused — kept for call-site compat. */
  eyebrow?: string;
  title: string;
  caloriesLeft: number;
};

export function MealHeader({ title, caloriesLeft }: Props) {
  const { styles } = useThemedStyles(makeStyles);

  return (
    <View style={styles.pageBlock}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.calChip}>
          <AppIcon name="calories" size={18} />
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
    title: {
      flex: 1,
      fontFamily: T.displayBold,
      fontSize: 28,
      color: T.white,
      letterSpacing: -0.5,
      minWidth: 0,
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
