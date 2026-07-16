import { ComponentType } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LucideProps } from "lucide-react-native";
import { T } from "../theme";

type Props = {
  icon: ComponentType<LucideProps>;
  label: string;
  value: number;
  goal: number;
  unit?: string;
};

// Distinguished by icon + label, not color — matches the workout card's
// monochrome-gold visual language rather than reintroducing multi-hue coding.
export function MacroBar({
  icon: Icon,
  label,
  value,
  goal,
  unit = "g",
}: Props) {
  const pct = Math.max(0, Math.min((value / goal) * 100, 100));

  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Icon size={13} color={T.accent} strokeWidth={2} />
      </View>
      <View style={styles.info}>
        <View style={styles.top}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>
            {value}
            {unit} / {goal}
            {unit}
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.glassBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: { fontFamily: T.bodySemi, fontSize: 12, color: T.white },
  value: { fontFamily: T.bodyMed, fontSize: 11, color: T.muted },
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: T.glass,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 3, backgroundColor: T.accent },
});
