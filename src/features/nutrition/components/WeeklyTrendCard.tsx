import { Flame } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { T } from "../theme";

type Day = { label: string; pct: number; isToday?: boolean };

type Props = {
  days: Day[];
  streak: number;
};

export function WeeklyTrendCard({ days, streak }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Calories logged, last 7 days</Text>

      <View style={styles.chart}>
        {days.map((d, i) => (
          <View key={i} style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { height: `${d.pct}%`, opacity: d.isToday ? 1 : 0.55 },
              ]}
            />
          </View>
        ))}
      </View>

      <View style={styles.labels}>
        {days.map((d, i) => (
          <Text key={i} style={styles.labelText}>
            {d.label}
          </Text>
        ))}
      </View>

      <View style={styles.streakRow}>
        <Flame size={13} color={T.accent} strokeWidth={2.4} />
        <Text style={styles.streak}>
          <Text style={styles.streakBold}>{streak}-day</Text> logging streak —
          your best this month
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
    borderRadius: 22,
    padding: 18,
  },
  title: { fontFamily: T.bodySemi, fontSize: 12, color: T.muted },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 9,
    height: 78,
    marginTop: 14,
  },
  barTrack: {
    flex: 1,
    height: "100%",
    borderRadius: 7,
    backgroundColor: T.glass,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: { width: "100%", borderRadius: 7, backgroundColor: T.accent },
  labels: { flexDirection: "row", gap: 9, marginTop: 8 },
  labelText: {
    flex: 1,
    textAlign: "center",
    fontFamily: T.bodyBold,
    fontSize: 9.5,
    color: T.muted,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 15,
  },
  streak: {
    fontFamily: T.bodyMed,
    fontSize: 11.5,
    color: T.muted,
    flexShrink: 1,
  },
  streakBold: { fontFamily: T.bodyBold, color: T.white },
});
