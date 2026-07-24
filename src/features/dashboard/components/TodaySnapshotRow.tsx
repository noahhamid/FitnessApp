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
            <View style={styles.iconBadge}>
              <Icon size={15} color={T.accent} strokeWidth={2} />
            </View>
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
    paddingVertical: 14,
    alignItems: "center",
    gap: 7,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: T.ringGlass,
    borderWidth: 1,
    borderColor: T.ringBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  value: { fontFamily: T.displaySemi, fontSize: 13.5, color: T.white },
  label: { fontFamily: T.bodySemi, fontSize: 9, color: T.muted },
});
