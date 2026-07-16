import { Flame } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { T } from "../theme";

type Props = {
  eyebrow: string;
  title: string;
  caloriesLeft: number;
  streakDays: number;
};

export function MealHeader({
  eyebrow,
  title,
  caloriesLeft,
  streakDays,
}: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.eyebrowRow}>
          <View style={styles.dot} />
          <Text style={styles.eyebrow}>{eyebrow}</Text>
        </View>
        <View style={styles.streakBadge}>
          <Flame size={12} color={T.accent} strokeWidth={2.4} />
          <Text style={styles.streakText}>{streakDays}-day streak</Text>
        </View>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.calChip}>
          <Flame size={12} color={T.bg} strokeWidth={2.4} />
          <Text style={styles.calChipText}>
            {caloriesLeft.toLocaleString()} left
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
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
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.glassBorder,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  streakText: { fontFamily: T.bodyBold, fontSize: 10.5, color: T.white },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: T.display,
    fontSize: 30,
    color: T.white,
    letterSpacing: -0.3,
  },
  calChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: T.accent,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  calChipText: { fontFamily: T.bodyBold, fontSize: 11, color: T.bg },
});
