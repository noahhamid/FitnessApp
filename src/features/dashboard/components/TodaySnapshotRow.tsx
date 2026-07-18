import { ComponentType } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Flame, Dumbbell, GlassWater, LucideProps } from "lucide-react-native";
import { T } from "../theme";

type Snapshot = {
  icon: ComponentType<LucideProps>;
  value: string;
  label: string;
};

export const SNAPSHOT_ICONS = {
  calories: Flame,
  workout: Dumbbell,
  water: GlassWater,
};

export function TodaySnapshotRow({ items }: { items: Snapshot[] }) {
  return (
    <View style={styles.row}>
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <View key={i} style={styles.card}>
            <Icon size={16} color={T.accent} strokeWidth={2} />
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 9 },
  card: {
    flex: 1,
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.glassBorder,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    gap: 5,
  },
  value: { fontFamily: T.display, fontSize: 13, color: T.white },
  label: { fontFamily: T.bodySemi, fontSize: 9, color: T.muted },
});
