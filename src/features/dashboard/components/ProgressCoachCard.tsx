import { Scale, Sparkles } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import { T } from "../theme";

type Props = {
  progressLabel: string; // "Weight this month"
  progressValue: string; // "-1.2 kg"
  sparklinePoints: number[]; // e.g. [19,17,21,13,15,7,9,3] — raw y-values, lower = higher on chart
  coachHeadline: string;
  coachBody: string;
};

export function ProgressCoachCard({
  progressLabel,
  progressValue,
  sparklinePoints,
  coachHeadline,
  coachBody,
}: Props) {
  const width = 220;
  const height = 26;
  const step = width / (sparklinePoints.length - 1);
  const points = sparklinePoints.map((y, i) => `${i * step},${y}`).join(" ");

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.icon}>
          <Scale size={16} color={T.accent} strokeWidth={2} />
        </View>
        <View style={styles.body}>
          <View style={styles.topRow}>
            <Text style={styles.label}>{progressLabel}</Text>
            <Text style={styles.value}>{progressValue}</Text>
          </View>
          <Svg
            width="100%"
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={styles.spark}
          >
            <Polyline
              points={points}
              fill="none"
              stroke={T.accent}
              strokeWidth={2}
            />
          </Svg>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottom}>
        <View style={styles.eyebrowRow}>
          <Sparkles size={11} color={T.accent} strokeWidth={2.2} />
          <Text style={styles.eyebrow}>COACH'S NOTE</Text>
        </View>
        <Text style={styles.headline}>{coachHeadline}</Text>
        <Text style={styles.coachBody}>{coachBody}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.glassBorder,
    borderRadius: 20,
    overflow: "hidden",
  },
  top: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: T.ringGlass,
    borderWidth: 1.5,
    borderColor: T.ringBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  label: { fontFamily: T.bodySemi, fontSize: 11, color: T.muted },
  value: { fontFamily: T.display, fontSize: 14, color: T.accent },
  spark: { marginTop: 6 },
  divider: { height: 1, backgroundColor: T.glassBorder, marginHorizontal: 18 },
  bottom: { padding: 16, paddingTop: 14 },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  eyebrow: {
    fontFamily: T.bodyBold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: T.accent,
  },
  headline: {
    fontFamily: T.display,
    fontSize: 13.5,
    color: T.white,
    marginBottom: 3,
  },
  coachBody: {
    fontFamily: T.bodyMed,
    fontSize: 11,
    color: T.muted,
    lineHeight: 16,
  },
});
