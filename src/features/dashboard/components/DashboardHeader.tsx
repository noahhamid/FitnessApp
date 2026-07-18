import { Flame, User } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { T } from "../theme";

type Props = {
  greeting: string; // "Good afternoon"
  name: string;
  streakDays: number;
};

export function DashboardHeader({ greeting, name, streakDays }: Props) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.name}>{name}</Text>
      </View>

      <View style={styles.right}>
        <View style={styles.streakBadge}>
          <Flame size={13} color={T.accent} strokeWidth={2.4} />
          <Text style={styles.streakText}>{streakDays}</Text>
        </View>
        <View style={styles.avatar}>
          <User size={17} color={T.accent} strokeWidth={2} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  greeting: { fontFamily: T.bodyMed, fontSize: 12, color: T.muted },
  name: { fontFamily: T.display, fontSize: 23, color: T.white, marginTop: 1 },
  right: { flexDirection: "row", alignItems: "center", gap: 10 },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.glassBorder,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  streakText: { fontFamily: T.bodyBold, fontSize: 11, color: T.white },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: T.ringGlass,
    borderWidth: 1.5,
    borderColor: T.ringBorder,
    alignItems: "center",
    justifyContent: "center",
  },
});
