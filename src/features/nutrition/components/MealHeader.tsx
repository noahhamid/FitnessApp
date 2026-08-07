import { Flame } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { useThemedStyles } from "@/src/context/useThemedStyles";
import type { AppTheme } from "@/src/theme";

type Props = {
  /** Day context (e.g. "Mon · Diet"). */
  eyebrow?: string;
  title: string;
  caloriesLeft: number;
};

export function MealHeader({ eyebrow, title, caloriesLeft }: Props) {
  const { T, styles } = useThemedStyles(makeStyles);

  return (
    <View style={styles.pageBlock}>
      {!!eyebrow && (
        <View style={styles.eyebrowRow}>
          <View style={styles.dot} />
          <Text style={styles.eyebrow}>{eyebrow}</Text>
        </View>
      )}

      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
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
      gap: 10,
    },
    eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: T.accent },
    eyebrow: {
      fontFamily: T.bodyBold,
      fontSize: 10.5,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: T.muted,
    },
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
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
